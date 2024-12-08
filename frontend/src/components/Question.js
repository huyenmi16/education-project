import React from 'react';
import { Typography, Checkbox, Card } from 'antd';
import {
    QuestionCircleOutlined,
    CheckCircleOutlined,
    BorderOutlined,
    CheckSquareOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const Question = (props) => {
    const { data, index, setQuizDetails, quizDetails } = props;

    if (!data || !data.text || !data.options || data.options.length === 0) {
        return (
            <Card className="error-card" style={{ textAlign: 'center', padding: '20px' }}>
                <QuestionCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                <p style={{ marginTop: '10px', color: '#8c8c8c' }}>No question data available.</p>
            </Card>
        );
    }

    const handleCheckBox = (e, optionIndex) => {
        const updatedOptions = data.options.map((option, idx) => {
            if (idx === optionIndex) {
                return {
                    ...option,
                    isSelected: e.target.checked,
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
        localStorage.setItem('quizDetails', JSON.stringify(updatedQuizDetails));
    };

    return (
        <Card className="question-card" bordered={false} style={{ borderRadius: '12px' }}>
            <div className="question-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div style={{
                    background: '#1890ff',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}>
                    {index + 1}
                </div>
                <Title level={4} style={{ margin: 0 }}>
                    {data.text}
                </Title>
            </div>

            <div className="answer-section" style={{
                background: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px'
            }}>
                {data.options.map((option, idx) => (
                    <div
                        key={`answer-${idx}`}
                        className="answer-option"
                        style={{
                            marginBottom: '12px',
                            background: 'white',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: option.isSelected ? '1px solid #1890ff' : '1px solid #d9d9d9',
                            boxShadow: option.isSelected ? '0 0 8px rgba(24, 144, 255, 0.2)' : 'none'
                        }}
                        onClick={(e) => handleCheckBox({ target: { checked: !option.isSelected } }, idx)}
                    >
                        <Checkbox
                            checked={option.isSelected || false}
                            style={{ marginRight: '12px' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <span style={{
                                minWidth: '24px',
                                color: '#8c8c8c',
                                fontWeight: '500'
                            }}>
                                {String.fromCharCode(65 + idx)}.
                            </span>
                            <span style={{ flex: 1 }}>{option.text}</span>
                        </div>
                        {option.isSelected ? (
                            <CheckSquareOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                        ) : (
                            <BorderOutlined style={{ color: '#d9d9d9', fontSize: '16px' }} />
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default Question;