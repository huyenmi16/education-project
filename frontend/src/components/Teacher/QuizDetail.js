import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Collapse, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './ButtonAction.css';
import { useLocation } from 'react-router-dom';
const { Content } = Layout;
const { Panel } = Collapse;

const QuizDeTail = () => {
  const [activeKeys, setActiveKeys] = useState([]);

  const location = useLocation();
  const quiz = location.state?.quiz;

  console.log(quiz)

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

                <div>
                  <strong>Bộ câu hỏi: </strong>
                  {quiz ? quiz.name : 'Loading...'}
                </div>

                <br />


                <div>
                  <strong>Khóa học: </strong>
                  {quiz ? quiz.course_name : 'Loading...'}
                </div>

                <br />
                <div>
                  <strong>Thời gian làm bài: </strong>
                  {quiz ? quiz.duration : 'Loading...'}
                </div>
                <br />

                <div>
                  <strong>Thời gian quiz: </strong>
                  {quiz ? new Date(quiz.quiz_time).toLocaleString() : 'Loading...'}
                </div>

                <br />

              </Col>

              <Col xs={24} sm={8} md={8} lg={8}>
                {quiz && quiz.image && <img src={quiz.image} style={{ width: '300px' }} />}
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <h3>Nội dung bộ câu hỏi</h3>

                {/* <Collapse
                  activeKey={activeKeys}
                  onChange={(keys) => setActiveKeys(keys)}
                  accordion={false}
                >
                  {quiz && quiz.questions.map((question) => (
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
                </Collapse> */}
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default QuizDeTail;
