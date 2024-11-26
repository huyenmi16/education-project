from django.contrib import admin
from .models import Question, Option,Quiz

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'course_id')  # Hiển thị các trường trong danh sách
    search_fields = ('text',)  # Cho phép tìm kiếm theo nội dung câu hỏi
   

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'text', 'is_correct')  # Hiển thị các trường trong danh sách
    search_fields = ('text',)  # Cho phép tìm kiếm theo nội dung đáp án
    list_filter = ('is_correct',)  # Bộ lọc theo đáp án đúng

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'course_id', 'duration', 'quiz_time')
    list_filter = ('course_id', 'quiz_time')
    search_fields = ('name', 'course_id')
  

