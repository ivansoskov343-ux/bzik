from django.conf import settings
from django.db import models


class Idea(models.Model):
    STATUS_SUBMITTED = 'submitted'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_REJECTED = 'rejected'
    STATUS_WINNER = 'winner'
    STATUS_CHOICES = [
        (STATUS_SUBMITTED, 'Отправлено'),
        (STATUS_IN_PROGRESS, 'В работе'),
        (STATUS_REJECTED, 'Отклонено'),
        (STATUS_WINNER, 'Победитель'),
    ]

    task = models.ForeignKey(
        'tasks.Task', on_delete=models.CASCADE, null=True, blank=True,
        related_name='ideas'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ideas'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SUBMITTED)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Идея'
        verbose_name_plural = 'Идеи'

    def __str__(self):
        return f'Идея #{self.pk} от {self.author}'


class IdeaFile(models.Model):
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='idea_files/%Y/%m/')
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    idea = models.ForeignKey(Idea, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'

    def __str__(self):
        return f'Комментарий #{self.pk} к идее #{self.idea_id}'
