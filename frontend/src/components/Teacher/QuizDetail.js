import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Collapse, Button, Modal, Form, Input, message, Upload, Space, Card, Typography, Checkbox } from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined,
  QuestionCircleOutlined, ClockCircleOutlined,
  BookOutlined, CalendarOutlined, FileImageOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import axios from 'axios';


const { Content } = Layout;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const QuizDetail = () => {
  const location = useLocation();
  const quiz_id = location.state?.quiz?.id;
  const [activeKeys, setActiveKeys] = useState([]);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [questionForm] = Form.useForm();
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [quiz, setQuiz] = useState(null);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://127.0.0.1:5000/api/get-all-quiz/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const foundQuiz = response.data.find(quiz => quiz.id === quiz_id);
      if (foundQuiz) {
        foundQuiz.image = `http://127.0.0.1:5000${foundQuiz.image}`
        setQuiz(foundQuiz);
      }

    } catch (error) {
      message.error('Không thể tải danh sách câu hỏi');
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchQuestions();
  }, [quiz_id]);


  // Modal thêm/sửa câu hỏi
  const showQuestionModal = (question = null) => {
    setEditingQuestion(question);
    if (question) {
      questionForm.setFieldsValue({
        text: question.text,
        options: question.options.map(option => ({
          text: option.text,
          is_correct: option.is_correct
        }))

      });
    } else {
      questionForm.resetFields();
    }
    setIsQuestionModalVisible(true);
  };

  const handleQuestionSubmit = async (values) => {
    try {
      console.log('values: ', values)
      const payload = {
        question: {
          text: values.text,
          course_id: quiz.course_id
        },
        options: values.options
      }
      // console.log('payload: ', payload)
      // API call để thêm/sửa câu hỏi
      try {
        // API call để xóa câu hỏi
        const token = localStorage.getItem('accessToken');
        const response = await axios.put(`http://127.0.0.1:5000/api/questions/${quiz.id}/`, {
          payload,
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success(response.data.message || 'Câu hỏi đã được cập nhật thành công!');
        fetchQuestions();
        message.success('Xóa câu hỏi thành công!');
      } catch (error) {
        message.error('Có lỗi xảy ra!');
      }

      message.success(`${editingQuestion ? 'Sửa' : 'Thêm'} câu hỏi thành công!`);
      setIsQuestionModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const handleDeleteQuestion = (questionId) => {
    console.log('questionId: ', questionId)
    Modal.confirm({
      title: 'Xác nhận xóa câu hỏi?',
      content: 'Hành động này không thể hoàn tác',
      onOk: async () => {
        try {
          // API call để xóa câu hỏi
          const token = localStorage.getItem('accessToken');
          const response = await axios.delete(`http://127.0.0.1:5000/api/questions/${questionId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success(response.data.message || 'Câu hỏi đã được xóa thành công!');
          fetchQuestions();
          message.success('Xóa câu hỏi thành công!');
        } catch (error) {
          message.error('Có lỗi xảy ra!');
        }
      }
    });
  };

  return (
    console.log('location.state.quiz: ', location.state.quiz),
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
                          <Text>{`${option.text}`}</Text>
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


            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        label={`Câu trả lời ${index + 1}`}
                        required
                        name={[field.name, 'text']}
                        style={{ width: '100%' }}
                      >
                        <Input
                          placeholder="Nội dung câu trả lời"
                          style={{
                            width: '100%',
                            minWidth: '300px', // Độ rộng tối thiểu
                            minHeight: '40px'  // Chiều cao tối thiểu
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'is_correct']}
                        valuePropName="checked"
                      >
                        <Checkbox>Đáp án đúng</Checkbox>
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