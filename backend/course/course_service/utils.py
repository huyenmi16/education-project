import csv
from .models import Course, CourseReview

def export_courses():
    courses = Course.objects.all()
    with open('courses.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'title', 'description', 'instructor', 'duration', 'price', 'level', 'image']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for course in courses:
            writer.writerow({
                'id': course.id,  # Thêm trường id
                'title': course.title,
                'description': course.description,
                'instructor': course.instructor,
                'duration': str(course.duration),
                'price': course.price,
                'level': course.level,
                'image': course.image.url if course.image else None,
            })

def export_ratings():
    reviews = CourseReview.objects.all()
    with open('ratings.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'user_id', 'course_id', 'rating', 'review', 'review_date']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for review in reviews:
            writer.writerow({
                'id': review.id,  # Thêm trường id
                'user_id': review.user_id,
                'course_id': review.course_id.id,
                'rating': review.rating,
                'review': review.review,
                'review_date': review.review_date,
            })
