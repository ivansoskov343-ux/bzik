import json
import logging

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ideas.models import Idea
from notifications.models import Notification
from tasks.permissions import IsAdminUser
from .models import Reward
from .serializers import RewardCreateSerializer
from .yookassa_service import create_payout

logger = logging.getLogger(__name__)


class AssignRewardView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        idea = get_object_or_404(Idea, pk=pk)
        s = RewardCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        reward_type = s.validated_data['reward_type']
        amount = s.validated_data['amount']
        recipient = idea.author

        reward = Reward.objects.create(
            idea=idea,
            recipient=recipient,
            assigned_by=request.user,
            reward_type=reward_type,
            amount=amount,
        )

        if reward_type == Reward.TYPE_POINTS:
            recipient.balance_points += int(amount)
            recipient.save(update_fields=['balance_points'])
            reward.status = Reward.STATUS_PAID
            reward.paid_at = timezone.now()
            reward.save(update_fields=['status', 'paid_at'])
            Notification.objects.create(
                user=recipient,
                type=Notification.TYPE_REWARD,
                message=f'Вам начислено {int(amount)} баллов за идею.',
                related_idea=idea,
                related_task=idea.task,
            )
        else:
            if not recipient.yookassa_account_id:
                reward.delete()
                return Response(
                    {'detail': 'Получатель не привязал счёт YooKassa.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                result = create_payout(
                    recipient.yookassa_account_id,
                    str(amount),
                    f'Вознаграждение за идею #{idea.pk}',
                )
                reward.yookassa_payout_id = result['id']
                reward.status = Reward.STATUS_PROCESSING
                reward.save(update_fields=['yookassa_payout_id', 'status'])
            except Exception as e:
                logger.error('YooKassa payout error: %s', e)
                reward.status = Reward.STATUS_FAILED
                reward.save(update_fields=['status'])
                return Response({'detail': 'Ошибка выплаты. Попробуйте позже.'}, status=500)

        return Response({'detail': 'Вознаграждение назначено.', 'reward_id': reward.pk})


class YookassaWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        try:
            payload = json.loads(request.body)
        except Exception:
            return Response(status=400)

        event = payload.get('event')
        obj = payload.get('object', {})
        payout_id = obj.get('id')

        if not payout_id:
            return Response(status=400)

        try:
            reward = Reward.objects.get(yookassa_payout_id=payout_id)
        except Reward.DoesNotExist:
            return Response(status=200)

        if event == 'payout.succeeded':
            reward.status = Reward.STATUS_PAID
            reward.paid_at = timezone.now()
            reward.save(update_fields=['status', 'paid_at'])
            Notification.objects.create(
                user=reward.recipient,
                type=Notification.TYPE_REWARD,
                message=f'Выплата {reward.amount} ₽ успешно зачислена.',
                related_idea=reward.idea,
                related_task=reward.idea.task,
            )
        elif event == 'payout.canceled':
            reward.status = Reward.STATUS_FAILED
            reward.save(update_fields=['status'])

        return Response(status=200)
