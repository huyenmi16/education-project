from django.urls import path
from .views import QuizListView, QuestionCreateView, ListQuizView, DetailQuiz, SubmitQuiz, CheckSubmit, ManageQuizView, \
    ManageQuestionView, ManageQuizSetView

urlpatterns = [
    path('questions/', QuizListView.as_view(), name='questions-by-course'),
    path('courses/questions/', QuestionCreateView.as_view(), name='questions-by-course'),
    path('list-quiz/', ListQuizView.as_view(), name='questions-by-course'),
    path('quiz/detail/<int:quiz_id>/', DetailQuiz.as_view(), name='quiz-questions'),
    path('submit-quiz/<int:quiz_id>/', SubmitQuiz.as_view(), name='submit-quiz'),
    path('check-submit/<int:quiz_id>/', CheckSubmit.as_view(), name='submit-quiz'),
    # path('courses/<int:course_id>/quizzes/', ManageQuizView.as_view()),  # Thêm quiz
    # path('quizzes/<int:quiz_id>/', ManageQuizView.as_view()),           # Sửa, xóa quiz
    path('quiz/get-by-course/<int:course_id>/', ManageQuizView.as_view(), name='manage_quiz'),

    path('quiz/<int:course_id>/', ManageQuizView.as_view(), name='manage_quiz'),  # Tạo bộ câu hỏi
    path('quiz/update-quiz/<int:quiz_id>/', ManageQuizView.as_view(), name='manage_quiz_update'),
    path('quiz/<int:quiz_id>/delete/', ManageQuizView.as_view(), name='delete_quiz_and_questions'),
    path('get-all-quiz/', ManageQuizSetView.as_view(), name='get-all-quiz-by-teacher'),
    # hiển thị tất cả bộ quizz nv duy nhất

    path('quiz/<int:quiz_id>/questions/', ManageQuestionView.as_view(), name='add_question'),  # POST QUESTION
    path('questions/<int:question_id>/', ManageQuestionView.as_view(),
         name='manage_question_update'),  # PUT
    path('questions/<int:question_id>/', ManageQuestionView.as_view(), name='manage_question_delete') # DELETE QUESTION
]
