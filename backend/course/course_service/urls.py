from django.urls import path
from .views import (CourseListView, CourseDetailView, CourseRegistrationView,ListUserCourseRegistrationsAPIView,
                    CheckRegistration,UserCourseReviewView,ManageCourseView,
                    CreateChapterView,CreateLessonView,GetAllCourse,GetAllLessonsView,CourseRecommendView)

urlpatterns = [
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
    path('register-course/', CourseRegistrationView.as_view(), name='course-register'),
    path('list-register-course/', ListUserCourseRegistrationsAPIView.as_view(), name='list-course-register'),
    path('check-registration/<int:course_id>/', CheckRegistration.as_view(), name='check-course-register'),
    path('course/<int:course_id>/review/', UserCourseReviewView.as_view(), name='user-course-review'),
    path('add-courses/', ManageCourseView.as_view(), name='create_course'),
    path('update-delete/<int:course_id>/', ManageCourseView.as_view(), name='manage_course'),


    path('courses/<int:course_id>/chapters/', CreateChapterView.as_view(), name='create_chapter'),  # Tạo chương
    path('update-delete-chapter/<int:chapter_id>/', CreateChapterView.as_view(), name='update_delete_chapter'),  # Sửa, xóa chương
    path('chapters/<int:chapter_id>/lessons/', CreateLessonView.as_view(), name='create_lesson'),  # Tạo bài học
    path('update-delete-lesson/<int:lesson_id>/', CreateLessonView.as_view(), name='update_delete_lesson'),  # Sửa, xóa bài học
    path('all-courses/', GetAllCourse.as_view(), name='manage_courses'),
    path('all-chapters/<int:course_id>/', GetAllLessonsView.as_view(), name='manage_courses'),

    path('recommendation/', CourseRecommendView.as_view(), name='recommendation'),
]
