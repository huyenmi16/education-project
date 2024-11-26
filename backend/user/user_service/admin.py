from django.contrib import admin

# Register your models here.

from django.core.mail import send_mail
from django.conf import settings
from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'is_approved']
    list_filter = ['is_approved', 'role']
    actions = ['approve_lecturers']

    def approve_lecturers(self, request, queryset):
        # Duyệt các giảng viên và kích hoạt tài khoản
        for lecturer in queryset:
            if not lecturer.is_approved:
                lecturer.is_approved = True
                lecturer.is_active = True
                lecturer.save()

                # Gửi email thông báo phê duyệt đến email cá nhân của giảng viên
                send_mail(
                    subject='Tài khoản giảng viên đã được phê duyệt',
                    message=f"Xin chào {lecturer.username}, tài khoản của bạn đã được phê duyệt. Bạn có thể đăng nhập và sử dụng hệ thống.",
                    from_email=settings.DEFAULT_FROM_EMAIL,  
                    recipient_list=[lecturer.personal_email],  # Gửi đến email cá nhân của giảng viên
                )


        self.message_user(request, "Đã phê duyệt thành công các giảng viên và gửi email thông báo.")
    approve_lecturers.short_description = "Phê duyệt các giảng viên được chọn"
