import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed

def generate_access_token(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(minutes=1440),  # Access token hết hạn sau 15 phút
        'iat': datetime.utcnow()  # Thời gian token được tạo
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def generate_refresh_token(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7),  # Refresh token hết hạn sau 7 ngày
        'iat': datetime.utcnow()  # Thời gian token được tạo
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

