import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Row, Col, Pagination, Card, Button } from 'antd';
import Sidebar from './Sidebar'; 
import Navbar from './NavBar';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './CourseLayout.css';

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
                    imageUrl:  `http://127.0.0.1:5000${quiz.image}` ,
                    duration: quiz.duration,
                    quizTime: new Date(quiz.quiz_time).toLocaleString(), // Chuyển đổi thời gian
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

    const handleStartNowClick = (id,titleCourse,durationCourse) => {
        localStorage.removeItem('quizDetails');
        navigate(`/quiz/${id}`,{state:{quizTitle:titleCourse,courseDuration:durationCourse}}); // Chuyển hướng đến trang chi tiết quiz với id cụ thể
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
                                        cover={<img alt={course.title} src={course.imageUrl} />}
                                        title={course.title}
                                        bordered={true}
                                    >
                                        <p>Duration: {course.duration}</p>
                                        <p>Quiz Time: {course.quizTime}</p>
                                       
                                        <Button
                                            type="primary"
                                            disabled={isCompleted} // Nút bị vô hiệu hóa khi isCompleted là true
                                            onClick={() => handleStartNowClick(course.id, course.title, course.duration)}
                                        >
                                            {isCompleted ? 'Completed' : 'Start Now'} {/* Thay đổi nhãn nút */}
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
