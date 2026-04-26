from django.conf import settings
from django.db import models
from django.db.models import Count
from django.utils import timezone


class TaskQuerySet(models.QuerySet):
    def annotate_idea_count(self):
        return self.annotate(ideas_count=Count('ideas'))


class Task(models.Model):
    objects = TaskQuerySet.as_manager()
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='created_tasks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated_at = models.DateTimeField(default=timezone.now)
    deadline = models.DateTimeField(null=True, blank=True)
    is_closed = models.BooleanField(default=False)
    reward_hint = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-last_updated_at']
        verbose_name = 'Задание'
        verbose_name_plural = 'Задания'

    def __str__(self):
        return self.title


class TaskClarification(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='clarifications')
    text = models.TextField(verbose_name='Текст уточнения')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
        verbose_name='Автор'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата')

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Уточнение'
        verbose_name_plural = 'Уточнения'

    def __str__(self):
        return f'Уточнение к «{self.task}» от {self.created_at:%d.%m.%Y}'


class UserFavoriteTask(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_tasks',
        verbose_name='Пользователь'
    )
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='favorited_by',
        verbose_name='Задание'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата')

    class Meta:
        unique_together = ('user', 'task')
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'
