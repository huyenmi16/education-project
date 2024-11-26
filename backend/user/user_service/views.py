from rest_framework.views import APIView
from .serializers import StudentSerializer, LecturerRegistrationSerializer,LoginStudentSerializer, UserInfoSerializer, ChangePasswordSerializer,UpdateProfileSerializer, LoginLecturerSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from .models import User
from .utils import generate_access_token, generate_refresh_token
from rest_framework.permissions import IsAuthenticated
from .authentication import SafeJWTAuthentication


class StudentRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Kiểm tra xem username, email, hoặc phone_number đã tồn tại chưa
        username = request.data.get('username')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Tên đăng nhập đã tồn tại!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email đã tồn tại!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(phone_number=phone_number).exists():
            return Response({'error': 'Số điện thoại đã tồn tại!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Sử dụng serializer để validate và xử lý dữ liệu đầu vào
        serializer = StudentSerializer(data=request.data)
        if serializer.is_valid():
            # Tạo mới người dùng sinh viên nếu dữ liệu hợp lệ
            student = serializer.save()
            return Response({
                'message': 'Sinh viên đăng ký thành công!',
                'student': {
                    'id': student.id,
                    'username': student.username,
                    'email': student.email,
                    'role': student.role,
                    'phone_number': student.phone_number,
                    'address': student.address,

                }
            }, status=status.HTTP_201_CREATED)
        
        # Trả về lỗi nếu dữ liệu không hợp lệ
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LecturerRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Kiểm tra xem username, email, hoặc phone_number đã tồn tại chưa
        username = request.data.get('username')
        email = request.data.get('email')
        phone_number = request.data.get('phone_number')
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Tên đăng nhập đã tồn tại!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email đã tồn tại!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(phone_number=phone_number).exists():
            return Response({'error': 'Số điện thoại đã tồn tại!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Sử dụng serializer để validate và xử lý dữ liệu đầu vào
        serializer = LecturerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Lưu thông tin giảng viên với is_active và is_approved = False
            lecturer = serializer.save(is_active=False, is_approved=False)  # Chờ phê duyệt

            # Thông báo tới admin để phê duyệt giảng viên mới đăng ký
            admin_email = settings.EMAIL_HOST_USER
            send_mail(
                subject='Yêu cầu phê duyệt tài khoản giảng viên',
                message=f"Giảng viên {lecturer.username} đã đăng ký và chờ phê duyệt.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin_email],  # Gửi tới email của admin
            )

            return Response({'message': 'Đăng ký thành công, tài khoản đang chờ phê duyệt.'}, status=status.HTTP_201_CREATED)
        
        # Nếu dữ liệu không hợp lệ, trả về lỗi
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginStudentSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            access_token = generate_access_token(user)
            refresh_token = generate_refresh_token(user)

            user_serializer = UserInfoSerializer(user)

            return Response({
                'user': user_serializer.data,
                'refresh': refresh_token,
                'access': access_token,
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginLectureView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginLecturerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            access_token = generate_access_token(user)
            refresh_token = generate_refresh_token(user)

            user_serializer = UserInfoSerializer(user)

            return Response({
                'user': user_serializer.data,
                'refresh': refresh_token,
                'access': access_token,
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes=[SafeJWTAuthentication]
    def get(self, request):
        user = request.user
        serializer = UserInfoSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SafeJWTAuthentication]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SafeJWTAuthentication]

    def put(self, request):
        serializer = UpdateProfileSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyTokenView(APIView):
    authentication_classes = [SafeJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'message': 'Token is valid.'}, status=status.HTTP_200_OK)