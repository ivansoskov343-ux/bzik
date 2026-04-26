from django.contrib import admin
from .models import Reward


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient', 'reward_type', 'amount', 'status', 'created_at', 'paid_at')
    list_filter = ('reward_type', 'status')
    readonly_fields = ('created_at', 'paid_at', 'yookassa_payout_id')
