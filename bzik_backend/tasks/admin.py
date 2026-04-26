from django.contrib import admin
from .models import Task, TaskClarification, UserFavoriteTask


class TaskClarificationInline(admin.TabularInline):
    model = TaskClarification
    extra = 0
    readonly_fields = ('created_at', 'created_by')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'is_closed', 'created_at', 'last_updated_at', 'deadline')
    list_filter = ('is_closed',)
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'last_updated_at', 'created_by')
    inlines = [TaskClarificationInline]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(UserFavoriteTask)
class UserFavoriteTaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'task', 'created_at')
