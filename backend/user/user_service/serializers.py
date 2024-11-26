from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from .models import User

class StudentSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=True)  # Thêm trường role

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 'role', 'phone_number', 'address', 'is_active', 'image']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        validate_password(data['password'])  # Kiểm tra độ mạnh mật khẩu
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # Xóa trường confirm_password sau khi xác nhận
        validated_data['password'] = make_password(validated_data['password'])  # Mã hóa mật khẩu
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],  # Thêm role vào quá trình tạo
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            is_active=validated_data.get('is_active', True),
            image=validated_data.get('image', None)
        )
        return user



class LecturerRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 
                  'confirm_password', 'role', 'phone_number', 
                  'address', 'image', 'image_certificate', 
                  'id_card', 'is_active', 'is_approved', 'personal_email']
        extra_kwargs = {
            'password': {'write_only': True},
            'is_approved': {'read_only': True},
            'is_active': {'read_only': True},
            'image_certificate': {'required': False, 'allow_null': True},  # Không bắt buộc
            'id_card': {'required': False, 'allow_null': True}  # Không bắt buộc
        }

    def validate(self, data):
        # Kiểm tra mật khẩu
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        validate_password(data['password'])

        # Kiểm tra vai trò là giảng viên
        if data.get('role') == 'lecturer':
            if not data['email'].endswith('@university.edu'):
                raise serializers.ValidationError("Email phải thuộc tổ chức của bạn (@university.edu).")
            # Nếu có cung cấp chứng chỉ hoặc chứng minh thư thì kiểm tra, nếu không thì bỏ qua
            if data.get('image_certificate') is None or data.get('id_card') is None:
                pass  # Cho phép không cung cấp các trường này
        else:
            if 'image_certificate' in data or 'id_card' in data:
                raise serializers.ValidationError("Chỉ giảng viên mới có thể cung cấp chứng chỉ và chứng minh thư.")

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])

        lecturer = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            personal_email=validated_data['personal_email'],
            role=validated_data['role'],
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            image=validated_data.get('image', None),
            image_certificate=validated_data.get('image_certificate', None),
            id_card=validated_data.get('id_card', None),
            is_active=False,  # Chờ phê duyệt
            is_approved=False  # Chờ phê duyệt
        )
        return lecturer



class LoginStudentSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        user = User.objects.filter(email=email).first()
        if user: 
            if user.check_password(password):
                return user
            else:
                raise serializers.ValidationError('Invalid password.')
        else:
            raise serializers.ValidationError('User does not exist.')
        

class LoginLecturerSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")

        user = User.objects.filter(email=email, is_active=True, is_approved=True).first()
        if user: 
            if user.check_password(password):
                return user
            else:
                raise serializers.ValidationError('Invalid password.')
        else:
            raise serializers.ValidationError('User does not exist or is not approved.')


class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user

        # Kiểm tra mật khẩu cũ
        if not user.check_password(value):
            raise serializers.ValidationError('Incorrect old password.')

        return value

    def validate(self, data):
        new_password = data.get('new_password')
        confirm_new_password = data.get('confirm_new_password')

        # Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
        if new_password != confirm_new_password:
            raise serializers.ValidationError("New passwords do not match.")

        # Xác thực mật khẩu mới
        try:
            validate_password(new_password, self.context['request'].user)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.messages)

        return data

    def save(self):
        user = self.context['request'].user
        new_password = self.validated_data['new_password']

        # Cập nhật mật khẩu mới
        user.set_password(new_password)
        user.save()


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'phone_number', 'address']

    def update(self, instance, validated_data):
        # Cập nhật các trường của đối tượng instance với dữ liệu đã xác thực
        instance.username = validated_data.get('username', instance.username)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.address = validated_data.get('address', instance.address)
        instance.save()
        
        return instance
 