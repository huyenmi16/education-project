import React from "react";
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ id, title, price, time, teacher, participants, imageUrl }) => {
  const navigate = useNavigate();

  const handleStartNowClick = (id) => {
    navigate(`/course/${id}`); // Navigate to the course detail page with the dynamic ID
  };

  return (
    <Card
      hoverable
      cover={<img alt={title} src={imageUrl} />}
      style={{ width: 300, margin: '8px' }}
    >
      <Card.Meta
        title={title}
        description={
          <>
            <p>Price: ${price}</p>
            <span>Time: {time} | Teacher: {teacher} | Participants: {participants}</span>
          </>
        }
      />
      <Button 
        onClick={() => handleStartNowClick(id)} // Corrected onClick
        type="primary" 
        style={{ marginTop: '16px' }}
      >
        See More
      </Button>
    </Card>
  );
};

export default CourseCard;
