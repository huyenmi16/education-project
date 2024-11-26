from django.core.management.base import BaseCommand
from course_service.utils import export_ratings

class Command(BaseCommand):
    help = 'Export all course reviews to CSV'

    def handle(self, *args, **kwargs):
        export_ratings()
        self.stdout.write(self.style.SUCCESS('Ratings exported successfully!'))
