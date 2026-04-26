from django.urls import path
from .admin_views import TaskIdeasExportView, MiscIdeasView
from rewards.views import AssignRewardView

urlpatterns = [
    path('tasks/<int:pk>/export/', TaskIdeasExportView.as_view(), name='admin-task-export'),
    path('ideas/<int:pk>/reward/', AssignRewardView.as_view(), name='admin-assign-reward'),
    path('misc/ideas/', MiscIdeasView.as_view(), name='admin-misc-ideas'),
]
