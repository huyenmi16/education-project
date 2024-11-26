from rest_framework import serializers
from .models import Course, Chapter, Lesson, CourseRegistration,CourseReview

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content',  'duration', 'type', 'chapter']  # bao gồm 'chapter' nếu cần thiết

class ChapterSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)  # Bao gồm các bài học liên quan

    class Meta:
        model = Chapter
        fields = ['id', 'title', 'lessons', 'course']  # bao gồm 'course' nếu cần thiết

class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)  # Bao gồm các chương học liên quan

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'instructor', 'duration', 'price', 'level', 'chapters','image','is_approved','create_by']
        read_only_fields = ['is_approved','create_by', 'instructor']

class CourseRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRegistration
        fields = '__all__'




class CourseReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseReview
        fields = ['user_id', 'course_id', 'rating', 'review', 'review_date']
        read_only_fields = ['user_id', 'course_id', 'review_date']

    def validate_rating(self, value):
        """Xác minh rằng giá trị đánh giá nằm trong khoảng từ 1 đến 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating phải nằm trong khoảng từ 1 đến 5.")
        return value
