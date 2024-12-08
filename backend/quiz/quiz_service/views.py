import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Question, Quiz, UserQuizCompletion
from .serializers import QuestionSerializer, QuizSerializer, QuizCompletionSerializer, OptionSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone


class QuestionCreateView(APIView):
    def post(self, request, format=None):
        serializer = QuestionSerializer(data=request.data)
        if serializer.is_valid():
            # Xác minh khóa học tồn tại
            course_id = serializer.validated_data.get('course')
            course_response = requests.get(f'http://127.0.0.1:8000/api/courses/{course_id}/')
            if course_response.status_code == 200:
                # Lưu câu hỏi nếu khóa học tồn tại
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuizListView(APIView):
    def get(self, request, format=None):

        token = request.headers.get('Authorization')

        # Gọi endpoint của dịch vụ ngoài để lấy danh sách khóa học đã đăng ký
        register_course_url = "http://127.0.0.1:8000/api/list-register-course/"
        headers = {'Authorization': token}

        try:
            response = requests.get(register_course_url, headers=headers)
            response.raise_for_status()
            registered_course_data = response.json()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Không thể lấy danh sách khóa học đã đăng ký', 'details': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

        registered_course_ids = registered_course_data.get('registered_course_ids', [])

        if not registered_course_ids:
            return Response({'error': 'Người dùng chưa đăng ký khóa học nào'}, status=status.HTTP_403_FORBIDDEN)

        # Lấy các câu hỏi từ các khóa học đã đăng ký
        questions = Question.objects.filter(course_id__in=registered_course_ids)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListQuizView(APIView):
    def get(self, request, format=None):

        token = request.headers.get('Authorization')

        # Gọi endpoint của dịch vụ ngoài để lấy danh sách khóa học đã đăng ký
        register_course_url = "http://127.0.0.1:8000/api/list-register-course/"
        headers = {'Authorization': token}

        try:
            response = requests.get(register_course_url, headers=headers)
            response.raise_for_status()
            registered_course_data = response.json()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Không thể lấy danh sách khóa học đã đăng ký', 'details': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

        registered_course_ids = registered_course_data.get('registered_course_ids', [])

        if not registered_course_ids:
            return Response({'error': 'Người dùng chưa đăng ký khóa học nào'}, status=status.HTTP_403_FORBIDDEN)

        # Lấy các câu hỏi từ các khóa học đã đăng ký
        quizs = Quiz.objects.filter(course_id__in=registered_course_ids)
        serializer = QuizSerializer(quizs, many=True)
        user_id, role = get_user_id_from_token(request)
        for data in serializer.data:
            quiz_complete = UserQuizCompletion.objects.filter(user_id=user_id, quiz_id=data['id']).first()
            if quiz_complete:
                data['is_completed'] = quiz_complete.is_completed
                data['score'] = quiz_complete.score
        return Response(serializer.data, status=status.HTTP_200_OK)


class DetailQuiz(APIView):
    def get(self, request, quiz_id):
        # Retrieve the specific Quiz instance by ID
        quiz = get_object_or_404(Quiz, id=quiz_id)

        # Retrieve all questions related to this quiz
        questions = quiz.questions.all()

        # Serialize the question data
        serializer = QuestionSerializer(questions, many=True)

        # Return the serialized data
        return Response(serializer.data, status=status.HTTP_200_OK)


def get_user_id_from_token(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

    # Gọi API để lấy thông tin người dùng từ token
    profile_url = "http://127.0.0.1:4000/api/profile/"
    headers = {'Authorization': token}

    try:
        response = requests.get(profile_url, headers=headers)
        response.raise_for_status()  # Gây ra lỗi nếu status code không phải 2xx
    except requests.exceptions.RequestException as e:
        return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                        status=status.HTTP_401_UNAUTHORIZED)

    # Lấy dữ liệu người dùng từ response
    user_data = response.json()
    user_id = user_data.get('id')

    if not user_id:
        return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

    role = user_data.get('role')

    return user_id, role


class SubmitQuiz(APIView):
    def post(self, request, quiz_id):
        user_id, role = get_user_id_from_token(request)

        # Lấy quiz từ quiz_id
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra xem người dùng đã hoàn thành quiz chưa
        score = request.data['score']
        user_quiz_completion, created = UserQuizCompletion.objects.get_or_create(
            user_id=user_id,
            quiz_id=quiz,
            score=score,
            defaults={
                'is_completed': True,
                'completed_at': timezone.now()
            }
        )

        if created:
            # Nếu người dùng chưa hoàn thành, lưu thông tin hoàn thành
            return Response({'message': 'Quiz đã hoàn thành thành công'}, status=status.HTTP_201_CREATED)
        else:
            # Nếu người dùng đã hoàn thành trước đó
            return Response({'message': 'Người dùng đã hoàn thành quiz này trước đó'}, status=status.HTTP_200_OK)


class CheckSubmit(APIView):

    def get(self, request, quiz_id):
        # Lấy token từ header
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Gọi API để lấy thông tin người dùng từ token
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}

        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()  # Gây ra lỗi nếu status code không phải 2xx
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu người dùng từ response
        user_data = response.json()
        user_id = user_data.get('id')

        if not user_id:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            # Kiểm tra xem người dùng đã hoàn thành quiz chưa
            is_completed = UserQuizCompletion.objects.filter(user_id=user_id, quiz_id=quiz_id).exists()

            return Response({"is_completed": is_completed}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Đã xảy ra lỗi khi kiểm tra quiz", "details": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)


class ManageQuizView(APIView):
    def get_user_info(self, token):
        """Helper method to fetch user information from profile API."""
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException:
            return None

    def get_approved_courses(self, token):
        """Helper method to fetch approved courses using external API."""
        courses_url = "http://127.0.0.1:8000/api/all-courses/"
        headers = {'Authorization': token}
        try:
            response = requests.get(courses_url, headers=headers)
            response.raise_for_status()
            return response.json()  # Assumes the API returns a list of courses
        except requests.exceptions.RequestException as e:
            return None

    def post(self, request, course_id, format=None):
        """Thêm quiz mới."""
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = self.get_user_info(token)
        if not user_data:
            return Response({'error': 'Xác thực người dùng thất bại'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = user_data.get('id')
        role = user_data.get('role')

        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể thêm quiz'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra xem khóa học có thuộc về người dùng không
        # try:
        #     course = Course.objects.get(id=course_id, created_by=user_id)
        # except Course.DoesNotExist:
        #     return Response({'error': 'Không tìm thấy khóa học hoặc bạn không có quyền thêm quiz'}, status=status.HTTP_404_NOT_FOUND)

        existing_quiz = Quiz.objects.filter(course_id=course_id, name=request.data.get('name')).exists()
        if existing_quiz:
            return Response({'error': 'Tên quiz đã tồn tại trong khóa học này.'}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo quiz mới
        serializer = QuizSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(course_id=course_id)
            return Response({'message': 'Quiz được thêm thành công.', 'data': serializer.data},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Lấy ra bộ câu hỏi của các khóa học giảng viên phê duyệt
    def get(self, request, format=None):
        # Lấy token từ headers
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy thông tin người dùng
        user_data = self.get_user_info(token)
        if not user_data:
            return Response({'error': 'Xác thực người dùng thất bại'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = user_data.get('id')
        role = user_data.get('role')

        if not user_id or not role:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Chỉ cho phép giảng viên truy cập
        if role != 'lecturer':
            return Response({'error': 'Bạn không có quyền xem danh sách quiz'}, status=status.HTTP_403_FORBIDDEN)

        # Lấy danh sách khóa học từ API
        approved_courses = self.get_approved_courses(token)
        if not approved_courses:
            return Response({'message': 'Không thể lấy danh sách khóa học từ API.'}, status=status.HTTP_404_NOT_FOUND)

        course_ids = [course['id'] for course in approved_courses]
        # Lấy danh sách quiz liên quan đến các khóa học đã được phê duyệt
        quizzes = Quiz.objects.filter(course_id__in=course_ids)
        if not quizzes.exists():
            return Response({'message': 'Không có quiz nào trong các khóa học được phê duyệt.'},
                            status=status.HTTP_200_OK)

        # Chuyển đổi dữ liệu thành JSON
        serializer = QuizSerializer(quizzes, many=True)
        for data in serializer.data:
            for course in approved_courses:
                if data['course_id'] == course['id']:
                    data['course_name'] = course['title']
                    break
        return Response(serializer.data, status=status.HTTP_200_OK)


    def put(self, request, quiz_id, format=None):
        """Sửa thông tin quiz."""
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = self.get_user_info(token)
        if not user_data:
            return Response({'error': 'Xác thực người dùng thất bại'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = user_data.get('id')
        role = user_data.get('role')

        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể sửa quiz'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra xem quiz có thuộc về khóa học của người dùng không
        quiz = Quiz.objects.get(id=quiz_id)
        # try:
        #     quiz = Quiz.objects.get(id=quiz_id)
        #     course = Course.objects.get(id=quiz.course_id, created_by=user_id)
        # except (Quiz.DoesNotExist, Course.DoesNotExist):
        #     return Response({'error': 'Không tìm thấy quiz hoặc bạn không có quyền sửa'}, status=status.HTTP_404_NOT_FOUND)

        # Cập nhật quiz
        serializer = QuizSerializer(quiz, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Quiz được cập nhật thành công.', 'data': serializer.data},
                            status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, quiz_id, format=None):
        """Xóa quiz."""
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = self.get_user_info(token)
        if not user_data:
            return Response({'error': 'Xác thực người dùng thất bại'}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = user_data.get('id')
        role = user_data.get('role')

        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể xóa quiz'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra xem quiz có thuộc về khóa học của người dùng không
        quiz = Quiz.objects.get(id=quiz_id)
        # try:
        #     quiz = Quiz.objects.get(id=quiz_id)
        #     course = Course.objects.get(id=quiz.course_id, created_by=user_id)
        # except (Quiz.DoesNotExist, Course.DoesNotExist):
        #     return Response({'error': 'Không tìm thấy quiz hoặc bạn không có quyền xóa'}, status=status.HTTP_404_NOT_FOUND)

        # Xóa quiz
        quiz.delete()
        return Response({'message': 'Quiz đã được xóa thành công.'}, status=status.HTTP_204_NO_CONTENT)


class ManageQuestionView(APIView):

    def post(self, request, quiz_id, format=None):
        """Thêm câu hỏi mới cho quiz."""
        # xác thực
        user_id, role = get_user_id_from_token(request)
        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể thêm câu hỏi'}, status=status.HTTP_403_FORBIDDEN)
        # Kiểm tra xem quiz có tồn tại không
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'error': 'Không tìm thấy quiz'}, status=status.HTTP_404_NOT_FOUND)

        # Kiểm tra câu hỏi trong quiz có tồn tại không
        question = Question.objects.filter(quiz_id=quiz_id, text=request.data['question']['text']).first()
        if question:
            return Response({'error': 'Câu hỏi đã tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        data = {
            'text': request.data['question']['text'],
            'course_id': request.data['question']['course_id'],
            'options': request.data['options']  # Truyền trực tiếp options từ payload
        }

        serializer = QuestionSerializer(data=data)
        if serializer.is_valid():
            # Lưu question với quiz
            question = serializer.save(quiz=quiz)
            return Response(
                {
                    'message': 'Câu hỏi được thêm thành công.',
                    'data': QuestionSerializer(question).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ManageOptionView(APIView):

    def post(self, request, question_id, format=None):
        """Thêm đáp án mới cho câu hỏi."""
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Gọi API để lấy thông tin người dùng từ token
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}

        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()  # Gây ra lỗi nếu status code không phải 2xx
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)},
                            status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')
        role = user_data.get('role')

        if role != "lecturer":
            return Response({'error': 'Chỉ giảng viên mới có thể thêm đáp án'}, status=status.HTTP_403_FORBIDDEN)

        # Kiểm tra xem câu hỏi có tồn tại không
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Không tìm thấy câu hỏi'}, status=status.HTTP_404_NOT_FOUND)

        # Tạo đáp án mới
        serializer = OptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(question=question)
            return Response({'message': 'Đáp án được thêm thành công.', 'data': serializer.data},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
