from django.db import models

class Quiz(models.Model):
    course_id = models.IntegerField()  # ID khóa học
    name = models.CharField(max_length=255)  # Tên bộ câu hỏi
    image = models.ImageField(upload_to='quiz_images/', null=True, blank=True)  # Hình ảnh
    duration = models.DurationField()  # Thời gian thực hiện
    quiz_time = models.DateTimeField()  # Thời gian làm bài
    

    def __str__(self):
        return self.name

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)  # Liên kết đến bộ câu hỏi
    text = models.CharField(max_length=255)  # Nội dung câu hỏi
    course_id = models.IntegerField()

    def __str__(self):
        return self.text

class Option(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)  # Liên kết đến câu hỏi
    text = models.CharField(max_length=255)  # Nội dung đáp án
    is_correct = models.BooleanField(default=False)  # Đánh dấu đáp án đúng

    def __str__(self):
        return self.text
    

class UserQuizCompletion(models.Model):
    user_id= models.IntegerField()  # Người dùng
    quiz_id= models.ForeignKey(Quiz, on_delete=models.CASCADE)  # Bộ câu hỏi
    is_completed = models.BooleanField(default=False)  # Trạng thái hoàn thành
    completed_at = models.DateTimeField(null=True, blank=True)  # Thời gian hoàn thành (nếu có)
    score = models.DecimalField(
        max_digits=4,  # Tổng số chữ số tối đa (bao gồm cả phần thập phân)
        decimal_places=2,  # Số chữ số thập phân
        null=True,  # Cho phép giá trị null
        blank=True,  # Cho phép để trống trong form
        default=0.00  # Giá trị mặc định
    )


    
