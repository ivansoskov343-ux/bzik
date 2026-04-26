from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = 'IdeaHub — Панель управления'
admin.site.site_title = 'IdeaHub'
admin.site.index_title = 'Управление платформой'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/profile/', include('accounts.profile_urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/ideas/', include('ideas.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin/', include('tasks.admin_urls')),
    path('api/payments/', include('rewards.payment_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
