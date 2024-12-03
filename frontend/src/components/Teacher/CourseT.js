import React, { useState,useEffect } from 'react';
import { Button, Modal, Form, Input, Upload, Select, TimePicker, message, Card, Row, Col } from 'antd';
import { UploadOutlined ,DeleteOutlined,EditOutlined} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import moment from 'moment';

const { Option } = Select;

const Course = () => {
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [courseForm] = Form.useForm();
  const [chapterForm] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [lessonForm] = Form.useForm();
  const [chapters, setChapters] = useState([]); // Danh sách chương của khóa học được chọn
  const [editCourseModalVisible, setEditCourseModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); // Lưu thông tin khóa học đang chỉnh sửa
  const [editCourseForm] = Form.useForm(); // Form cho modal chỉnh sửa
  

  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    // Fetch courses for chapter modal dropdown
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

  const handleStartNowClick = (id) => {
    navigate(`/courses/${id}`); 
  };

  const handleEditCourseClick = (course) => {
    setSelectedCourse(course);
    setEditCourseModalVisible(true);
    editCourseForm.setFieldsValue({
      courseName: course.title,
      description: course.description,
      duration: course.duration ? Number(course.duration) : '',
      price: course.price,
      level: course.level,
    });
  };
  


  const handleCourseCreate = async (values) => {
    const token = localStorage.getItem('accessToken'); // Get token from localStorage

    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.courseName);
    formData.append('description', values.description);
    formData.append('duration', values.duration.format('HH:mm:ss')); // Convert to HH:mm:ss
    formData.append('price', values.price);
    formData.append('level', values.level);

    // Check if there is an image and add it to the formData
    if (imageFile) {
      formData.append('image', imageFile); // Attach the image file directly
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/add-courses/',  // API endpoint Django
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      message.success(response.data.message || 'Tạo khóa học thành công!');
      setCourseModalVisible(false); // Close modal
      courseForm.resetFields(); // Reset form fields
      setImageFile(null); // Reset image file
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Đã xảy ra lỗi khi tạo khóa học!';
      message.error(errorMessage);
    }
  };

  const handleEditCourse = async (values) => {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
  
    
    const formattedDuration = moment(values.duration, 'HH:mm:ss').format('HH:mm:ss');
    const formData = new FormData();
    formData.append('title', values.courseName);
    formData.append('description', values.description);
    formData.append('duration', formattedDuration);
    formData.append('price', values.price);
    formData.append('level', values.level);
  
    if (imageFile) {
      formData.append('image', imageFile); // Nếu có ảnh mới
    }
  
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/update-delete/${selectedCourse.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      message.success(response.data.message || 'Cập nhật khóa học thành công!');
      setEditCourseModalVisible(false);
      setImageFile(null);
      // Reload danh sách khóa học
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Đã xảy ra lỗi khi cập nhật khóa học!';
      message.error(errorMessage);
    }
  };
  

  const handleDeleteCourse = async (courseId) => {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
  
    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/update-delete/${courseId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      message.success(response.data.message || 'Xóa khóa học thành công!');
      // Reload danh sách khóa học
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Đã xảy ra lỗi khi xóa khóa học!';
      message.error(errorMessage);
    }
  };
  
  // Handle image file change
  const handleImageChange = (info) => {
    if (info.file.status === 'removed') {
      setImageFile(null);
    } else if (info.file.originFileObj) {
      setImageFile(info.file.originFileObj); // Save image after selection
    }
  };


  const handleChapterCreate = async (values) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }

    const data = {
      title: values.chapterName,
      course: values.courseId,
    };

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/courses/${values.courseId}/chapters/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success(response.data.message || 'Tạo chương thành công!');
      setChapterModalVisible(false);
      chapterForm.resetFields();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Đã xảy ra lỗi khi tạo chương!';
      message.error(errorMessage);
    }
  };

  const handleCourseChange = async (courseId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
  
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/all-chapters/${courseId}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapters(response.data); // Cập nhật danh sách chương
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Lỗi khi lấy danh sách chương!';
      message.error(errorMessage);
    }
  };

  
  const handleLessonCreate = async (values) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      message.error('Bạn chưa đăng nhập!');
      return;
    }
  
    const data = {
      title: values.lessonTitle,
      chapter: values.chapterId,
      content: values.content,
      duration: values.duration.format('HH:mm:ss'),
      type: values.type,
    };
  
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/chapters/${values.chapterId}/lessons/`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      message.success(response.data.message || 'Tạo bài học thành công!');
      setLessonModalVisible(false);
      lessonForm.resetFields(); // Reset form
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Đã xảy ra lỗi khi tạo bài học!';
      message.error(errorMessage);
    }
  };
  



  return (
    <div>
      <Button
        type="primary"
        onClick={() => setCourseModalVisible(true)}
        style={{ margin: '0 8px' }}
      >
        Create Course
      </Button>

      <Button
        type="primary"
        style={{ margin: '0 8px' }}
        onClick={() => setChapterModalVisible(true)}
      >
        Create Chapter
      </Button>
      <Button
        type="primary"
        style={{ margin: '0 8px' }}
        onClick={() => setLessonModalVisible(true)} // Mở modal bài học
      >
        Create Lesson
      </Button>


      <div style={{ padding: "16px" }}>
     

      {/* Danh sách các khóa học */}
      <Row gutter={[16, 16]}>
        {courses.map((course) => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              hoverable
              cover={<img alt={course.title} src={course.imageUrl} />}
              style={{ width: "100%" }}
            >
              <Card.Meta
                title={course.title}
                description={
                  <>
                    <p>Price: ${course.price}</p>
                    <span>
                      Time: {course.duration} 
                      <br></br>
                      Teacher: {course.instructor} 
                      <br></br>
                      Level: {course.level}
                    </span>
                  </>
                }
              />

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => handleEditCourseClick(course)} icon={<EditOutlined />} />
                <Button onClick={() => handleDeleteCourse(course.id)} icon={<DeleteOutlined />} danger />
                <Button
                    onClick={() => handleStartNowClick(course.id)}
                    type="primary"
                    style={{ marginTop: "16px" }}
                  >
                    See More
              </Button>
              </div>
             
            </Card>
          </Col>
        ))}
      </Row>
    </div>

      <Modal
        title="Tạo Khóa Học"
        visible={courseModalVisible}
        onCancel={() => setCourseModalVisible(false)}
        footer={null}
      >
        <Form form={courseForm} onFinish={handleCourseCreate}>
          <Form.Item
            name="courseName"
            label="Tên Khóa Học"
            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời Lượng"
            rules={[{ required: true, message: 'Vui lòng chọn thời lượng!' }]}
          >
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá Khóa Học"
            rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="level"
            label="Cấp Độ"
            rules={[{ required: true, message: 'Vui lòng chọn cấp độ!' }]}
          >
            <Select placeholder="Chọn cấp độ">
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>
          </Form.Item>

          {/* Image upload */}
          <Form.Item
            name="image"
            label="Hình Ảnh"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            rules={[{ required: true, message: 'Vui lòng chọn hình ảnh!' }]}
          >
            <Upload
              listType="picture"
              beforeUpload={() => false} // Prevent auto-upload
              onChange={handleImageChange}
              maxCount={1} // Only allow one image
            >
              <Button icon={<UploadOutlined />}>Chọn Ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Xác Nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* modal them chapter */}

      <Modal
        title="Tạo Chương"
        visible={chapterModalVisible}
        onCancel={() => setChapterModalVisible(false)}
        footer={null}
      >
        <Form form={chapterForm} onFinish={handleChapterCreate}>
          <Form.Item
            name="courseId"
            label="Khóa Học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="chapterName"
            label="Tên Chương"
            rules={[{ required: true, message: 'Vui lòng nhập tên chương!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Xác Nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal tạo lesson */}

      <Modal
  title="Tạo Bài Học"
  visible={lessonModalVisible}
  onCancel={() => setLessonModalVisible(false)}
  footer={null}
>
  <Form form={lessonForm} onFinish={handleLessonCreate}>
    {/* Chọn khóa học */}
    <Form.Item
      name="courseId"
      label="Khóa Học"
      rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
    >
      <Select
        placeholder="Chọn khóa học"
        onChange={handleCourseChange} // Khi chọn khóa học
      >
        {courses.map((course) => (
          <Option key={course.id} value={course.id}>
            {course.title}
          </Option>
        ))}
      </Select>
    </Form.Item>

    {/* Chọn chương */}
    <Form.Item
      name="chapterId"
      label="Chương"
      rules={[{ required: true, message: 'Vui lòng chọn chương!' }]}
    >
      <Select placeholder="Chọn chương">
        {chapters.map((chapter) => (
          <Option key={chapter.id} value={chapter.id}>
            {chapter.title}
          </Option>
        ))}
      </Select>
    </Form.Item>

    {/* Tên bài học */}
    <Form.Item
      name="lessonTitle"
      label="Tên Bài Học"
      rules={[{ required: true, message: 'Vui lòng nhập tên bài học!' }]}
    >
      <Input />
    </Form.Item>

    {/* Nội dung */}
    <Form.Item name="content" label="Nội Dung">
      <Input.TextArea />
    </Form.Item>

    {/* Thời lượng */}
    <Form.Item
      name="duration"
      label="Thời Lượng"
      rules={[{ required: true, message: 'Vui lòng chọn thời lượng!' }]}
    >
      <TimePicker format="HH:mm:ss" />
    </Form.Item>

    {/* Loại bài học */}
    <Form.Item
      name="type"
      label="Loại Bài Học"
      rules={[{ required: true, message: 'Vui lòng chọn loại bài học!' }]}
    >
      <Select placeholder="Chọn loại bài học">
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


     <Modal
  title="Chỉnh Sửa Khóa Học"
  visible={editCourseModalVisible}
  onCancel={() => setEditCourseModalVisible(false)}
  footer={null}
>
  <Form form={editCourseForm} onFinish={handleEditCourse}>
    <Form.Item
      name="courseName"
      label="Tên Khóa Học"
      rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
    >
      <Input />
    </Form.Item>
    <Form.Item name="description" label="Mô Tả">
      <Input.TextArea />
    </Form.Item>
    <Form.Item
      name="duration"
      label="Thời Lượng"
      rules={[{ required: true, message: 'Vui lòng chọn thời lượng!' }]}
    >
      <TimePicker format="HH:mm:ss" />
    </Form.Item>
    <Form.Item
      name="price"
      label="Giá Khóa Học"
      rules={[{ required: true, message: 'Vui lòng nhập giá khóa học!' }]}
    >
      <Input type="number" />
    </Form.Item>
    <Form.Item
      name="level"
      label="Cấp Độ"
      rules={[{ required: true, message: 'Vui lòng chọn cấp độ!' }]}
    >
      <Select placeholder="Chọn cấp độ">
        <Option value="beginner">Beginner</Option>
        <Option value="intermediate">Intermediate</Option>
        <Option value="advanced">Advanced</Option>
      </Select>
    </Form.Item>
    <Form.Item
      name="image"
      label="Hình Ảnh"
      valuePropName="fileList"
      getValueFromEvent={(e) => e?.fileList}
    >
      <Upload
        listType="picture"
        beforeUpload={() => false}
        onChange={handleImageChange}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Chọn Ảnh</Button>
      </Upload>
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
