from django.utils import timezone
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from .models import Task, TaskClarification, UserFavoriteTask


class TaskClarificationSerializer(serializers.ModelSerializer):
    created_by = UserPublicSerializer(read_only=True)

    class Meta:
        model = TaskClarification
        fields = ('id', 'text', 'created_at', 'created_by')
        read_only_fields = ('id', 'created_at', 'created_by')


class TaskListSerializer(serializers.ModelSerializer):
    is_recently_updated = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    ideas_count = serializers.IntegerField(source='ideas.count', read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'reward_hint', 'created_at', 'last_updated_at',
            'deadline', 'is_closed', 'is_recently_updated', 'is_favorited', 'ideas_count'
        )

    def get_is_recently_updated(self, obj):
        from datetime import timedelta
        return obj.last_updated_at > timezone.now() - timedelta(days=2)

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class TaskDetailSerializer(serializers.ModelSerializer):
    clarifications = TaskClarificationSerializer(many=True, read_only=True)
    created_by = UserPublicSerializer(read_only=True)
    is_recently_updated = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'reward_hint', 'created_by',
            'created_at', 'last_updated_at', 'deadline', 'is_closed',
            'clarifications', 'is_recently_updated', 'is_favorited'
        )

    def get_is_recently_updated(self, obj):
        from datetime import timedelta
        return obj.last_updated_at > timezone.now() - timedelta(days=2)

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'reward_hint', 'deadline')

    def update(self, instance, validated_data):
        # title and description are immutable after creation
        validated_data.pop('title', None)
        validated_data.pop('description', None)
        return super().update(instance, validated_data)
