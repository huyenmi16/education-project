import React, { useState } from 'react';
import { Button, Modal, Form, Input, message } from 'antd';

const Teacher = () => {
  const [teacherModalVisible, setTeacherModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [teacherForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const handleTeacherUpdate = (values) => {
    message.success('Cập nhật thông tin thành công');
    setTeacherModalVisible(false);
  };

  const handlePasswordChange = (values) => {
    message.success('Đổi mật khẩu thành công');
    setPasswordModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={() => setTeacherModalVisible(true)} style={{ margin: '0 8px' }}>
        Cập Nhật Thông Tin
      </Button>
      <Button type="primary" onClick={() => setPasswordModalVisible(true)} style={{ margin: '0 8px' }}>
        Đổi Mật Khẩu
      </Button>

      <Modal
        title="Cập Nhật Thông Tin"
        visible={teacherModalVisible}
        onCancel={() => setTeacherModalVisible(false)}
        footer={null}
      >
        <Form form={teacherForm} onFinish={handleTeacherUpdate}>
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Xác Nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đổi Mật Khẩu"
        visible={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form form={passwordForm} onFinish={handlePasswordChange}>
          <Form.Item name="oldPassword" label="Mật Khẩu Cũ" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật Khẩu Mới" rules={[{ required: true }]}>
            <Input.Password />
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

export default Teacher;
