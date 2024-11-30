import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Collapse } from 'antd';
import { PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons';
// import './CourseLayout.css';
// import './DetailCourse.css';
import { useParams } from 'react-router-dom';


const { Content } = Layout;
const { Panel } = Collapse;

const DetailCourseT = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  const [course, setCourse] = useState(null);
  const { id } = useParams();

  // Fetch course data from API
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/courses/${id}/`)
      .then(response => response.json())
      .then(data => {
        setCourse(data);
      })
      .catch(error => console.error('Error fetching course data:', error));
  }, [id]);

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
      <Layout>
        <Content className="content-course-layout">
          <div className="content-card-parent">
            <Row gutter={16}>
              <Col xs={24} sm={16} md={16} lg={16}>
                <div className="course-details">
                  <h1>{course.title}</h1>
                  <p>{course.description}</p>
                  <p><strong>Price:</strong> {course.price}</p>
                  <p><strong>Level:</strong> {course.level}</p>
                  <p><strong>Duration:</strong> {convertDurationToHours(course.duration)}</p>
                  <p><strong>Instructor:</strong> {course.instructor}</p>
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
                  onClick={() => {
                    if (isExpandedAll) {
                      setActiveKeys([]);
                    } else {
                      setActiveKeys(course.chapters.map((_, index) => index.toString()));
                    }
                    setIsExpandedAll(!isExpandedAll);
                  }}
                >
                  {isExpandedAll ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                </p>
              </Col>
            </Row>
          </div>
        </Content>

        
      </Layout>
    </Layout>
  );
};

export default DetailCourseT;
