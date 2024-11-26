import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Collapse, Button } from 'antd';
import { PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import CourseReviews from './CourseReviews';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import './CourseLayout.css';
import './DetailCourse.css';
import axios from "axios";

const { Content, Footer } = Layout;
const { Panel } = Collapse;

const DetailCourse = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  const [course, setCourse] = useState(null);
  const [courseId, setCourseId] = useState(""); 
  const [message, setMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const { id } = useParams();

  // Fetch course data from API
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/courses/${id}/`)
      .then(response => response.json())
      .then(data => {
        setCourse(data);
        setCourseId(data.id); // Set course ID after fetching data
        // Check registration status after fetching course data
        checkRegistrationStatus(data.id); // Gọi hàm kiểm tra trạng thái đăng ký
      })
      .catch(error => console.error('Error fetching course data:', error));
  }, [id]);

  const checkRegistrationStatus = async (courseId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setMessage("Vui lòng đăng nhập.");
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/check-registration/${courseId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Nếu đã đăng ký, cập nhật trạng thái `isRegistered` thành true
      if (response.data.is_registered) {
        setIsRegistered(true);
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái đăng ký:", error);
      setMessage("Lỗi khi kiểm tra trạng thái đăng ký.");
    }
  };

  // Handle course registration
  const handleRegister = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        setMessage("Vui lòng đăng nhập.");
        return;
    }

    if (!courseId) {
        setMessage("Khóa học không hợp lệ.");
        return;
    }

    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/api/register-course/",
            { course: courseId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 201) {
            setMessage("Đăng ký thành công!");
            setIsRegistered(true);  // Cập nhật trạng thái đăng ký
        } else {
            setMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    } catch (error) {
        if (error.response) {
            const errorMessage = error.response.data.detail || "Đăng ký thất bại.";
            setMessage(errorMessage);
        } else {
            setMessage("Đăng ký thất bại. Vui lòng kiểm tra kết nối mạng.");
        }
    }
  };

  const handleExpandAll = () => {
    if (isExpandedAll) {
      setActiveKeys([]); 
    } else {
      setActiveKeys(course.chapters.map((_, index) => index.toString())); 
    }
    setIsExpandedAll(!isExpandedAll);
  };

  const convertDurationToHours = (duration) => {
    const [days, time] = duration.split(" ");
    const [hours, minutes, seconds] = time.split(":");
    const totalHours = parseInt(days) * 24 + parseInt(hours);
    const totalMinutes = parseInt(minutes);
    const totalSeconds = parseInt(seconds);
    return `${totalHours}h ${totalMinutes}m ${totalSeconds}s`;
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  const imageUrl = `http://127.0.0.1:8000${course.image}`;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar style={{ position: 'fixed', height: '100vh' }} />
      <Layout>
        <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }} />

        <Content className="content-course-layout">
          <div className="content-card-parent">
            <Row gutter={16}>
              <Col xs={24} sm={16} md={16} lg={16}>
                <div className="course-details">
                  <h1>{course.title}</h1>
                  <p>{course.description}</p>
                  <p><strong>Price:</strong> {course.price}</p>
                  <p><strong>Level:</strong> {course.level}</p>
                  <p><strong>Total Lessons:</strong> {course.totalLessons}</p>
                  <p><strong>Duration:</strong> {convertDurationToHours(course.duration)}</p>
                  <p><strong>Instructor:</strong> {course.instructor}</p>

                  <Button 
                    type="primary" 
                    style={{ marginTop: '16px', backgroundColor: isRegistered ? 'gray' : '', color:'black' }} 
                    onClick={handleRegister} 
                    disabled={isRegistered} 
                  >
                    {isRegistered ? 'Đã đăng ký' : 'Đăng ký ngay'}
                  </Button>
                  <p>{message}</p>
                </div>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8}>
                <div className="img-course">
                  <img src={imageUrl} alt="course-img" className="course-image" />
                </div>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <h2>Nội dung khóa học</h2>
                <p>
                  {course.chapters.length} chương ・ {course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} bài học ・ Thời lượng {convertDurationToHours(course.duration)}
                </p>
                <Collapse
                  activeKey={activeKeys}
                  onChange={keys => setActiveKeys(keys)}
                  accordion={false}
                >
                  {course.chapters.map((chapter, index) => (
                    <Panel header={`${chapter.title} ・ ${chapter.lessons.length} bài học`} key={index}>
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="lesson-item">
                          <span className="lesson-icon">
                            {lesson.type === 'video' ? <PlayCircleOutlined /> : <FileTextOutlined />}
                          </span>
                          <span className="lesson-title">{lessonIndex + 1}. {lesson.title}</span>
                          <span className="lesson-duration">{lesson.duration}</span>
                        </div>
                      ))}
                    </Panel>
                  ))}
                </Collapse>
                <p
                  style={{ textAlign: 'right', color: 'red', cursor: 'pointer' }}
                  onClick={handleExpandAll}
                >
                  {isExpandedAll ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </p>
              </Col>
            </Row>

          <Row>
            <Col span={24}>
              <CourseReviews courseId={courseId} />
            </Col>
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

export default DetailCourse;
