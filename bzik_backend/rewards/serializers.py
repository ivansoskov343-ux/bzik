from decimal import Decimal
from rest_framework import serializers
from .models import Reward


class RewardCreateSerializer(serializers.Serializer):
    reward_type = serializers.ChoiceField(choices=Reward.TYPE_CHOICES)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('1'))


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ('id', 'idea', 'recipient', 'reward_type', 'amount', 'status',
                  'created_at', 'paid_at')
        read_only_fields = fields
