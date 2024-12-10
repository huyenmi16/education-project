import React, { useState } from 'react';
import { Layout, Row, Col, Collapse, Button, Modal, Form, Input, message, Upload, Space, Card, Typography } from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  QuestionCircleOutlined, ClockCircleOutlined,
  BookOutlined, CalendarOutlined, FileImageOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const QuizDetail = () => {
  const location = useLocation();
  const quiz = location.state?.quiz;
  const [activeKeys, setActiveKeys] = useState([]);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [questionForm] = Form.useForm();
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Modal thêm/sửa câu hỏi
  const showQuestionModal = (question = null) => {
    setEditingQuestion(question);
    if (question) {
      questionForm.setFieldsValue({
        text: question.text,
        options: question.options
      });
    } else {
      questionForm.resetFields();
    }
    setIsQuestionModalVisible(true);
  };

  const handleQuestionSubmit = async (values) => {
    try {
      // API call để thêm/sửa câu hỏi
      message.success(`${editingQuestion ? 'Sửa' : 'Thêm'} câu hỏi thành công!`);
      setIsQuestionModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleDeleteQuestion = (questionId) => {
    Modal.confirm({
      title: 'Xác nhận xóa câu hỏi?',
      content: 'Hành động này không thể hoàn tác',
      onOk: async () => {
        try {
          // API call để xóa câu hỏi
          message.success('Xóa câu hỏi thành công!');
        } catch (error) {
          message.error('Có lỗi xảy ra!');
        }
      }
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card>
          <Row gutter={[24, 24]}>
            {/* Thông tin Quiz */}
            <Col xs={24} md={16}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>{quiz?.name}</Title>

                <Space direction="vertical">
                  <Space>
                    <BookOutlined />
                    <Text strong>Khóa học:</Text>
                    <Text>{quiz?.course_name}</Text>
                  </Space>

                  <Space>
                    <ClockCircleOutlined />
                    <Text strong>Thời gian làm bài:</Text>
                    <Text>{quiz?.duration} phút</Text>
                  </Space>

                  <Space>
                    <CalendarOutlined />
                    <Text strong>Thời gian quiz:</Text>
                    <Text>{quiz?.quiz_time}</Text>
                  </Space>
                </Space>
              </Space>
            </Col>

            <Col xs={24} sm={8} md={8} lg={8}>
              {quiz && quiz.image && <img src={quiz.image} style={{ width: '60%' }} />}
            </Col>
          </Row>

          {/* Phần câu hỏi */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3}>
                <QuestionCircleOutlined /> Danh sách câu hỏi
              </Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showQuestionModal()}>
                Thêm câu hỏi
              </Button>
            </div>

            <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
              {quiz?.questions?.map((question) => (
                <Panel
                  key={question.id}
                  header={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Text>{question.text}</Text>
                      <Space>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showQuestionModal(question);
                          }}
                        />
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(question.id);
                          }}
                        />
                      </Space>
                    </div>
                  }
                >
                  {question.image && (
                    <img src={question.image} alt={question.text} style={{ maxWidth: '300px', marginBottom: 16 }} />
                  )}

                  <Space direction="vertical" style={{ width: '100%' }}>
                    {question.options?.map((option, index) => (
                      <Card
                        key={option.id}
                        style={{
                          backgroundColor: option.is_correct ? '#f6ffed' : '#fff',
                          borderColor: option.is_correct ? '#b7eb8f' : '#d9d9d9'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text>{`${String.fromCharCode(65 + index)}. ${option.text}`}</Text>
                          <Space>
                            <Button icon={<EditOutlined />} size="small" />
                            <Button danger icon={<DeleteOutlined />} size="small" />
                          </Space>
                        </div>
                      </Card>
                    ))}
                  </Space>
                </Panel>
              ))}
            </Collapse>
          </div>
        </Card>

        {/* Modal thêm/sửa câu hỏi */}
        <Modal
          title={`${editingQuestion ? 'Sửa' : 'Thêm'} câu hỏi`}
          visible={isQuestionModalVisible}
          onCancel={() => setIsQuestionModalVisible(false)}
          footer={null}
        >
          <Form form={questionForm} onFinish={handleQuestionSubmit} layout="vertical">
            <Form.Item
              name="text"
              label="Nội dung câu hỏi"
              rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item name="image" label="Hình ảnh">
              <Upload
                listType="picture-card"
                maxCount={1}
                beforeUpload={() => false}
              >
                <PlusOutlined />
              </Upload>
            </Form.Item>

            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        label={`Câu trả lời ${index + 1}`}
                        required
                      >
                        <Input placeholder="Nội dung câu trả lời" />
                      </Form.Item>
                      <DeleteOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm câu trả lời
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsQuestionModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {editingQuestion ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default QuizDetail;