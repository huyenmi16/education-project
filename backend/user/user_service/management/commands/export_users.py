import csv
from django.core.management.base import BaseCommand
from user_service.models import User  # Thay 'yourapp' bằng tên ứng dụng của bạn

class Command(BaseCommand):
    help = 'Export User data to CSV'

    def handle(self, *args, **kwargs):
        # Truy vấn tất cả người dùng
        users = User.objects.all()
        
        # Mở file CSV để ghi
        with open('users.csv', 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['id', 'username', 'email', 'phone_number', 'address', 'is_active', 'image']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Ghi header vào file CSV
            writer.writeheader()
            
            # Ghi từng người dùng vào file
            for user in users:
                writer.writerow({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'phone_number': user.phone_number,
                    'address': user.address,
                    'is_active': user.is_active,
                    'image': user.image.url if user.image else None,
                })
        
        self.stdout.write(self.style.SUCCESS('Successfully exported users to users.csv'))
