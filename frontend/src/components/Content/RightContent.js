import React, { useEffect } from 'react';
import CountDown from './CountDown';
import './RightContent.css';

const RightContent = (props) => {
    const { countDownDuration, quizDetails, onTimeUp, setIndex } = props;

    // Chuyển đổi từ chuỗi "HH:MM:SS" sang giây
    const durationInSeconds = countDownDuration ? parseDurationToSeconds(countDownDuration) : 0;

    const handleCircleClick = (index) => {
        setIndex(index);
    };

    return (
        <>
            <div className="time-picker">
                <CountDown onTimeUp={onTimeUp} countDownDuration={durationInSeconds} />
            </div>
            <hr className="border" />
            <div className="question-length">
                {quizDetails && quizDetails.length > 0 &&
                    quizDetails.map((item, index) => {
                        const isAnswered = item.options.some(option => option.isSelected);

                        return (
                            <div
                                key={`question-abc-${index}`}
                                className={`question-item ${isAnswered ? 'answered' : ''}`}
                                onClick={() => handleCircleClick(index)}
                            >
                                {index + 1}
                            </div>
                        );
                    })
                }
            </div>
        </>
    );
};

// Hàm chuyển đổi từ "HH:MM:SS" sang giây
const parseDurationToSeconds = (duration) => {
  const [hours, minutes, seconds] = duration.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

export default RightContent;
