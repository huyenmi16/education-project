import React, { useState } from 'react';
import './QuizCard.css';
import { useNavigate } from 'react-router-dom';
import { Modal, Input, Form, Button, message, Upload,TimePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import './ButtonAction.css';
import moment from 'moment';

const QuizCard = ({ quiz, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleToggleMore = () => {
    navigate(`/detail-quiz/${quiz.id}`); // Điều hướng đến trang chi tiết quiz
  };

  const showEditModal = () => {
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      name: quiz.name,
      duration: quiz.duration ? moment(quiz.duration, 'HH:mm:ss') : null,
      quiz_time: quiz.quiz_time ? moment(quiz.quiz_time).format('YYYY-MM-DDTHH:mm:ss') : null,
      image: quiz.image || ''
    });// Điền dữ liệu hiện tại của quiz vào form
  };

  const handleFileChange = ({ file }) => {
    setUploadedFile(file.originFileObj); // Lưu file ảnh được tải lên
  };

  const handleEditSubmit = (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('duration',values.duration);
    formData.append('quiz_time', values.quiz_time);

    // Thêm ảnh nếu có upload mới
    if (uploadedFile) {
      formData.append('image', uploadedFile);
    }

    // Gửi formData qua API hoặc gọi callback từ cha
    if (onEdit) {
      onEdit(quiz.id, formData); // Gọi hàm sửa từ component cha
    } else {
      console.log('Updated Quiz:', formData);
    }

    message.success('Cập nhật quiz thành công!');
    setIsEditModalVisible(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(quiz.id); // Gọi hàm xóa từ component cha
    } else {
      console.log('Quiz ID cần xóa:', quiz.id);
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
        <p>Quiz Time: {new Date(quiz.quiz_time).toLocaleString()}</p>
      </div>

      <div className="button-actions">
        <EditOutlined
          style={{ fontSize: '20px', cursor: 'pointer', marginRight: '10px' }}
          onClick={showEditModal}
        />
        <DeleteOutlined
          style={{ fontSize: '20px', cursor: 'pointer', color: 'red' }}
          onClick={handleDelete}
        />
        <button className="see-more-btn" onClick={handleToggleMore}>
          See More
        </button>
      </div>

      {/* Modal chỉnh sửa quiz */}
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
           {/* Duration */}
           <Form.Item name="duration" label="Thời Gian Thực Hiện" rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện' }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>

          {/* Quiz Time */}
          <Form.Item name="quiz_time" label="Thời Gian Làm Bài" rules={[{ required: true, message: 'Vui lòng chọn thời gian làm bài' }]}>
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item label="Ảnh Quiz">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // Không tự động upload
              accept="image/*"
              onChange={handleFileChange}
            >
              {quiz.image ? (
                <img src={quiz.image} alt="quiz" style={{ width: '100%' }} />
              ) : (
                <PlusOutlined />
              )}
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
