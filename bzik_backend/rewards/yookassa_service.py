import uuid
from django.conf import settings
import yookassa
from yookassa import Payout


def configure():
    yookassa.Configuration.account_id = settings.YOOKASSA_SHOP_ID
    yookassa.Configuration.secret_key = settings.YOOKASSA_SECRET_KEY


def create_payout(recipient_yookassa_id: str, amount: str, description: str) -> dict:
    configure()
    idempotency_key = str(uuid.uuid4())
    payout = Payout.create({
        'amount': {
            'value': str(amount),
            'currency': 'RUB',
        },
        'payout_destination_data': {
            'type': 'yoo_money',
            'account_number': recipient_yookassa_id,
        },
        'description': description,
    }, idempotency_key)
    return {
        'id': payout.id,
        'status': payout.status,
    }
