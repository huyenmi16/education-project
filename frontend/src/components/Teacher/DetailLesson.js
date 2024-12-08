// LessonDetail.js
import React, { useState } from 'react';
import { Modal,Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const LessonDetail = ({ lesson }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Hàm mở modal và hiển thị thông tin chi tiết
  const handleDetailLesson = (lesson) => {
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      {/* Sử dụng LessonInfoButton để hiển thị nút thông tin */}
      <Button 
        icon={<InfoCircleOutlined />} 
        onClick={() => handleDetailLesson(lesson)} 
      />

      {/* Modal hiển thị chi tiết lesson */}
      <Modal
        title="Chi tiết bài học"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
       
        <div>
          <p><strong>Tên bài học:</strong> {lesson.title}</p>
          <p><strong>Nội dung:</strong> {lesson.content}</p>
          <p><strong>Thời gian:</strong> {lesson.duration}</p>
          <p><strong>Thể loại:</strong> {lesson.type}</p>
         
        </div>
      </Modal>
    </div>
  );
};

export default LessonDetail;
