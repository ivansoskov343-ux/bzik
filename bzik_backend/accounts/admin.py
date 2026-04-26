from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'nickname', 'email_verified', 'balance_points', 'is_staff')
    list_filter = ('email_verified', 'is_staff', 'is_active')
    search_fields = ('email', 'nickname')
    ordering = ('email',)
    fieldsets = UserAdmin.fieldsets + (
        ('Платформа', {'fields': ('nickname', 'avatar', 'email_verified',
                                  'balance_points', 'yookassa_account_id')}),
    )
