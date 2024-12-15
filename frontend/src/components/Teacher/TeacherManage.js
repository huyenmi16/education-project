import React, { useState } from 'react';
import { Layout, Menu, Card, Button } from 'antd';
import { UserOutlined, BookOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import Teacher from './Teacher';
import Course from './CourseT';
import Quiz from './QuizT';
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const TeacherManage = () => {
  const [activeMenu, setActiveMenu] = useState('teachers');
  const navigate = useNavigate();

  const renderContent = () => {
    if (activeMenu === 'teachers') return <Teacher />;
    if (activeMenu === 'courses') return <Course />;
    if (activeMenu === 'quizzes') return <Quiz />;
  };

  // Xử lý khi click vào "Logout"
  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // Xóa token khỏi localStorage
    navigate("/"); // Điều hướng đến trang đăng nhập
  };
  return (
    <Layout style={{ height: '100vh' }}>
      <Sider>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          onSelect={({ key }) => setActiveMenu(key)}
        >
          <Menu.Item key="teachers" icon={<UserOutlined />}>Giảng Viên</Menu.Item>
          <Menu.Item key="courses" icon={<BookOutlined />}>Khóa Học</Menu.Item>
          <Menu.Item key="quizzes" icon={<FileTextOutlined />}>Quiz</Menu.Item>
        </Menu>

        <Button
          onClick={handleLogout}
          style={{
            background: '#1a73e8', // Màu xanh da trời sáng
            color: '#fff', // Màu chữ là trắng
            marginTop: '66vh',
            marginLeft: '28px',
            padding: '10px 20px', // Thêm padding cho nút đẹp hơn
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '8px', // Bo góc nút
            border: 'none', // Loại bỏ đường viền
            fontSize: '16px', // Kích thước font
            transition: 'background-color 0.3s ease', // Hiệu ứng chuyển màu nền khi hover
          }}
          onMouseEnter={(e) => e.target.style.background = '#0093cc'} // Màu nền khi hover
          onMouseLeave={(e) => e.target.style.background = '#00b0ff'} // Màu nền khi không hover
        >
          <LogoutOutlined style={{ fontSize: '20px' }} /> {/* Biểu tượng Logout */}
          Logout
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
