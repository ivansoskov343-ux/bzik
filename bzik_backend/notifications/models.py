from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CLARIFICATION = 'clarification'
    TYPE_REWARD = 'reward'
    TYPE_WINNER = 'winner'
    TYPE_CHOICES = [
        (TYPE_CLARIFICATION, 'Уточнение к заданию'),
        (TYPE_REWARD, 'Вознаграждение'),
        (TYPE_WINNER, 'Победитель'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_task = models.ForeignKey(
        'tasks.Task', on_delete=models.SET_NULL, null=True, blank=True
    )
    related_idea = models.ForeignKey(
        'ideas.Idea', on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'

    def __str__(self):
        return f'Уведомление для {self.user}: {self.get_type_display()}'
