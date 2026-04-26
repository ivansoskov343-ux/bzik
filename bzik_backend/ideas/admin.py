from django.contrib import admin
from .models import Idea, IdeaFile, Comment


class IdeaFileInline(admin.TabularInline):
    model = IdeaFile
    extra = 0
    readonly_fields = ('original_name', 'content_type', 'uploaded_at')


@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'task', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('text', 'author__email', 'author__nickname')
    readonly_fields = ('created_at', 'author', 'task', 'text')
    inlines = [IdeaFileInline]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'idea', 'created_at')
    readonly_fields = ('created_at',)
