from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
import sys

from recomendation.course_recommendation import CourseRecommender, CollaborativeFiltering

current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(current_dir)

from .models import Course, CourseRegistration, CourseReview, Chapter, Lesson
from .serializers import CourseSerializer
from rest_framework import status
from .serializers import CourseRegistrationSerializer, CourseReviewSerializer, ChapterSerializer, LessonSerializer
import requests
from rest_framework.exceptions import AuthenticationFailed
from django.core.mail import send_mail
from django.conf import settings


class CourseListView(APIView):
    def get(self, request, format=None):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)


class CourseDetailView(APIView):
    def get(self, request, course_id, format=None):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Khóa học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course)
        return Response(serializer.data)


class CourseRegistrationView(APIView):
    def post(self, request, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Gọi dịch vụ người dùng để lấy dữ liệu profile
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}

        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()  # Gây ra lỗi nếu status code không tốt
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu người dùng từ response
        user_data = response.json()
        user_id = user_data.get('id')

        if not user_id:
            return Response({'error': 'Dữ liệu profile người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Kiểm tra xem người dùng đã đăng ký khóa học chưa
        course_id = request.data.get('course')
        if CourseRegistration.objects.filter(user_id=user_id, course_id=course_id).exists():
            return Response({'error': 'Người dùng đã đăng ký khóa học này'}, status=status.HTTP_400_BAD_REQUEST)

        # Khi đã có user_id và người dùng chưa đăng ký khóa học, tạo bản ghi đăng ký
        serializer = CourseRegistrationSerializer(data={'user_id': user_id, 'course': course_id, 'is_registed': True})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListUserCourseRegistrationsAPIView(APIView):

    def get(self, request):
        # Lấy token từ header
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}

        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()  # Gây ra lỗi nếu status code không tốt
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu người dùng từ response
        user_data = response.json()
        user_id = user_data.get('id')

        if not user_id:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Truy vấn tất cả các CourseRegistration có user_id tương ứng
        course_registrations = CourseRegistration.objects.filter(user_id=user_id)

        # Lấy danh sách các id của course đã đăng ký
        course_ids = course_registrations.values_list('course_id', flat=True)

        # Trả về danh sách id của các khóa học dưới dạng JSON
        return Response({'registered_course_ids': list(course_ids)})


class CheckRegistration(APIView):

    def get(self, request, course_id):
        # Lấy token từ header
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}

        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()  # Gây ra lỗi nếu status code không tốt
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu người dùng từ response
        user_data = response.json()
        user_id = user_data.get('id')

        if not user_id:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # is_registered = CourseRegistration.objects.filter(user_id=user_id,course_id=course_id)

        try:
            # Kiểm tra xem người dùng đã đăng ký khóa học chưa
            is_registered = CourseRegistration.objects.filter(user_id=user_id, course_id=course_id).exists()
            return Response({"is_registered": is_registered})
        except CourseRegistration.DoesNotExist:
            return Response({"detail": "Course not found"}, status=404)


class UserCourseReviewView(APIView):
    # Xử lý POST yêu cầu tạo đánh giá khóa học
    def post(self, request, course_id, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Gọi dịch vụ người dùng để lấy dữ liệu profile
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}

        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu người dùng từ response
        user_data = response.json()
        user_id = user_data.get('id')
        username = user_data.get('username')

        if not user_id:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Kiểm tra xem người dùng đã đăng ký khóa học chưa
        if not CourseRegistration.objects.filter(user_id=user_id, course_id=course_id).exists():
            return Response({'error': 'Người dùng chưa đăng ký khóa học này'}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem người dùng đã đánh giá khóa học này chưa
        if CourseReview.objects.filter(user_id=user_id, course_id=course_id).exists():
            return Response({'error': 'Người dùng đã đánh giá khóa học này'}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy đối tượng khóa học từ course_id
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Khóa học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        # Tạo đánh giá mới
        serializer = CourseReviewSerializer(data=request.data)
        if serializer.is_valid():
            # Lưu đánh giá mới với thông tin user_id và khóa học
            serializer.save(user_id=user_id, course_id=course, name=username)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Xử lý GET yêu cầu lấy danh sách đánh giá của khóa học
    def get(self, request, course_id, format=None):
        # Lấy tất cả đánh giá của khóa học theo course_id
        reviews = CourseReview.objects.filter(course_id=course_id)
        # Serialize và trả về dữ liệu
        serializer = CourseReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class ManageCourseView(APIView):

    def post(self, request, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy thông tin người dùng từ profile API
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        username = user_data.get('username')  # Lấy username người dùng
        role = user_data.get('role')

        if not user_id or not role:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Chỉ giảng viên mới được thêm khóa học
        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể thêm khóa học'}, status=status.HTTP_403_FORBIDDEN)

        # Tạo khóa học mới và gán tên giảng viên
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            # Gán người tạo khóa học là giảng viên và khóa học chưa được phê duyệt
            serializer.save(instructor=username, create_by=user_id, is_approved=False)

            admin_email = settings.EMAIL_HOST_USER
            send_mail(
                subject='Yêu cầu phê duyệt khóa học của giảng viên',
                message=f"Giảng viên {username} đã đăng tạo khóa học và chờ phê duyệt.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],  # Gửi tới email của admin
            )
            return Response(
                {'message': 'Tạo khóa học thành công, khóa học đang chờ phê duyệt.', 'data': serializer.data},
                status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, course_id, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy thông tin người dùng từ profile API
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or not role:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy khóa học cần sửa
        try:
            course = Course.objects.get(id=course_id, created_by=user_id)
        except Course.DoesNotExist:
            return Response({'error': 'Không tìm thấy khóa học hoặc bạn không có quyền sửa'},
                            status=status.HTTP_404_NOT_FOUND)

        # Chỉ giảng viên mới được sửa khóa học
        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể sửa khóa học'}, status=status.HTTP_403_FORBIDDEN)

        # Cập nhật khóa học
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, course_id, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy thông tin người dùng từ profile API
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or not role:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy khóa học cần xóa
        try:
            course = Course.objects.get(id=course_id, created_by=user_id)
        except Course.DoesNotExist:
            return Response({'error': 'Không tìm thấy khóa học hoặc bạn không có quyền xóa'},
                            status=status.HTTP_404_NOT_FOUND)

        # Chỉ giảng viên mới được xóa khóa học
        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể xóa khóa học'}, status=status.HTTP_403_FORBIDDEN)

        # Xóa khóa học
        course.delete()
        return Response({'message': 'Đã xóa khóa học thành công'}, status=status.HTTP_204_NO_CONTENT)


class GetAllCourse(APIView):
    def get(self, request, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy thông tin người dùng từ profile API
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or not role:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Chỉ lấy danh sách khóa học mà người dùng đã tạo và đã được phê duyệt
        approved_courses = Course.objects.filter(create_by=user_id, is_approved=True)

        # Chuyển đổi dữ liệu thành JSON
        serializer = CourseSerializer(approved_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


#  chapter


class CreateChapterView(APIView):
    def post(self, request, course_id, format=None):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or role != 'lecturer':
            return Response({'error': 'Chỉ giảng viên mới có thể thêm chương học'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra khóa học có thuộc về giảng viên này hay không
        try:
            course = Course.objects.get(id=course_id, create_by=user_id)
        except Course.DoesNotExist:
            return Response({'error': 'Khóa học không tồn tại hoặc bạn không có quyền thêm chương học'},
                            status=status.HTTP_404_NOT_FOUND)

        # Thêm chương học vào khóa học
        serializer = ChapterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course=course)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, chapter_id, format=None):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or role != 'lecturer':
            return Response({'error': 'Chỉ giảng viên mới có thể chỉnh sửa chương học'},
                            status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra chương học và khóa học có thuộc về giảng viên không
        try:
            chapter = Chapter.objects.get(id=chapter_id, course__create_by=user_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chương học không tồn tại hoặc bạn không có quyền chỉnh sửa'},
                            status=status.HTTP_404_NOT_FOUND)

        # Cập nhật chương học
        serializer = ChapterSerializer(chapter, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, chapter_id, format=None):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or role != 'lecturer':
            return Response({'error': 'Chỉ giảng viên mới có thể xóa chương học'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra chương học và khóa học có thuộc về giảng viên không
        try:
            chapter = Chapter.objects.get(id=chapter_id, course__create_by=user_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chương học không tồn tại hoặc bạn không có quyền xóa'},
                            status=status.HTTP_404_NOT_FOUND)

        # Xóa chương học
        chapter.delete()
        return Response({'message': 'Xóa chương học thành công'}, status=status.HTTP_204_NO_CONTENT)



class GetAllLessonsView(APIView):
    def get(self, request, course_id, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy thông tin người dùng từ profile API
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Kiểm tra xem người dùng có quyền truy cập vào khóa học hay không
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Khóa học không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        # Nếu người dùng là giảng viên, họ chỉ có thể xem các khóa học họ tạo
        if role == 'lecturer' and course.create_by != user_id:
            return Response({'error': 'Bạn không có quyền truy cập vào khóa học này'}, status=status.HTTP_403_FORBIDDEN)

        # Nếu người dùng là admin hoặc học viên, cho phép xem danh sách bài học
        lessons = Chapter.objects.filter(course=course)
        serializer = ChapterSerializer(lessons, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)




class CreateLessonView(APIView):
    def post(self, request, chapter_id, format=None):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or role != 'lecturer':
            return Response({'error': 'Chỉ giảng viên mới có thể thêm bài học'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra chương học có thuộc về khóa học của giảng viên hay không
        try:
            chapter = Chapter.objects.get(id=chapter_id, course__create_by=user_id)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chương học không tồn tại hoặc bạn không có quyền thêm bài học'},
                            status=status.HTTP_404_NOT_FOUND)

        # Thêm bài học vào chương học
        serializer = LessonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(chapter=chapter)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, lesson_id, format=None):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or role != 'lecturer':
            return Response({'error': 'Chỉ giảng viên mới có thể chỉnh sửa bài học'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra bài học có thuộc về chương học của giảng viên hay không
        try:
            lesson = Lesson.objects.get(id=lesson_id, chapter__course__create_by=user_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Bài học không tồn tại hoặc bạn không có quyền chỉnh sửa'},
                            status=status.HTTP_404_NOT_FOUND)

        # Cập nhật bài học
        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, lesson_id, format=None):
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or role != 'lecturer':
            return Response({'error': 'Chỉ giảng viên mới có thể xóa bài học'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra bài học có thuộc về chương học của giảng viên không
        try:
            lesson = Lesson.objects.get(id=lesson_id, chapter__course__create_by=user_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Bài học không tồn tại hoặc bạn không có quyền xóa'},
                            status=status.HTTP_404_NOT_FOUND)

        # Xóa bài học
        lesson.delete()
        return Response({'message': 'Xóa bài học thành công'}, status=status.HTTP_204_NO_CONTENT)


class CourseRecommendView(APIView):
    def __init__(self):
        super().__init__()
        self.recommender = CourseRecommender()

    def post(self, request, format=None):
        try:
            user_id = request.data.get('user_id')
            course_id = request.data.get('course_id')
            rating = request.data.get('rating')

            reviews = CourseReview.objects.filter(user_id=user_id)
            # Serialize và trả về dữ liệu
            serializer = CourseReviewSerializer(reviews, many=True)
            rated_courses = []
            for data in serializer.data:
                rated_courses.append(data['course_id'])
            recommendations = self.recommender.recommend_courses(
                user_id=user_id,
                course_id=course_id,
                rating=rating,
                rated_courses=rated_courses
            )
            return Response(recommendations)
            # course_ids = recommendations
            #
            # res = self.recommender.get_detailed_recommendations(course_details, filtered_recommendations)
            #
            # return rated_courses
            # rated_courses = CourseReview.objects.filter(user_id=user_id)
            # serializer = CourseSerializer(rated_courses, many=True)
            # return Response(serializer.data)
            # rated_coursess = rated_courses
            # recommendations = self.recommender.recommend_courses(
            #     user_id=user_id,
            #     course_id=course_id,
            #     rating=rating
            # )
            #
            # return Response(recommendations)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=500)

