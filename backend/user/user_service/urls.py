from django.urls import path
from .views import  StudentRegistrationView,LecturerRegistrationView, LoginView, UserProfileView, ChangePasswordView, UpdateProfileView, VerifyTokenView,LoginLectureView

urlpatterns = [
    path('register-student/', StudentRegistrationView.as_view(), name='register-student'),
    path('register-teacher/', LecturerRegistrationView.as_view(), name='register-teacher'),
    path('login/', LoginView.as_view(), name='login'),
    path('login-teacher/', LoginLectureView.as_view(), name='login-teacher'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-token'),
]
