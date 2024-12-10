import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Select, message, TimePicker, Pagination } from 'antd';
import axios from 'axios';
import QuestionFormModal from "./QuestionFormModal";
import QuizCard from './QuizCard';
import './QuizCard.css';

const { Option } = Select;

const Quiz = () => {
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [quizForm] = Form.useForm();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 4;

  // Refactored fetchQuizzes with useCallback to prevent unnecessary re-renders
  const fetchQuizzes = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        message.error('Bạn chưa đăng nhập!');
        return;
      }

      const response = await axios.get('http://127.0.0.1:5000/api/get-all-quiz/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedQuizzes = response.data.map(quiz => ({
        id: quiz.id,
        name: quiz.name,
        image: `http://127.0.0.1:5000${quiz.image}`,
        duration: quiz.duration,
        quiz_time: new Date(quiz.quiz_time).toLocaleString(),
        course_name: quiz.course_name,
        course_id: quiz.course_id,
        questions: quiz.questions
      }));

      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      message.error('Không thể tải danh sách bài quiz');
    }
  }, []);

  // Fetch quizzes on component mount and after quiz creation
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Fetch courses
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
        setCourses(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Lỗi khi lấy danh sách khóa học!';
        message.error(errorMessage);
      }
    };

    fetchCourses();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleQuizCreate = async (values) => {
    const { course_id, name, duration, quiz_time } = values;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }

    const formData = new FormData();
    formData.append('course_id', course_id);
    formData.append('name', name);

    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    formData.append('duration', duration.format('HH:mm:ss'));
    formData.append('quiz_time', quiz_time);

    try {
      const response = await axios.post(`http://127.0.0.1:5000/api/quiz/${course_id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      message.success('Tạo bộ câu hỏi thành công');

      // Refresh quizzes after successful creation
      await fetchQuizzes();

      setSelectedImage(null);
      setQuizModalVisible(false);
      quizForm.resetFields();
    } catch (error) {
      console.error('Quiz creation error:', error);
      message.error('Không thể tạo bộ câu hỏi');
    }
  };

  const showModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  // Calculate the quizzes to display on the current page
  const currentQuizzes = quizzes.slice((currentPage - 1) * quizzesPerPage, currentPage * quizzesPerPage);

  return (
    <div>
      <Button type="primary" onClick={() => setQuizModalVisible(true)} style={{ margin: '0 8px' }}>
        Tạo Bộ Câu Hỏi
      </Button>

      <Button type="primary" style={{ margin: '0 8px' }} onClick={showModal}>
        Tạo Câu Hỏi và Câu Trả Lời
      </Button>

      <Modal
        title="Tạo Bộ Câu Hỏi"
        visible={quizModalVisible}
        onCancel={() => setQuizModalVisible(false)}
        footer={null}
      >
        <Form form={quizForm} onFinish={handleQuizCreate}>
          <Form.Item name="course_id" label="Khóa Học" rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}>
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="name" label="Tên Bộ Câu Hỏi" rules={[{ required: true, message: 'Vui lòng nhập tên bộ câu hỏi' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="image" label="Hình Ảnh">
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </Form.Item>

          <Form.Item name="duration" label="Thời Gian Thực Hiện" rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện' }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>

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
        {currentQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} updateQuizzes={fetchQuizzes} />
        ))}
      </div>

      <Pagination
        className='pagination-quiz'
        current={currentPage}
        total={quizzes.length}
        pageSize={quizzesPerPage}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default Quiz;