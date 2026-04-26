from django.urls import path
from . import views

urlpatterns = [
    path('yookassa/webhook/', views.YookassaWebhookView.as_view(), name='yookassa-webhook'),
]
