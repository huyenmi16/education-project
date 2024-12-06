import React from 'react';
import { Card, Typography, Divider, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const QuizDetail = () => {
  // Dữ liệu tĩnh của quiz
  const quiz = {
    name: "Sample Quiz",
    course_id: 101,
    duration: "1 hour",
    quiz_time: "2024-12-06T10:00:00Z",
    questions: [
      {
        id: 1,
        text: "What is React?",
        options: [
          { id: 1, text: "A JavaScript library", is_correct: true },
          { id: 2, text: "A programming language", is_correct: false },
        ],
      },
      {
        id: 2,
        text: "What is JSX?",
        options: [
          { id: 3, text: "JavaScript XML", is_correct: true },
          { id: 4, text: "JavaScript Extension", is_correct: false },
        ],
      },
    ],
  };

  const handleEditQuestion = (questionId) => {
    alert(`Edit Question: ${questionId}`);
  };

  const handleDeleteQuestion = (questionId) => {
    alert(`Delete Question: ${questionId}`);
  };

  return (
    <Card title={quiz.name} className="quiz-detail-container">
      <div className="quiz-info">
        <Paragraph>
          <strong>Course ID:</strong> {quiz.course_id} | <strong>Duration:</strong> {quiz.duration} | <strong>Quiz Time:</strong> {new Date(quiz.quiz_time).toLocaleString()}
        </Paragraph>
      </div>

      <Divider />

      <div className="questions-list">
        <Title level={2}>Questions</Title>
        {quiz.questions && quiz.questions.length > 0 ? (
          <ul>
            {quiz.questions.map((question) => (
              <li key={question.id} className="question-item">
                <Paragraph>{question.text}</Paragraph>
                <div className="question-actions">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEditQuestion(question.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Paragraph>No questions available for this quiz.</Paragraph>
        )}
      </div>
    </Card>
  );
};

export default QuizDetail;