from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer, UserProfileSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, YookassaLinkSerializer
)
from .tasks import send_verification_email, send_password_reset_email
from .tokens import load_token, SALT_EMAIL_VERIFY, SALT_PASSWORD_RESET

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        send_verification_email.delay(user.id, user.email)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(
            {'detail': 'Аккаунт создан. Проверьте email для подтверждения.'},
            status=status.HTTP_201_CREATED
        )


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        user_id = load_token(token, SALT_EMAIL_VERIFY)
        if not user_id:
            return Response({'detail': 'Ссылка недействительна или истекла.'}, status=400)
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Пользователь не найден.'}, status=404)
        user.email_verified = True
        user.is_active = True
        user.save(update_fields=['email_verified', 'is_active'])
        return Response({'detail': 'Email подтверждён. Можете войти.'})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data['refresh'])
            token.blacklist()
        except Exception:
            return Response({'detail': 'Неверный токен.'}, status=400)
        return Response({'detail': 'Вы вышли из системы.'})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = PasswordResetRequestSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=s.validated_data['email'])
            send_password_reset_email.delay(user.id, user.email)
        except User.DoesNotExist:
            pass  # don't leak user existence
        return Response({'detail': 'Если email зарегистрирован, письмо отправлено.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = PasswordResetConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user_id = load_token(s.validated_data['token'], SALT_PASSWORD_RESET)
        if not user_id:
            return Response({'detail': 'Ссылка недействительна или истекла.'}, status=400)
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'Пользователь не найден.'}, status=404)
        if user.email.lower() != s.validated_data['email'].lower():
            return Response({'detail': 'Email не совпадает с адресом, на который была отправлена ссылка.'}, status=400)
        user.set_password(s.validated_data['password'])
        user.save(update_fields=['password'])
        return Response({'detail': 'Пароль успешно изменён.'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class MyIdeasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from ideas.models import Idea
        from ideas.serializers import IdeaListSerializer
        ideas = Idea.objects.filter(author=request.user).select_related('task')
        return Response(IdeaListSerializer(ideas, many=True).data)


class MyCommentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from ideas.models import Comment
        comments = (
            Comment.objects
            .filter(author=request.user)
            .select_related('idea__task')
            .order_by('-created_at')
        )
        data = [
            {
                'id': c.id,
                'text': c.text,
                'created_at': c.created_at,
                'idea_id': c.idea_id,
                'task_id': c.idea.task_id,
                'task_title': c.idea.task.title if c.idea.task else None,
            }
            for c in comments
        ]
        return Response(data)


class BalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'balance_points': user.balance_points,
            'yookassa_linked': bool(user.yookassa_account_id),
        })


class YookassaLinkView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        s = YookassaLinkSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        request.user.yookassa_account_id = s.validated_data['yookassa_account_id']
        request.user.save(update_fields=['yookassa_account_id'])
        return Response({'detail': 'Счёт привязан.'})

