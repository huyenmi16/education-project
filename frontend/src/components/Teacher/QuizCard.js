import React, { useState } from 'react';
import './QuizCard.css'
import { useNavigate } from 'react-router-dom';
// Component hiển thị từng quiz card
const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();

  const handleToggleMore = () => {
    navigate("/detail-quiz"); 
  };

  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        
        {quiz.image ? (
          <img src={quiz.image} />
        ) : (
          <img src="https://via.placeholder.com/100" alt="default" />  
        )}
      </div>

      <div className="quiz-card-info">
        <h3>{quiz.name}</h3>
        <p>Course ID: {quiz.course_id}</p>
        <p>Duration: {quiz.duration} minutes</p>
        <p>Quiz Time: {new Date(quiz.quiz_time).toLocaleString()}</p>
      </div>

      
      <button className="see-more-btn" onClick={handleToggleMore}>
        see more
      </button>

      
      
    </div>
  );
};

export default QuizCard;
