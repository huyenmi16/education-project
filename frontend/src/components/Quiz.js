import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Modal, Progress } from 'antd';
import Question from './Question';
import RightContent from './Content/RightContent';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    QuestionCircleOutlined,
    TrophyOutlined,
    FileTextOutlined
} from '@ant-design/icons';

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
                    const response = await axios.get(`http://127.0.0.1:5000/api/quiz/detail/${id}/`);
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

    const [score, setScore] = useState(0);
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
        // Tính điểm trên thang điểm 10
        const calculatedScore = (correctAnswers / totalQuestions) * 10;
        setScore(calculatedScore.toFixed(2)); // Làm tròn đến 2 chữ số thập phân


        setResults({
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            unansweredQuestions,
        });
        statusQuiz(calculatedScore)
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

    const statusQuiz = async (calculatedScore) => {
        if (!token) {
            console.error("Token không tồn tại");
            return;
        }

        try {
            const response = await axios.post(`http://127.0.0.1:5000/api/submit-quiz/${id}/`, {
                // score: parseFloat(score) // Gửi điểm dạng số
                score: calculatedScore // Gửi điểm dạng số
            }, {
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
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        <span>Kết quả bài làm</span>
                    </div>
                }
                open={isSecondModalVisible}
                footer={[
                    <Button key="back" onClick={handleSecondModalCancel}>
                        Đóng
                    </Button>
                ]}
                width={500}
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <TrophyOutlined style={{ fontSize: '48px', color: '#ffd700' }} />
                    <Title level={2} style={{ margin: '16px 0' }}>
                        {score} / 10 điểm
                    </Title>
                    <Progress
                        percent={score * 10}
                        status={score >= 5 ? "success" : "exception"}
                        strokeWidth={10}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileTextOutlined style={{ color: '#8c8c8c' }} />
                        <span>Tổng số câu hỏi: {results.totalQuestions}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>Số câu trả lời đúng: {results.correctAnswers}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        <span>Số câu trả lời sai: {results.incorrectAnswers}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <QuestionCircleOutlined style={{ color: '#faad14' }} />
                        <span>Số câu chưa trả lời: {results.unansweredQuestions}</span>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DetailQuiz;
