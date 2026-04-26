from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


@receiver(post_save, sender='tasks.TaskClarification')
def on_clarification_created(sender, instance, created, **kwargs):
    if not created:
        return

    from notifications.models import Notification

    task = instance.task
    task.last_updated_at = timezone.now()
    task.save(update_fields=['last_updated_at'])

    # collect users: idea authors + users who favorited the task
    from ideas.models import Idea
    from tasks.models import UserFavoriteTask

    idea_author_ids = set(
        Idea.objects.filter(task=task).values_list('author_id', flat=True)
    )
    favorite_user_ids = set(
        UserFavoriteTask.objects.filter(task=task).values_list('user_id', flat=True)
    )
    user_ids = idea_author_ids | favorite_user_ids

    notifications = [
        Notification(
            user_id=uid,
            type=Notification.TYPE_CLARIFICATION,
            message=f'К заданию «{task.title}» добавлено уточнение.',
            related_task=task,
        )
        for uid in user_ids
    ]
    Notification.objects.bulk_create(notifications)
