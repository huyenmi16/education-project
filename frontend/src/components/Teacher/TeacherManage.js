import React, { useState } from 'react';
import { Layout, Menu, Card } from 'antd';
import { UserOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import Teacher from './Teacher';
import Course from './CourseT';
import Quiz from './QuizT';

const { Header, Sider, Content } = Layout;

const TeacherManage = () => {
  const [activeMenu, setActiveMenu] = useState('teachers');

  const renderContent = () => {
    if (activeMenu === 'teachers') return <Teacher />;
    if (activeMenu === 'courses') return <Course />;
    if (activeMenu === 'quizzes') return <Quiz />;
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
