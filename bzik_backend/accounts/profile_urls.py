from django.urls import path
from . import views

urlpatterns = [
    path('me/', views.ProfileView.as_view(), name='profile-me'),
    path('me/ideas/', views.MyIdeasView.as_view(), name='profile-ideas'),
    path('me/balance/', views.BalanceView.as_view(), name='profile-balance'),
    path('me/comments/', views.MyCommentsView.as_view(), name='profile-comments'),
    path('me/yookassa/link/', views.YookassaLinkView.as_view(), name='profile-yookassa-link'),
]
