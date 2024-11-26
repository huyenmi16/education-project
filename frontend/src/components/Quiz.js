import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Modal } from 'antd';
import Question from './Question';
import RightContent from './Content/RightContent';

const { Title } = Typography;

const DetailQuiz = () => {
    const { id } = useParams();
    const [quizDetails, setQuizDetails] = useState(null);
    const [error, setError] = useState(null);
    const location = useLocation();
    const [index, setIndex] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSecondModalVisible, setIsSecondModalVisible] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("accessToken"); // Tối ưu lấy token một lần

    console.log(location.state.courseDuration);

    const [results, setResults] = useState({
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        unansweredQuestions: 0,
    });

    useEffect(() => {
        const fetchQuizDetails = async () => {
            try {
                const storedQuizDetails = localStorage.getItem('quizDetails');

                if (storedQuizDetails) {
                    setQuizDetails(JSON.parse(storedQuizDetails));
                } else {
                    const response = await axios.get(`http://127.0.0.1:5000/api/quiz/${id}/`);
                    const updateQuizDetails = response.data.map((question) => ({
                        ...question,
                        options: question.options.map((option) => ({
                            ...option,
                            isSelected: false,
                        })),
                    }));

                    setQuizDetails(updateQuizDetails);
                }
            } catch (err) {
                setError('Error fetching quiz details');
                console.error('Error fetching quiz details:', err);
            }
        };

        fetchQuizDetails();
    }, [id]);

    const calculateResults = () => {
        if (!quizDetails) return;

        let totalQuestions = quizDetails.length;
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unansweredQuestions = 0;

        quizDetails.forEach(question => {
            const selectedOptions = question.options.filter(option => option.isSelected);
            const correctOptions = question.options.filter(option => option.is_correct);
            const isAnswered = selectedOptions.length > 0;

            const isCorrect = selectedOptions.every(option => option.is_correct) &&
                correctOptions.length === selectedOptions.length;

            if (isAnswered && isCorrect) {
                correctAnswers += 1;
            } else if (isAnswered && !isCorrect) {
                incorrectAnswers += 1;
            } else if (!isAnswered) {
                unansweredQuestions += 1;
            }
        });

        setResults({
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            unansweredQuestions,
        });
        statusQuiz()
    };

    const handleNext = () => {
        if (quizDetails && index < quizDetails.length - 1) {
            setIndex(index + 1);
        }
    };

    const handlePrev = () => {
        if (index > 0) {
            setIndex(index - 1);
        }
    };

    const handleSubmit = () => {
        setIsModalVisible(true);
    };

    const handleFirstModalOk = () => {
        calculateResults();
        setIsModalVisible(false);
        setIsSecondModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const statusQuiz = async () => {
        if (!token) {
            console.error("Token không tồn tại");
            return;
        }
    
        try {
            const response = await axios.post(`http://127.0.0.1:5000/api/submit-quiz/${id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.status === 200) {
                console.log("Nộp bài thành công");
                // Kiểm tra trạng thái sau khi nộp bài
                await checkSubmitStatus();
            } else {
                console.error("Nộp bài thất bại", response);
            }
        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái hoàn thành:", error);
        }
    };
    
    const checkSubmitStatus = async () => {
        if (!token) {
            console.error("Token không tồn tại");
            return;
        }
    
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/check-submit/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.data.is_completed) {
                console.log("Quiz đã hoàn thành:", response.data.is_completed);
                setIsCompleted(true);
            } else {
                console.log("Quiz chưa hoàn thành:", response.data.is_completed);
                setIsCompleted(false);
            }
        } catch (error) {
            console.error("Lỗi kiểm tra trạng thái hoàn thành:", error);
        }
    };
    

    const handleSecondModalCancel = () => {
        setIsSecondModalVisible(false);
        checkSubmitStatus().then(() => {
            console.log(isCompleted); // Bây giờ isCompleted sẽ có giá trị chính xác
            navigate('/listquiz', { state: { isCompleted } });
        });
    };
    

    const handleSecondModalVisible = async () => {
        calculateResults();
        setIsSecondModalVisible(true);
       
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>{location?.state?.quizTitle}</Title>
            {error ? (
                <p>{error}</p>
            ) : (
                <Row gutter={[16, 16]}>
                    <Col span={16}>
                        <Card>
                            <div className="question-answer">
                                {quizDetails && quizDetails.length > 0 && (
                                    <Question
                                        data={quizDetails[index]}
                                        index={index}
                                        setQuizDetails={setQuizDetails}
                                        quizDetails={quizDetails}
                                    />
                                )}
                            </div>
                            <div className="footer" style={{ marginTop: '16px' }}>
                                <Button onClick={handlePrev} disabled={index === 0}>
                                    Prev
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    style={{ marginLeft: '8px' }}
                                    disabled={quizDetails && index >= quizDetails.length - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <div className="right-content">
                                <RightContent
                                  quizDetails={quizDetails}
                                  countDownDuration={location?.state?.courseDuration}
                                  onTimeUp={handleSecondModalVisible}
                                  setIndex={setIndex}
                                />
                            </div>
                            <div>
                                <Button type="primary" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            <Modal
                title="Xác nhận nộp bài"
                open={isModalVisible}
                onOk={handleFirstModalOk}
                onCancel={handleCancel}
                okText="Yes"
                cancelText="No"
            >
                <p>Bạn có chắc chắn muốn nộp bài?</p>
            </Modal>

            <Modal
                title="Quiz đã được nộp"
                open={isSecondModalVisible}
                footer={null}
                onCancel={handleSecondModalCancel}
            >
                <p>Số câu hỏi: {results.totalQuestions}</p>
                <p>Số câu trả lời đúng: {results.correctAnswers}</p>
                <p>Số câu trả lời sai: {results.incorrectAnswers}</p>
                <p>Số câu chưa trả lời: {results.unansweredQuestions}</p>
            </Modal>
        </div>
    );
};

export default DetailQuiz;
