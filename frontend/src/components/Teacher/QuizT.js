import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';

const { Option } = Select;

const Quiz = () => {
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [quizForm] = Form.useForm();

  const handleQuizCreate = (values) => {
    message.success('Tạo bộ câu hỏi thành công');
    setQuizModalVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={() => setQuizModalVisible(true)} style={{ margin: '0 8px' }}>
        Tạo Bộ Câu Hỏi
      </Button>

      <Modal
        title="Tạo Bộ Câu Hỏi"
        visible={quizModalVisible}
        onCancel={() => setQuizModalVisible(false)}
        footer={null}
      >
        <Form form={quizForm} onFinish={handleQuizCreate}>
          <Form.Item name="quizName" label="Tên Bộ Câu Hỏi" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subject" label="Môn Học">
            <Select>
              <Option value="math">Toán</Option>
              <Option value="physics">Lý</Option>
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

export default Quiz;
