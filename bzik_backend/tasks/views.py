from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task, TaskClarification, UserFavoriteTask
from .permissions import IsAdminUser
from .serializers import (
    TaskListSerializer, TaskDetailSerializer, TaskCreateSerializer,
    TaskClarificationSerializer
)


class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    search_fields = ['title', 'description']
    ordering_fields = ['last_updated_at', 'created_at']
    ordering = ['-last_updated_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskListSerializer

    def get_queryset(self):
        return Task.objects.prefetch_related('favorited_by').annotate_idea_count()

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Только администратор может создавать задания.')
        serializer.save(created_by=self.request.user)


class TaskDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = TaskDetailSerializer
    queryset = Task.objects.prefetch_related('clarifications__created_by', 'favorited_by')


class TaskCloseView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        task.is_closed = True
        task.save(update_fields=['is_closed'])
        return Response({'detail': 'Задание закрыто.'})


class TaskClarificationListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskClarificationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        return TaskClarification.objects.filter(task_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        task = get_object_or_404(Task, pk=self.kwargs['pk'])
        serializer.save(task=task, created_by=self.request.user)


class FavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        fav, created = UserFavoriteTask.objects.get_or_create(user=request.user, task=task)
        if not created:
            fav.delete()
            return Response({'favorited': False})
        return Response({'favorited': True}, status=status.HTTP_201_CREATED)
