import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Row, Col, Pagination, Card, Button } from 'antd';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import { useNavigate, useLocation } from 'react-router-dom';
import './CourseLayout.css';
import {
    ClockCircleOutlined,
    CheckCircleFilled,
    CalendarOutlined,
    TrophyOutlined,
    StarFilled
} from '@ant-design/icons';


const { Content, Footer } = Layout;

const ListQuiz = () => {
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const navigate = useNavigate();
    const location = useLocation();
    const isCompleted = location?.state?.isCompleted;


    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const token = localStorage.getItem('accessToken'); // Lấy token từ localStorage
                const response = await axios.get('http://127.0.0.1:5000/api/list-quiz/', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Thêm token vào tiêu đề yêu cầu
                    },
                });

                // Chuyển đổi dữ liệu nếu cần thiết, ví dụ: đổi tên trường
                const quizzes = response.data.map(quiz => ({
                    id: quiz.id,
                    title: quiz.name,
                    imageUrl: `http://127.0.0.1:5000${quiz.image}`,
                    duration: quiz.duration,
                    quizTime: new Date(quiz.quiz_time).toLocaleString(), // Chuyển đổi thời gian
                    is_completed: quiz.is_completed,
                    score: quiz.score
                }));
                setFilteredCourses(quizzes); // Cập nhật danh sách các quiz
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchQuizzes();
    }, []); // Chỉ chạy một lần khi component được mount

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);


    const handlePaginationChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const handleStartNowClick = (id, titleCourse, durationCourse) => {
        localStorage.removeItem('quizDetails');
        navigate(`/quiz/${id}`, { state: { quizTitle: titleCourse, courseDuration: durationCourse } }); // Chuyển hướng đến trang chi tiết quiz với id cụ thể
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar style={{ position: 'fixed', height: '100vh' }} />
            <Layout>
                <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }} />
                <Content className="content-course-layout">
                    <div className="content-card-parent">
                        <Row gutter={[16, 16]}>
                            {paginatedCourses.map((course) => (
                                <Col key={course.id} span={6}>
                                    <Card
                                        hoverable
                                        cover={
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    alt={course.title}
                                                    src={course.imageUrl}
                                                    style={{ height: 200, objectFit: 'cover' }}
                                                />
                                                {course.is_completed && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 12,
                                                            right: 12,
                                                            background: '#52c41a',
                                                            color: 'white',
                                                            padding: '4px 12px',
                                                            borderRadius: '15px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        <CheckCircleFilled />
                                                        Completed
                                                    </div>
                                                )}
                                            </div>
                                        }
                                        style={{
                                            width: 300,
                                            margin: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                        }}
                                    >
                                        <Card.Meta
                                            title={<div style={{ fontSize: '18px', marginBottom: '12px' }}>{course.title}</div>}
                                            description={
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {course.is_completed && (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                backgroundColor: '#f6ffed',
                                                                padding: '8px',
                                                                borderRadius: '6px',
                                                                marginBottom: '4px'
                                                            }}
                                                        >
                                                            <TrophyOutlined style={{ color: '#ffd700' }} />
                                                            <span style={{
                                                                fontWeight: 'bold',
                                                                color: course.score >= 5 ? '#52c41a' : '#ff4d4f'
                                                            }}>
                                                                Điểm: {course.score}/10
                                                            </span>
                                                            {course.score >= 8 && (
                                                                <>
                                                                    <StarFilled style={{ color: '#ffd700' }} />
                                                                    <StarFilled style={{ color: '#ffd700' }} />
                                                                    <StarFilled style={{ color: '#ffd700' }} />
                                                                </>
                                                            )}
                                                            {course.score >= 5 && course.score < 8 && (
                                                                <>
                                                                    <StarFilled style={{ color: '#ffd700' }} />
                                                                    <StarFilled style={{ color: '#ffd700' }} />
                                                                </>
                                                            )}
                                                            {course.score < 5 && (
                                                                <StarFilled style={{ color: '#ffd700' }} />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                                        <span>Duration: {course.duration}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                                        <span>Quiz Time: {course.quizTime}</span>
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <Button
                                            type={course.is_completed ? "default" : "primary"}
                                            disabled={course.is_completed}
                                            onClick={() => handleStartNowClick(course.id, course.title, course.duration)}
                                            style={{
                                                marginTop: '16px',
                                                width: '100%',
                                                height: '40px',
                                                borderRadius: '6px',
                                                backgroundColor: course.is_completed ? '#f5f5f5' : undefined,
                                                color: course.is_completed ? '#8c8c8c' : undefined
                                            }}
                                        >
                                            {course.is_completed ? 'Completed' : 'Start Now'}
                                        </Button>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <Row justify="center" style={{ marginTop: '16px' }}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={filteredCourses.length}
                                onChange={handlePaginationChange}
                                showSizeChanger
                            />
                        </Row>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Education ©{new Date().getFullYear()} Created by Ngoc Huyen
                </Footer>
            </Layout>
        </Layout>
    );
};

export default ListQuiz;