import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Pagination, Button, Table, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import './CourseLayout.css';
import axios from "axios";

const { Content, Footer } = Layout;

const HistoryReport = () => {
    const [reports, setReports] = useState([]);
    const [courses, setCourses] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5); // Số báo cáo mỗi trang
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    
    const [form] = Form.useForm();
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchReports();
        fetchCourses();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8080/api/report-all/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = response.data;
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/courses/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = response.data;
            const courseMap = data.reduce((map, course) => {
                map[course.id] = course;
                return map;
            }, {});
            setCourses(courseMap);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const handleDelete = async (reportKey) => {
        console.log('Deleting report key:', reportKey); // Kiểm tra giá trị của reportKey
    
        if (!reportKey) {
            message.error('ID báo cáo không hợp lệ');
            return;
        }
    
        try {
            await axios.delete(`http://127.0.0.1:8080/api/report/${reportKey}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            message.success('Xóa báo cáo thành công');
            fetchReports(); // Tải lại báo cáo sau khi xóa
        } catch (error) {
            message.error('Xóa báo cáo thất bại');
            console.error(error);
        }
    };
    
    const showModal = (report, editMode = false) => {
        console.log('Current report:', report); // Kiểm tra giá trị của report
    
        setCurrentReport(report);
        setIsEditMode(editMode);
    
        form.setFieldsValue({
            day: report.day,
            todo: report.todo || '',
            issue: report.issue || '',
            plan: report.plan || ''
        });
    
        setIsModalVisible(true);
    };
    

    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentReport(null);
    };

    const handleSave = async (values) => {
        console.log('Saving report key:', currentReport?.key); // Kiểm tra giá trị của currentReport?.key
    
        if (!currentReport?.key) {
            message.error('ID báo cáo không hợp lệ');
            return;
        }
    
        try {
            if (isEditMode) {
                const response = await axios.put(
                    `http://127.0.0.1:8080/api/report/${currentReport.key}/`,
                    { ...values },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
    
                if (response.status === 200) {
                    message.success('Cập nhật báo cáo thành công');
                    fetchReports(); // Cập nhật danh sách báo cáo
                    setIsModalVisible(false);
                } else {
                    throw new Error('Cập nhật thất bại');
                }
            }
        } catch (error) {
            console.error('Lỗi cập nhật báo cáo:', error);
            message.error('Cập nhật báo cáo thất bại. Vui lòng thử lại sau.');
        }
    };
    
    // Group báo cáo theo khóa học
    const groupedReports = reports.reduce((acc, report) => {
        if (!acc[report.courses_id]) {
            acc[report.courses_id] = [];
        }
        acc[report.courses_id].push(report);
        return acc;
    }, {});

    const paginatedCourses = Object.keys(groupedReports).slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Định nghĩa cột cho bảng
    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
        },
        {
            title: 'Ngày',
            dataIndex: 'day',
            key: 'day',
        },
        {
            title: 'Công việc',
            dataIndex: 'todo',
            key: 'todo',
        },
        {
            title: 'Vấn đề',
            dataIndex: 'issue',
            key: 'issue',
        },
        {
            title: 'Kế hoạch',
            dataIndex: 'plan',
            key: 'plan',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div className="card-actions">
                    <Button icon={<EditOutlined />} shape="circle" style={{ marginRight: '5px' }} onClick={() => showModal(record, true)} />
                    <Button icon={<DeleteOutlined />} shape="circle" style={{ marginRight: '5px' }} onClick={() => handleDelete(record.key)} />
                    <Button icon={<InfoCircleOutlined />} shape="circle" style={{ marginRight: '5px' }} onClick={() => showModal(record)} />
                </div>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar style={{ position: 'fixed', height: '100vh' }} />
            <Layout> 
                <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }} />

                <Content className="content-course-layout">
                    <div className="content-card-parent">
                        <Row gutter={[16, 16]}>
                            {paginatedCourses.map(courseId => (
                                <Col key={courseId} xs={24} sm={12} md={24} lg={24}>
                                    <Card title={courses[courseId]?.title || 'Unknown Course'} bordered={false}>
                                        <Table
                                            dataSource={groupedReports[courseId].map((report, index) => ({
                                                key: report.id,
                                                index: index + 1,
                                                day: report.day,
                                                todo: report.todo,
                                                issue: report.issue,
                                                plan: report.plan,
                                            }))}
                                            columns={columns}
                                            pagination={false}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={Object.keys(groupedReports).length}
                            onChange={page => setCurrentPage(page)}
                            style={{ textAlign: 'center', marginTop: '20px' }}
                        />
                    </div>
                </Content>

                <Modal
                    title={isEditMode ? 'Edit Report' : 'Report Details'}
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form
                        form={form}
                        onFinish={handleSave}
                        layout="vertical"
                    >
                        <Form.Item
                            label="Ngày"
                            name="day"
                            rules={[{ required: true, message: 'Vui lòng nhập ngày' }]}
                        >
                            <Input disabled={!isEditMode} />
                        </Form.Item>

                        <Form.Item
                            label="Công việc"
                            name="todo"
                            rules={[{ required: true, message: 'Vui lòng nhập công việc' }]}
                        >
                            <Input disabled={!isEditMode} />
                        </Form.Item>

                        <Form.Item
                            label="Vấn đề"
                            name="issue"
                            rules={[{ required: true, message: 'Vui lòng nhập vấn đề' }]}
                        >
                            <Input disabled={!isEditMode} />
                        </Form.Item>

                        <Form.Item
                            label="Kế hoạch"
                            name="plan"
                            rules={[{ required: true, message: 'Vui lòng nhập kế hoạch' }]}
                        >
                            <Input disabled={!isEditMode} />
                        </Form.Item>

                        {isEditMode && (
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Save
                                </Button>
                            </Form.Item>
                        )}
                    </Form>
                </Modal>

                <Footer style={{ textAlign: 'center' }}>
                    Education ©{new Date().getFullYear()} Created by Ngoc Huyen
                </Footer>
            </Layout>
        </Layout>
    );
};

export default HistoryReport;
