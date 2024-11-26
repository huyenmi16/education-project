import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, TimePicker, message, Card, Row, Col } from 'antd';
import axios from 'axios';

const { Option } = Select;

const Course = () => {
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [courseForm] = Form.useForm();
  const [chapterForm] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Fetch all courses
  const fetchCourses = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/all-courses/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách khóa học!');
    }
  };

  // Fetch chapters
  const fetchChapters = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/all-chapters/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách chương!');
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchChapters();
  }, []);

  // Handle creating chapter
  const handleChapterCreate = async (values) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/add-chapter/',
        { title: values.title, course: values.courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Tạo chương thành công!');
      setChapterModalVisible(false);
      chapterForm.resetFields();
      fetchChapters();
    } catch (error) {
      message.error('Đã xảy ra lỗi khi tạo chương!');
    }
  };

  // Handle creating lesson
  const handleLessonCreate = async (values) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
    try {
      await axios.post(
        'http://127.0.0.1:8000/api/add-lesson/',
        {
          title: values.title,
          chapter: values.chapterId,
          content: values.content,
          duration: values.duration.format('HH:mm:ss'),
          type: values.type,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success('Tạo bài học thành công!');
      setLessonModalVisible(false);
      lessonForm.resetFields();
    } catch (error) {
      message.error('Đã xảy ra lỗi khi tạo bài học!');
    }
  };

  return (
    <div>
      <Button type="primary" onClick={() => setCourseModalVisible(true)}>Tạo Khóa Học</Button>
      <Button type="primary" onClick={() => setChapterModalVisible(true)}>Tạo Chapter</Button>
      <Button type="primary" onClick={() => setLessonModalVisible(true)}>Tạo Lesson</Button>

      {/* Chapter Modal */}
      <Modal
        title="Tạo Chapter"
        visible={chapterModalVisible}
        onCancel={() => setChapterModalVisible(false)}
        footer={null}>
        <Form form={chapterForm} onFinish={handleChapterCreate}>
          <Form.Item
            name="courseId"
            label="Khóa Học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}>
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="Tên Chapter"
            rules={[{ required: true, message: 'Vui lòng nhập tên chapter!' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Xác Nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        title="Tạo Lesson"
        visible={lessonModalVisible}
        onCancel={() => setLessonModalVisible(false)}
        footer={null}>
        <Form form={lessonForm} onFinish={handleLessonCreate}>
          <Form.Item
            name="chapterId"
            label="Chapter"
            rules={[{ required: true, message: 'Vui lòng chọn chapter!' }]}>
            <Select placeholder="Chọn chapter">
              {chapters.map((chapter) => (
                <Option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="Tên Lesson"
            rules={[{ required: true, message: 'Vui lòng nhập tên lesson!' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội Dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời Lượng"
            rules={[{ required: true, message: 'Vui lòng chọn thời lượng!' }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: 'Vui lòng chọn loại bài học!' }]}>
            <Select placeholder="Chọn loại">
              <Option value="video">Video</Option>
              <Option value="article">Article</Option>
              <Option value="quiz">Quiz</Option>
              <Option value="document">Document</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Xác Nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Course;
