from django.urls import path
from .views import AddReportView, ReportDetailView,UserReportsView

urlpatterns = [
    path('add-report/', AddReportView.as_view(), name='add-report'),
    path('report-all/', UserReportsView.as_view(), name='report_list_all'),
    path('report/<int:report_id>/', ReportDetailView.as_view(), name='report_detail'),
] 
