import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Collapse, Button, Modal, Form, Input, message,Select } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;
const DetailCourseT = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  const [course, setCourse] = useState(null);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
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
    if (!duration) return "0h 0m 0s";

    let hours, minutes, seconds;

    if (duration.includes(" ")) {
      const [days, time] = duration.split(" ");
      [hours, minutes, seconds] = time.split(":");
      hours = parseInt(days) * 24 + parseInt(hours);
    } else {
      [hours, minutes, seconds] = duration.split(":");
    }

    return `${parseInt(hours)}h ${parseInt(minutes)}m ${parseInt(seconds)}s`;
  };

  // Handle Update Chapter
  const handleUpdateChapter = (values) => {
    const token = localStorage.getItem('accessToken');
    fetch(`http://127.0.0.1:8000/api/update-delete-chapter/${currentChapter.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then(response => response.json())
      .then(data => {
        message.success('Chapter updated successfully');
        setCourse(prevState => {
          const updatedChapters = prevState.chapters.map(chapter =>
            chapter.id === currentChapter.id ? data : chapter
          );
          return { ...prevState, chapters: updatedChapters };
        });
        setIsEditingChapter(false);
      })
      .catch(error => {
        message.error('Failed to update chapter');
        console.error(error);
      });
  };

  // Handle Delete Chapter
  const handleDeleteChapter = (chapterId) => {
    const token = localStorage.getItem('accessToken');
    fetch(`http://127.0.0.1:8000/api/update-delete-chapter/${chapterId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(() => {
        message.success('Chapter deleted successfully');
        setCourse(prevState => ({
          ...prevState,
          chapters: prevState.chapters.filter(chapter => chapter.id !== chapterId),
        }));
      })
      .catch(error => {
        message.error('Failed to delete chapter');
        console.error(error);
      });
  };

  // Handle Update Lesson
  // const handleUpdateLesson = (values) => {
  //   const token = localStorage.getItem('accessToken');
  //   fetch(`http://127.0.0.1:8000/api/update-delete-lesson/${currentLesson.id}/`, {
  //     method: 'PUT',
  //     headers: {
  //       'Authorization': `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(values),
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       message.success('Lesson updated successfully');
  //       setCourse(prevState => {
  //         const updatedChapters = prevState.chapters.map(chapter => {
  //           if (chapter.id === currentChapter.id) {
  //             const updatedLessons = chapter.lessons.map(lesson =>
  //               lesson.id === currentLesson.id ? data : lesson
  //             );
  //             return { ...chapter, lessons: updatedLessons };
  //           }
  //           return chapter;
  //         });
  //         return { ...prevState, chapters: updatedChapters };
  //       });
  //       setIsEditingLesson(false);
  //     })
  //     .catch(error => {
  //       message.error('Failed to update lesson');
  //       console.error(error);
  //     });
  // };


  const handleUpdateLesson = (values) => {
    const token = localStorage.getItem('accessToken');
    fetch(`http://127.0.0.1:8000/api/update-delete-lesson/${currentLesson.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then(response => response.json())
      .then(data => {
        message.success('Lesson updated successfully');
        setCourse(prevState => {
          const updatedChapters = prevState.chapters.map(chapter => {
            if (chapter.id === currentChapter.id) {
              const updatedLessons = chapter.lessons.map(lesson =>
                lesson.id === currentLesson.id ? data : lesson
              );
              return { ...chapter, lessons: updatedLessons };
            }
            return chapter;
          });
          return { ...prevState, chapters: updatedChapters };
        });
        setIsEditingLesson(false);
      })
      .catch(error => {
        message.error('Failed to update lesson');
        console.error(error);
      });
  };
  
  // Handle Delete Lesson
  const handleDeleteLesson = (lessonId) => {
    const token = localStorage.getItem('accessToken');
    fetch(`http://127.0.0.1:8000/api/update-delete-lesson/${lessonId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(() => {
        message.success('Lesson deleted successfully');
        setCourse(prevState => {
          const updatedChapters = prevState.chapters.map(chapter => {
            const updatedLessons = chapter.lessons.filter(lesson => lesson.id !== lessonId);
            return { ...chapter, lessons: updatedLessons };
          });
          return { ...prevState, chapters: updatedChapters };
        });
      })
      .catch(error => {
        message.error('Failed to delete lesson');
        console.error(error);
      });
  };

  // Open edit modals
  const openEditChapterModal = (chapter) => {
    setCurrentChapter(chapter);
    setIsEditingChapter(true);
  };

  const openEditLessonModal = (lesson, chapter) => {
    setCurrentLesson(lesson);
    setCurrentChapter(chapter);
    setIsEditingLesson(true);
  };

  // Close edit modals
  const closeEditChapterModal = () => {
    setIsEditingChapter(false);
    setCurrentChapter(null);
  };

  const closeEditLessonModal = () => {
    setIsEditingLesson(false);
    setCurrentLesson(null);
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
                    <Panel 
                      header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{`${chapter.title} ・ ${chapter.lessons.length} bài học`}</span>
                          <div>
                            <Button 
                              icon={<EditOutlined />} 
                              onClick={() => openEditChapterModal(chapter)} 
                            />
                            <Button 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteChapter(chapter.id)} 
                            />
                          </div>
                        </div>
                      }
                      key={index}
                    >
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="lesson-item">
                          <span className="lesson-icon">
                            {lesson.type === 'video' ? <PlayCircleOutlined /> : <FileTextOutlined />}
                          </span>
                          <span className="lesson-title">{lessonIndex + 1}. {lesson.title}</span>
                          <span className="lesson-duration">{convertDurationToHours(lesson.duration)}</span>
                          <div className="lesson-actions">
                            <Button 
                              icon={<EditOutlined />} 
                              onClick={() => openEditLessonModal(lesson, chapter)} 
                            />
                            <Button 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteLesson(lesson.id)} 
                            />
                          </div>
                        </div>
                      ))}
                    </Panel>
                  ))}
                </Collapse>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>

      {/* Edit Chapter Modal */}
      <Modal
        title="Edit Chapter"
        visible={isEditingChapter}
        onCancel={closeEditChapterModal}
        footer={null}
      >
        <Form
          initialValues={currentChapter}
          onFinish={handleUpdateChapter}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Chapter
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Lesson Modal */}
      {/* <Modal
        title="Edit Lesson"
        visible={isEditingLesson}
        onCancel={closeEditLessonModal}
        footer={null}
      >
        <Form
          initialValues={currentLesson}
          onFinish={handleUpdateLesson}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="Duration (hh:mm:ss)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

         
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Lesson
            </Button>
          </Form.Item>
        </Form>
      </Modal> */}

      {/* Edit Lesson Modal */}
<Modal
  title="Edit Lesson"
  visible={isEditingLesson}
  onCancel={closeEditLessonModal}
  footer={null}
>
  <Form
    initialValues={currentLesson}
    onFinish={handleUpdateLesson}
  >
    <Form.Item name="title" label="Title" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item name="duration" label="Duration (hh:mm:ss)" rules={[{ required: true }]}>
      <Input />
    </Form.Item>

    {/* Add Content Field */}
    <Form.Item name="content" label="Content" rules={[{ required: true }]}>
      <Input.TextArea />
    </Form.Item>

    {/* Add Type Field */}
    <Form.Item name="type" label="Lesson Type" rules={[{ required: true }]}>
      <Select defaultValue={currentLesson?.type} onChange={value => setCurrentLesson(prevState => ({ ...prevState, type: value }))}>
        <Option value="video">Video</Option>
        <Option value="article">Article</Option>
        <Option value="quiz">Quiz</Option>
        <Option value="document">Document</Option>
      </Select>
    </Form.Item>

    <Form.Item>
      <Button type="primary" htmlType="submit">
        Update Lesson
      </Button>
    </Form.Item>
  </Form>
</Modal>

    </Layout>
  );
};

export default DetailCourseT;
