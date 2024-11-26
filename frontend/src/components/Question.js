import React from 'react';
import { Typography, Checkbox } from 'antd';

const { Title } = Typography;

const Question = (props) => {
    const { data, index, setQuizDetails, quizDetails } = props;

    if (!data || !data.text || !data.options || data.options.length === 0) {
        return <p>No question data available.</p>;
    }

   
    const handleCheckBox = (e, optionIndex) => {
        const updatedOptions = data.options.map((option, idx) => {
            if (idx === optionIndex) {
                return {
                    ...option,
                    isSelected: e.target.checked, // Cập nhật trạng thái đã chọn
                };
            }
            return option;
        });
    
        const updatedQuestion = {
            ...data,
            options: updatedOptions,
        };
    
        const updatedQuizDetails = quizDetails.map((q, idx) => {
            if (idx === index) {
                return updatedQuestion;
            }
            return q;
        });
    
        setQuizDetails(updatedQuizDetails);
    
        // Lưu quizDetails đã cập nhật vào localStorage
        localStorage.setItem('quizDetails', JSON.stringify(updatedQuizDetails));
    };
    

    return (
        <>
            <Title level={4}>Question {index + 1}: {data.text}</Title>
            <hr />
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <img src={data.image} alt={`Question ${index + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
            <div className="answer">
                {data.options.map((a, idx) => (
                    <div key={`answer-${idx}`} className="a-child" style={{ marginBottom: '8px' }}>
                        <Checkbox
                            style={{ marginRight: '8px' }}
                            checked={a.isSelected || false}
                            onChange={(event) => handleCheckBox(event, idx)}
                        />
                        {a.text}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Question;
