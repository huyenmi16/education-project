import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Collapse, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './ButtonAction.css';

const { Content } = Layout;
const { Panel } = Collapse;

const QuizDeTail = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    // Thay vì lấy dữ liệu từ API, bạn có thể sử dụng dữ liệu JSON như đã cung cấp
    const quizJsonData = {
      "quiz": {
        "id": 1,
        "course_id": 101,
        "name": "Math Quiz",
        "image": "https://example.com/math-quiz.jpg",
        "duration": "00:45:00", 
        "quiz_time": "2024-12-06T09:00:00Z",
        "questions": [
          {
            "id": 1,
            "text": "What is 2+2?",
            "course_id": 101,
            "image": "https://example.com/question1.jpg",
            "options": [
              {
                "id": 1,
                "text": "3",
                "is_correct": false
              },
              {
                "id": 2,
                "text": "4",
                "is_correct": true
              },
              {
                "id": 3,
                "text": "5",
                "is_correct": false
              },
              {
                "id": 4,
                "text": "6",
                "is_correct": false
              }
            ]
          },
          {
            "id": 2,
            "text": "What is the capital of France?",
            "course_id": 101,
            "image": "https://example.com/question2.jpg",
            "options": [
              {
                "id": 1,
                "text": "Berlin",
                "is_correct": false
              },
              {
                "id": 2,
                "text": "Paris",
                "is_correct": true
              },
              {
                "id": 3,
                "text": "Rome",
                "is_correct": false
              },
              {
                "id": 4,
                "text": "Madrid",
                "is_correct": false
              }
            ]
          }
        ]
      }
    };

    // Set dữ liệu quiz vào state
    setQuizData(quizJsonData.quiz);
  }, []);

  const handleEdit = (questionId, optionId) => {
    // Hàm sửa câu trả lời
    console.log('Editing option', optionId, 'for question', questionId);
  };

  const handleDelete = (questionId, optionId) => {
    // Hàm xóa câu trả lời
    console.log('Deleting option', optionId, 'from question', questionId);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout>
        <Content className="content-course-layout">
          <div className="content-card-parent">
            <Row gutter={16}>
            <Col xs={24} sm={16} md={16} lg={16}>
              
              <h3>{quizData ? quizData.name : 'Loading...'}</h3>
              
              <br/>
             
              {quizData && quizData.image && <img src={quizData.image} alt={quizData.name} style={{ width: '100%' }} />}

              <div>
                <strong>Thời gian làm bài: </strong>
                {quizData ? quizData.duration : 'Loading...'}
              </div>
              <br/>
             
              <div>
                <strong>Thời gian quiz: </strong>
                {quizData ? new Date(quizData.quiz_time).toLocaleString() : 'Loading...'}
              </div>

              <br/>
             
            </Col>

              <Col xs={24} sm={8} md={8} lg={8}>
                {/* Here you can add any additional information */}
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <h2>Nội dung bộ câu hỏi</h2>

                <Collapse
                  activeKey={activeKeys}
                  onChange={(keys) => setActiveKeys(keys)}
                  accordion={false}
                >
                  {quizData && quizData.questions.map((question) => (
                    <Panel
                      key={question.id}
                      header={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{question.text}</span>
                          <div>
                            <Button 
                              icon={<EditOutlined />} 
                              onClick={() => console.log('Edit question', question.id)} 
                              style={{ marginRight: 8 }}
                            />
                            <Button 
                              icon={<DeleteOutlined />} 
                              onClick={() => console.log('Delete question', question.id)} 
                            />
                          </div>
                        </div>
                      }
                    >
                      {question.image && <img src={question.image} alt={question.text} style={{ width: '100%' }} />}
                      {question.options.map((option) => (
                        <div key={option.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{option.text}</span>
                          <div>
                            <Button
                              icon={<EditOutlined />}
                              onClick={() => handleEdit(question.id, option.id)}
                              style={{ marginRight: 8 }}
                            />
                            <Button
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(question.id, option.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </Panel>
                  ))}
                </Collapse>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default QuizDeTail;
