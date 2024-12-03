from django.db import models

# Mô hình Khóa học (Course) 
class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.CharField(max_length=255)
    duration = models.DurationField(help_text="Duration in HH:MM:SS format")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    image = models.ImageField(upload_to='course_images/', blank=True, null=True)  # Thêm trường ảnh
    is_approved = models.BooleanField(default=False)
    create_by = models.IntegerField()

    def __str__(self):
        return self.title

# Mô hình Chương học (Chapter)
class Chapter(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, related_name='chapters', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"

# Mô hình Bài học (Lesson)
class Lesson(models.Model):
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('article', 'Article'),
        ('quiz', 'Quiz'),
        ('document', 'Document'),
    ]
    
    title = models.CharField(max_length=255)
    chapter = models.ForeignKey(Chapter, related_name='lessons', on_delete=models.CASCADE)
    content = models.TextField()
    duration = models.DurationField(help_text="Duration in HH:MM:SS format")
    type = models.CharField(max_length=50, choices=LESSON_TYPE_CHOICES)
    
    def __str__(self):
        return f"{self.title} - {self.chapter.title}"


class CourseRegistration(models.Model):
    user_id = models.IntegerField()  # Storing user ID instead of a ForeignKey to User
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    registration_date = models.DateTimeField(auto_now_add=True)
    is_registered = models.BooleanField(default=False) 


class CourseReview(models.Model):
    user_id = models.IntegerField()  # Store user ID as IntegerField
    course_id = models.ForeignKey(Course, related_name='reviews', on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(help_text="Rating should be between 1 and 5")  # Assume 1-5 rating scale
    review = models.TextField(blank=True, null=True)  # Optional review text
    review_date = models.DateTimeField(auto_now_add=True)
    trained = models.BooleanField(default=False)
    name = models.CharField(max_length=255,default="")