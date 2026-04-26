from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from tasks.permissions import IsAdminUser
from .models import Idea, Comment
from .serializers import (
    IdeaListSerializer, IdeaDetailSerializer, IdeaCreateSerializer,
    IdeaStatusSerializer, CommentSerializer
)


class IdeaListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IdeaCreateSerializer
        return IdeaListSerializer

    def get_queryset(self):
        qs = Idea.objects.select_related('author', 'task')
        task_id = self.request.query_params.get('task')
        if task_id == 'misc' or task_id is None and self.request.query_params.get('misc'):
            qs = qs.filter(task__isnull=True)
        elif task_id:
            qs = qs.filter(task_id=task_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class IdeaDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = IdeaDetailSerializer
    queryset = Idea.objects.select_related('author', 'task').prefetch_related(
        'files', 'comments__author'
    )


class IdeaStatusView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = IdeaStatusSerializer
    queryset = Idea.objects.all()
    http_method_names = ['patch']

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        idea = self.get_object()
        if idea.status == Idea.STATUS_WINNER:
            from notifications.models import Notification
            Notification.objects.create(
                user=idea.author,
                type=Notification.TYPE_WINNER,
                message=f'Ваша идея признана победителем в задании «{idea.task.title if idea.task else "Прочее"}»!',
                related_idea=idea,
                related_task=idea.task,
            )
        return response


class CommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(idea_id=self.kwargs['pk']).select_related('author')

    def perform_create(self, serializer):
        idea = get_object_or_404(Idea, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, idea=idea)
