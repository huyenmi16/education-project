from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('lecturer', 'Giảng viên'),
        ('student', 'Sinh viên'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    username = models.CharField(max_length=30)
    email = models.EmailField(max_length=25)
    personal_email = models.EmailField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='user_images/', null=True, blank=True)  # Hình ảnh
    image_certificate = models.ImageField(upload_to='certificate_images/', null=True, blank=True)
    id_card = models.CharField(max_length=15, blank=True, null=True)
    is_approved = models.BooleanField(default=False)

    groups = models.ManyToManyField(
        Group,
        related_name='user_service_user_set',  # Thêm related_name duy nhất
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='user_service_user_permissions_set',  # Thêm related_name duy nhất
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    def __str__(self):
        return self.email
