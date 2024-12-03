import { Button, Modal, Form, Input, Select, message } from 'antd';
import React, { useState } from 'react';
import axios from 'axios';

const { Option } = Select;

const QuestionModal = ({ visible, onClose, courses, onSuccess }) => {
    const [quizzes, setQuizzes] = useState([]); // Danh sách quizzes
    const [questionForm] = Form.useForm();

    // Lấy danh sách quizzes theo courseId
    const fetchQuizzes = async (courseId) => {
        console.log('courseId:', courseId);  // In giá trị courseId
        const token = localStorage.getItem('accessToken');
        if (!token) {
            message.error('Bạn chưa đăng nhập!');
            return;
        }
    
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/all-quiz/${courseId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
          

            if (response.data && Array.isArray(response.data.data)) {
                const quizzesData = response.data.data;
                setQuizzes(quizzesData);  // Cập nhật state
                console.log(quizzes)
            } else {
                console.log('Dữ liệu không hợp lệ:', response.data);
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Lỗi khi lấy danh sách bộ câu hỏi!';
            message.error(errorMessage);
            setQuizzes([]); // Đặt lại danh sách quizzes thành mảng rỗng khi có lỗi
        }
    };
    
    
    // Xử lý khi thay đổi khóa học
    const handleCourseChange = (courseId) => {
        questionForm.setFieldsValue({ quiz_id: null }); // Reset quiz khi thay đổi khóa học
        setQuizzes([]); // Xóa danh sách quizzes cũ trước khi lấy mới
        fetchQuizzes(courseId);
    };

    // Tạo câu hỏi mới
    const handleQuestionCreate = async (values) => {
        const { quiz_id, text, image } = values;

        const token = localStorage.getItem('accessToken');
        if (!token) {
            message.error('Bạn chưa đăng nhập!');
            return;
        }

        const formData = new FormData();
        formData.append('text', text);

        if (image && image[0]) {
            formData.append('image', image[0]?.originFileObj);
        }

        try {
            // Endpoint tạo câu hỏi mới
            await axios.post(`http://127.0.0.1:5000/api/quiz/${quiz_id}/questions/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            message.success('Tạo câu hỏi thành công');
            onSuccess(); // Callback khi tạo thành công
            questionForm.resetFields();
            onClose();
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Lỗi khi tạo câu hỏi!';
            message.error(errorMessage);
        }
    };

    return (
        <Modal
            title="Tạo Câu Hỏi"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form form={questionForm} onFinish={handleQuestionCreate}>
                {/* Chọn khóa học */}
                <Form.Item
                    name="course_id"
                    label="Khóa Học"
                    rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
                >
                    <Select placeholder="Chọn khóa học" onChange={handleCourseChange}>
                        {courses.map((course) => (
                            <Option key={course.id} value={course.id}>
                                {course.title}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* Chọn quiz */}
                <Form.Item
                    name="quiz_id"
                    label="Bộ Câu Hỏi"
                    rules={[{ required: true, message: 'Vui lòng chọn bộ câu hỏi' }]}
                >
                    <Select placeholder="Chọn bộ câu hỏi">
                        {Array.isArray(quizzes) && quizzes.length > 0 ? (
                            quizzes.map((quiz) => (
                                <Option key={quiz.id} value={quiz.id}>
                                    {quiz.name}
                                </Option>
                            ))
                        ) : (
                            <Option disabled></Option>
                        )}
                    </Select>
                </Form.Item>

                {/* Nội dung câu hỏi */}
                <Form.Item
                    name="text"
                    label="Nội Dung Câu Hỏi"
                    rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>

                {/* Tải hình ảnh */}
                <Form.Item name="image" label="Hình Ảnh">
                    <Input type="file" accept="image/*" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Xác Nhận
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default QuestionModal;
