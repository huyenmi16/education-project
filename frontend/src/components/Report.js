import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Button, Form, Input, DatePicker, Select, message } from 'antd';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import axios from 'axios'; // Make sure axios is imported
import './CourseLayout.css';
import './DetailCourse.css';
import moment from 'moment';

const { Content, Footer } = Layout;
const { TextArea } = Input;
const { Option } = Select;

const Report = () => {
    const [form] = Form.useForm();
    const [courses, setCourses] = useState([]);
    const [courseIDs, setCourseIDs] = useState([]);
    const token = localStorage.getItem('accessToken');

    const listCourseRegisted = useCallback(async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/list-register-course/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
           
            setCourseIDs(response.data.registered_course_ids);
        } catch (error) {
            console.error('Error fetching registered courses:', error);
        }
    }, [token]);

    const fetchCourses = useCallback(async () => {
        try {
            const courseDetails = await Promise.all(
                courseIDs.map(async (id) => {
                    const response = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`);
                    return response.data;
                })
            );
            setCourses(courseDetails);
        } catch (error) {
            console.error('Error fetching course details:', error);
        }
    }, [courseIDs]);

    useEffect(() => {
        listCourseRegisted();
    }, [listCourseRegisted]);

    useEffect(() => {
        if (courseIDs.length > 0) {
            fetchCourses();
        }
    }, [fetchCourses, courseIDs]);

    const handleFormSubmit = async (values) => {
        try {
            const reportData = {
                course_id: values.course,
                day: values.date.format('YYYY-MM-DD'),
                todo: values.tasks,
                issue: values.issues || '',
                plan: values.plan,
            };
            await axios.post('http://127.0.0.1:8080/api/add-report/', reportData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(reportData); // Log dữ liệu gửi đi

            message.success('Báo cáo đã được tạo thành công!');
            form.resetFields(); // Reset form after successful submission
        } catch (error) {
            console.error('Error creating report:', error);
            message.error('Có lỗi xảy ra khi tạo báo cáo.');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar style={{ position: 'fixed', height: '100vh' }} />
            <Layout>
                <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }} />

                <Content className="content-course-layout">
                    <div className="content-card-parent">
                        <h2>Báo cáo hằng ngày</h2>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFormSubmit} // Handle form submission
                            initialValues={{ date: moment() }} // Set default date to current
                        >
                            <Form.Item
                                name="course"
                                label="Chọn khóa học"
                                rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
                            >
                                <Select placeholder="Chọn khóa học">
                                    {courses.length > 0 ? (
                                        courses.map((course) => (
                                            <Option key={course.id} value={course.id}>
                                                {course.title}
                                            </Option>
                                        ))
                                    ) : (
                                        <p>No courses found.</p>
                                    )}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="date"
                                label="Chọn ngày"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                                <DatePicker defaultValue={moment()} format="YYYY-MM-DD" />
                            </Form.Item>


                            <Form.Item
                                name="tasks"
                                label="Bạn đã làm những gì vào hôm nay?"
                                rules={[{ required: true, message: 'Vui lòng ghi lại các hoạt động!' }]}
                            >
                                <TextArea rows={4} placeholder="Nhập những gì bạn đã làm vào hôm nay" />
                            </Form.Item>

                            <Form.Item name="issues" label="Gặp phải những vấn đề nào không?">
                                <TextArea rows={4} placeholder="Nhập những vấn đề gặp phải (nếu có)" />
                            </Form.Item>

                            <Form.Item
                                name="plan"
                                label="Dự định của bạn vào ngày mai là gì?"
                                rules={[{ required: true, message: 'Vui lòng ghi lại kế hoạch của bạn cho ngày mai!' }]}
                            >
                                <TextArea rows={4} placeholder="Nhập kế hoạch của bạn cho ngày mai" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Tạo Báo Cáo
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    Education ©{new Date().getFullYear()} Created by Ngoc Huyen
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Report;
