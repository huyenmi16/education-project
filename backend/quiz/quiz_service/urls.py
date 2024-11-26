from django.urls import path
from .views import QuizListView, QuestionCreateView,ListQuizView,DetailQuiz,SubmitQuiz,CheckSubmit,ManageQuizView

urlpatterns = [
    path('questions/', QuizListView.as_view(), name='questions-by-course'),
    path('courses/questions/', QuestionCreateView.as_view(), name='questions-by-course'),
    path('list-quiz/', ListQuizView.as_view(), name='questions-by-course'),
    path('quiz/<int:quiz_id>/', DetailQuiz.as_view(), name='quiz-questions'),
    path('submit-quiz/<int:quiz_id>/', SubmitQuiz.as_view(), name='submit-quiz'),
    path('check-submit/<int:quiz_id>/', CheckSubmit.as_view(), name='submit-quiz'),
    path('courses/<int:course_id>/quizzes/', ManageQuizView.as_view()),  # Thêm quiz
    path('quizzes/<int:quiz_id>/', ManageQuizView.as_view()),           # Sửa, xóa quiz

]
