from django.core.management.base import BaseCommand
from course_service.utils import export_courses

class Command(BaseCommand):
    help = 'Export all courses to CSV'

    def handle(self, *args, **kwargs):
        export_courses()
        self.stdout.write(self.style.SUCCESS('Courses exported successfully!'))
