from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Report
from .serializers import ReportSerializer
from datetime import datetime
import requests

class AddReportView(APIView):
    def post(self, request, format=None):
        # Lấy token từ header
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        # Gửi yêu cầu xác thực token
        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu người dùng
        user_data = response.json()
        user_id = user_data.get('id')

        if not user_id:
            return Response({'error': 'Dữ liệu người dùng không hợp lệ'}, status=status.HTTP_401_UNAUTHORIZED)

        # Lấy dữ liệu báo cáo từ request
        data = request.data
        day = data.get('day', datetime.now())

        # Tạo báo cáo mới
        serializer = ReportSerializer(data={
            'user_id': user_id,
            'courses_id': data.get('course_id'),
            'day': day,
            'todo': data.get('todo'),
            'issue': data.get('issue', ''),
            'plan': data.get('plan'),
        })

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportDetailView(APIView):
    def get(self, request, report_id, format=None):
        # Lấy token và xác thực
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')

        # Lấy chi tiết báo cáo
        try:
            report = Report.objects.get(id=report_id, user_id=user_id)
        except Report.DoesNotExist:
            return Response({'error': 'Báo cáo không tồn tại hoặc không thuộc về bạn'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, report_id, format=None):
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

        try:
            report = Report.objects.get(id=report_id, user_id=user_id)
        except Report.DoesNotExist:
            return Response({'error': 'Báo cáo không tồn tại hoặc không thuộc về bạn'},
                            status=status.HTTP_404_NOT_FOUND)

        # Ensure partial update allows flexible input
        serializer = ReportSerializer(report, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, report_id, format=None):
        # Xác thực và xóa báo cáo
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')

        try:
            report = Report.objects.get(id=report_id, user_id=user_id)
        except Report.DoesNotExist:
            return Response({'error': 'Báo cáo không tồn tại hoặc không thuộc về bạn'}, status=status.HTTP_404_NOT_FOUND)

        report.delete()
        return Response({'message': 'Báo cáo đã được xóa'}, status=status.HTTP_204_NO_CONTENT)

class UserReportsView(APIView):
    def get(self, request, format=None):
        # Lấy tất cả báo cáo của người dùng hiện tại
        token = request.headers.get('Authorization')
        if not token:
            return Response({'error': 'Yêu cầu token xác thực'}, status=status.HTTP_401_UNAUTHORIZED)

        profile_url = "http://127.0.0.1:4000/api/profile/"
        headers = {'Authorization': token}
        try:
            response = requests.get(profile_url, headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': 'Xác thực người dùng thất bại', 'details': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        user_data = response.json()
        user_id = user_data.get('id')

        # Lấy danh sách báo cáo của người dùng
        reports = Report.objects.filter(user_id=user_id)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
