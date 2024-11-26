import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Row, Col, Pagination } from 'antd';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import CourseCard from './CourseCard';
import FilterButton from './FilterButton';
import './CourseLayout.css';
import axios from 'axios';

const { Content, Footer } = Layout;

const MyCourses = () => {
  const [courses, setCourses] = useState([]);  
  const [courseIDs, setCourseIDs] = useState([]);  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const token = localStorage.getItem('accessToken');

  // Hàm lấy danh sách khóa học đã đăng ký
  const listCourseRegisted = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/list-register-course/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     
      setCourseIDs(response.data.registered_course_ids);
    } catch (error) {
      console.error('Error fetching registered courses:', error);
    }
  }, [token]);

  // Hàm lấy chi tiết khóa học
  const fetchCourses = useCallback(async () => {
    try {
      const courseDetails = await Promise.all(
        courseIDs.map(async (id) => {
          const response = await axios.get(`http://127.0.0.1:8000/api/courses/${id}/`);
          return response.data;
        })
      );
     
      setCourses(courseDetails);  
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  }, [courseIDs]);

  // Gọi API khi component mount để lấy danh sách khóa học đã đăng ký
  useEffect(() => {
    listCourseRegisted();
  }, [listCourseRegisted]);

  // Lấy chi tiết khóa học khi courseIDs thay đổi
  useEffect(() => {
    if (courseIDs.length > 0) {
      fetchCourses();
    }
  }, [fetchCourses, courseIDs]);

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = courses.slice(startIndex, endIndex);

  const handlePaginationChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar style={{ position: 'fixed', height: '100vh' }} />

      <Layout>
        <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }} />
        
        <Content className="content-course-layout">
          <div className="content-card-parent">
            <Row className="filter-courses">
              <Col>
                <FilterButton />
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course) => (
                  <Col key={course.id} span={6}>
                    <CourseCard
                      id={course.id}
                      title={course.title}
                      price={course.price}
                      time={`Duration: ${course.duration}`}
                      teacher={course.instructor}
                      participants={`Level: ${course.level}`} 
                      imageUrl={course.image ? `http://127.0.0.1:8000${course.image}` : 'https://via.placeholder.com/300x150'}
                    />
                  </Col>
                ))
              ) : (
                <p>No courses found.</p>
              )}
            </Row>
            <Row justify="center" style={{ marginTop: '16px' }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={courses.length}
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

export default MyCourses;
