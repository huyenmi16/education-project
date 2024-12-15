import React, { useState } from 'react';
import './QuizCard.css';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Form, Button, message, Upload, TimePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './ButtonAction.css';
import moment from 'moment';
import axios from 'axios';

const { confirm } = Modal;

const QuizCard = ({ quiz, updateQuizzes }) => {
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleToggleMore = () => {
    navigate(`/detail-quiz/${quiz.id}`, { state: { quiz } });
  };

  const showEditModal = () => {
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      name: quiz.name,
      duration: quiz.duration ? moment(quiz.duration, 'HH:mm:ss') : null,
      quiz_time: quiz.quiz_time ? moment(quiz.quiz_time, "HH:mm:ss DD/MM/YYYY").format('YYYY-MM-DDTHH:mm:ss') : null,
      image: quiz.image || ''
    });
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file); // Save the selected image file
    } else {
      setUploadedFile(null); // Clear the image if it's not an image file
      message.error('Vui lòng chọn tệp hình ảnh hợp lệ!');
    }
  };

  const handleEditSubmit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('duration', moment(values.duration).format('HH:mm:ss'));
    formData.append('quiz_time', values.quiz_time);

    if (quiz.course_id) {
      formData.append('course_id', quiz.course_id);
    }
    formData.append('questions', JSON.stringify([]));

    // Append the image (either the previous image or the new one if uploaded)
    if (uploadedFile) {
      formData.delete('image');
      formData.append('image', uploadedFile); // If a new image is uploaded
    } 
    else if (quiz.image) {
      try {
        // Fetch the existing image URL
        const response = await fetch(quiz.image);
        const blob = await response.blob();

        // Get the file extension based on the MIME type of the blob
        const mimeType = blob.type.split('/')[1]; // Get the file type (e.g., 'jpeg', 'png')
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // List of supported extensions
        const extension = validExtensions.includes(mimeType) ? mimeType : 'jpg'; // Default to 'jpg' if invalid extension

        // Create the image file using the correct extension
        const imageFile = new File([blob], `quiz-image.${extension}`, { type: blob.type });
        formData.append('image', imageFile); // Append the image as binary data
      } catch (error) {
        message.error('Không thể tải ảnh cũ');
      }
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://127.0.0.1:5000/api/quiz/update-quiz/${quiz.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      message.success(response.data.message || 'Cập nhật quiz thành công!');
      setIsEditModalVisible(false);
      setUploadedFile(null); // Clear the uploaded file after successful submission
      updateQuizzes();
    } catch (error) {
      message.error(error.response?.data?.error || 'Đã xảy ra lỗi khi cập nhật quiz!');
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa quiz này?',
      icon: <ExclamationCircleOutlined />,
      content: `Quiz: ${quiz.name}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        await handleDeleteQuiz();
      },
      onCancel() {
        console.log('Hủy xóa quiz');
      }
    });
  };

  const handleDeleteQuiz = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/quiz/${quiz.id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(response.data.message || 'Quiz đã được xóa thành công!');
      updateQuizzes();
    } catch (error) {
      message.error(error.response?.data?.error || 'Đã xảy ra lỗi khi xóa quiz!');
    }
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        {quiz.image ? (
          <img src={quiz.image} alt={quiz.name} />
        ) : (
          <img src="https://via.placeholder.com/100" alt="default" />
        )}
      </div>

      <div className="quiz-card-info">
        <h3>{quiz.name}</h3>
        <p>Course: {quiz.course_name}</p>
        <p>Duration: {quiz.duration} minutes</p>
        <p>Quiz Time: {quiz.quiz_time}</p>
      </div>

      <div className="button-actions">
        <EditOutlined
          style={{ fontSize: '20px', cursor: 'pointer', marginRight: '10px' }}
          onClick={showEditModal}
        />
        <DeleteOutlined
          style={{ fontSize: '20px', cursor: 'pointer', color: 'red' }}
          onClick={showDeleteConfirm}
        />
        <button className="see-more-btn" onClick={handleToggleMore}>
          See More
        </button>
      </div>

      <Modal
        title="Sửa Quiz"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} onFinish={handleEditSubmit}>
          <Form.Item
            name="name"
            label="Tên Quiz"
            rules={[{ required: true, message: 'Vui lòng nhập tên quiz' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời Gian Thực Hiện"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện' }]}
          >
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name="quiz_time"
            label="Thời Gian Làm Bài"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian làm bài' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình Ảnh"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
              accept="image/*"
              onChange={({ file }) => handleImageChange(file)}
            >
              <PlusOutlined />
            </Upload>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsEditModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QuizCard;
