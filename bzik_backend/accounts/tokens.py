from django.contrib.auth import get_user_model
from django.core import signing

User = get_user_model()

SALT_EMAIL_VERIFY = 'email-verify'
SALT_PASSWORD_RESET = 'password-reset'
TOKEN_MAX_AGE = 86400  # 24h


def make_token(user_id: int, salt: str) -> str:
    return signing.dumps(user_id, salt=salt)


def load_token(token: str, salt: str) -> int | None:
    try:
        return signing.loads(token, salt=salt, max_age=TOKEN_MAX_AGE)
    except signing.BadSignature:
        return None
