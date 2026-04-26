from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'type', 'message', 'is_read', 'created_at',
                  'related_task', 'related_idea')
        read_only_fields = fields
