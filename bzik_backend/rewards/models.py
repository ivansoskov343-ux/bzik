from django.conf import settings
from django.db import models


class Reward(models.Model):
    TYPE_POINTS = 'points'
    TYPE_MONEY = 'money'
    TYPE_CHOICES = [
        (TYPE_POINTS, 'Баллы'),
        (TYPE_MONEY, 'Деньги'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_PAID = 'paid'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Ожидание'),
        (STATUS_PROCESSING, 'В обработке'),
        (STATUS_PAID, 'Выплачено'),
        (STATUS_FAILED, 'Ошибка'),
    ]

    idea = models.ForeignKey(
        'ideas.Idea', on_delete=models.CASCADE, related_name='rewards'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rewards'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='assigned_rewards'
    )
    reward_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    yookassa_payout_id = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Вознаграждение'
        verbose_name_plural = 'Вознаграждения'

    def __str__(self):
        return f'Вознаграждение #{self.pk} — {self.get_reward_type_display()} {self.amount} → {self.recipient}'
