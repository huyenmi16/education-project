import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Button } from 'antd';
import { UserOutlined, BookOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import Teacher from './Teacher';
import Course from './CourseT';
import Quiz from './QuizT';
import { useNavigate } from "react-router-dom";
import './TeacherManage.css';
import logo from '../../assets/sidebar-logo.jpg'

const { Header, Sider, Content } = Layout;

const TeacherManage = () => {
  const [activeMenu, setActiveMenu] = useState('teachers');
  const navigate = useNavigate();

  // Khôi phục trạng thái menu khi tải lại trang
  useEffect(() => {
    const storedMenu = localStorage.getItem("activeMenu");
    if (storedMenu) {
      setActiveMenu(storedMenu);
    }
  }, []);

  const renderContent = () => {
    if (activeMenu === 'teachers') return <Teacher />;
    if (activeMenu === 'courses') return <Course />;
    if (activeMenu === 'quizzes') return <Quiz />;
  };

  // Xử lý khi click vào "Logout"
  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // Xóa token khỏi localStorage
    localStorage.removeItem("activeMenu"); // Xóa trạng thái menu khỏi localStorage
    navigate("/"); // Điều hướng đến trang đăng nhập
  };

  const handleMenuSelect = ({ key }) => {
    setActiveMenu(key);
    localStorage.setItem("activeMenu", key); // Lưu trạng thái tab vào localStorage
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider>
        <div className="sidebar-logo">
          <img src={logo} alt="logo" className="logo-image" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          onSelect={handleMenuSelect}
        >
          <Menu.Item key="teachers" icon={<UserOutlined />}>Giảng Viên</Menu.Item>
          <Menu.Item key="courses" icon={<BookOutlined />}>Khóa Học</Menu.Item>
          <Menu.Item key="quizzes" icon={<FileTextOutlined />}>Quiz</Menu.Item>
        </Menu>

        <Button className='logout-btn' onClick={handleLogout}>
          <LogoutOutlined /> Logout
        </Button>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', textAlign: 'center' }}>
          <h2>{activeMenu === 'teachers' ? 'Quản Lý Giảng Viên' : activeMenu === 'courses' ? 'Quản Lý Khóa Học' : 'Quản Lý Quiz'}</h2>
        </Header>

        <Content style={{ margin: '16px', overflow: 'auto' }}>
          <Card>{renderContent()}</Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherManage;
