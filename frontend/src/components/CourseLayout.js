import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Pagination } from 'antd';
import Sidebar from './Sidebar'; 
import Navbar from './NavBar';
import CourseCard from './CourseCard'; // Import the CourseCard component
import FilterButton from './FilterButton';
import './CourseLayout.css';

const { Content, Footer } = Layout;

const CourseLayout = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Fetch courses from the API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/courses/');
        const data = await response.json();
       
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

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
              {paginatedCourses.map((course, index) => (
                <Col key={course.id} span={6}>
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    price={course.price}
                    time={`Duration: ${course.duration}`}
                    teacher={course.instructor}
                    participants={`Level: ${course.level}`} // Using level to show as participants
                    imageUrl={course.image ? `http://127.0.0.1:8000${course.image}` : 'https://via.placeholder.com/300x150'}
                  />
                </Col>
              ))}
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

export default CourseLayout;
