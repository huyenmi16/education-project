import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, message, TimePicker } from 'antd';
import axios from 'axios';
import QuestionFormModal from "./QuestionFormModal";
import QuizCard from './QuizCard';
import './QuizCard.css';
const { Option } = Select;

const Quiz = () => {
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);  // Store courses data
  const [quizForm] = Form.useForm();


  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const quizzes = [
    {
      id: 1,
      name: 'Math Quiz',
      course_id: 1,
      image: 'https://example.com/math-quiz.jpg',
      duration: 30,  // Thời gian quiz tính bằng phút
      quiz_time: '2024-12-06T09:00:00Z',
    },
    {
      id: 2,
      name: 'Science Quiz',
      course_id: 2,
      image: 'https://example.com/science-quiz.jpg',
      duration: 45,
      quiz_time: '2024-12-07T10:00:00Z',
    },
  ];

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('Bạn chưa đăng nhập!');
        return;
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/all-courses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(response.data); // Update courses state with fetched data
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Lỗi khi lấy danh sách khóa học!';
        message.error(errorMessage);
      }
    };

    fetchCourses();
  }, []);

  const handleQuizCreate = (values) => {
    const { course_id, name, image, duration, quiz_time } = values;

    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return; // Dừng việc tạo quiz nếu không có token
    }

    // Tạo FormData để gửi file và dữ liệu khác
    const formData = new FormData();
    formData.append('course_id', course_id);
    formData.append('name', name);

    // Chỉ thêm image nếu có file ảnh
    if (image && image[0]) {
      formData.append('image', image[0]?.originFileObj); // Xử lý tải lên hình ảnh
    }

    formData.append('duration', duration.format('HH:mm:ss'));
    formData.append('quiz_time', quiz_time);

    // Gửi yêu cầu API để tạo bộ câu hỏi
    axios.post(`http://127.0.0.1:5000/api/quiz/${course_id}/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`, // Thêm token vào header
        'Content-Type': 'multipart/form-data',  // Set kiểu dữ liệu phù hợp cho tải lên file
      }
    })
    .then(response => {
      message.success('Tạo bộ câu hỏi thành công');
      setQuizModalVisible(false);
    })
    .catch(error => {
      message.error('Không thể tạo bộ câu hỏi');
    });
  };

  return (
    <div>
      {/* Button to open Quiz creation modal */}
      <Button type="primary" onClick={() => setQuizModalVisible(true)} style={{ margin: '0 8px' }}>
        Tạo Bộ Câu Hỏi
      </Button>

      <Button type="primary" style={{ margin: '0 8px' }} onClick={showModal}>
        Tạo Câu Hỏi và Câu Trả Lời
      </Button>
     
      {/* Quiz Creation Modal */}
      <Modal
        title="Tạo Bộ Câu Hỏi"
        visible={quizModalVisible}
        onCancel={() => setQuizModalVisible(false)}
        footer={null}
      >
        <Form form={quizForm} onFinish={handleQuizCreate}>
          {/* Select Course */}
          <Form.Item name="course_id" label="Khóa Học" rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}>
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Quiz Name */}
          <Form.Item name="name" label="Tên Bộ Câu Hỏi" rules={[{ required: true, message: 'Vui lòng nhập tên bộ câu hỏi' }]}>
            <Input />
          </Form.Item>

          {/* Image Upload (optional) */}
          <Form.Item name="image" label="Hình Ảnh">
            <Input type="file" accept="image/*" />
          </Form.Item>

          {/* Duration */}
          <Form.Item name="duration" label="Thời Gian Thực Hiện" rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện' }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>

          {/* Quiz Time */}
          <Form.Item name="quiz_time" label="Thời Gian Làm Bài" rules={[{ required: true, message: 'Vui lòng chọn thời gian làm bài' }]}>
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Xác Nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <QuestionFormModal isVisible={isModalVisible} onClose={closeModal} />
    <div className="quiz-list">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
    </div>
  );
};

export default Quiz;
