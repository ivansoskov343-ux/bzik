from django.urls import path
from . import views

urlpatterns = [
    path('', views.TaskListCreateView.as_view(), name='task-list'),
    path('<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/close/', views.TaskCloseView.as_view(), name='task-close'),
    path('<int:pk>/clarifications/', views.TaskClarificationListCreateView.as_view(), name='task-clarifications'),
    path('<int:pk>/favorite/', views.FavoriteToggleView.as_view(), name='task-favorite'),
]
