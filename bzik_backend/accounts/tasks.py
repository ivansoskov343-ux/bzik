from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from .tokens import make_token, SALT_EMAIL_VERIFY, SALT_PASSWORD_RESET


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email(self, user_id: int, user_email: str):
    token = make_token(user_id, SALT_EMAIL_VERIFY)
    url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    try:
        send_mail(
            subject='Подтвердите email',
            message=f'Перейдите по ссылке для подтверждения аккаунта:\n{url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email(self, user_id: int, user_email: str):
    token = make_token(user_id, SALT_PASSWORD_RESET)
    url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    try:
        send_mail(
            subject='Сброс пароля',
            message=f'Ссылка для сброса пароля:\n{url}\n\nСсылка действительна 24 часа.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
        )
    except Exception as exc:
        raise self.retry(exc=exc)
