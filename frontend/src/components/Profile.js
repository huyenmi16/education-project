import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import './CourseLayout.css';
import axios from 'axios';

const { Content, Footer } = Layout;

const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phone_number: '',
        address: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        axios.get('http://127.0.0.1:4000/api/profile/', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
        .then(response => {
            setProfileData(response.data);
        })
        .catch(error => {
            message.error('Failed to load profile data');
        });
    }, []);

    const handleUpdateProfile = (values) => {
        axios.put('http://127.0.0.1:4000/api/update-profile/', values, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
        .then(response => {
            setProfileData(response.data);
            setIsEditing(false);
            message.success('Profile updated successfully');
        })
        .catch(error => {
            message.error('Failed to update profile');
        });
    };

    const handleChangePassword = (values) => {
        axios.post('http://127.0.0.1:4000/api/change-password/', values, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
        .then(response => {
            setIsChangingPassword(false);
            message.success('Password changed successfully');
        })
        .catch(error => {
            message.error('Failed to change password');
        });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar style={{ position: 'fixed', height: '100vh' }} />
            <Layout>
                <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }} />

                <Content className="content-course-layout">
                    <div className="content-card-parent">
                        <Card
                            title="Profile"
                            bordered={false}
                            style={{ width: 300 }}
                            extra={
                                <EditOutlined onClick={() => setIsEditing(true)} style={{ fontSize: '20px', color: '#1890ff' }} />
                            }
                        >
                            <p><strong>Username:</strong> {profileData.username}</p>
                            <p><strong>Email:</strong> {profileData.email}</p>
                            <p><strong>Phone Number:</strong> {profileData.phone_number}</p>
                            <p><strong>Address:</strong> {profileData.address}</p>
                            <Button onClick={() => setIsChangingPassword(true)} style={{ marginTop: '10px' }}>
                                Change Password
                            </Button>
                        </Card>

                        {/* Update profile form modal */}
                        {isEditing && (
                            <Card title="Update Profile" bordered={false} style={{ width: 300, marginTop: 20 }}>
                                <Form
                                    initialValues={profileData}
                                    onFinish={handleUpdateProfile}
                                >
                                    <Form.Item name="username" label="Username">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="email" label="Email">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="phone_number" label="Phone Number">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="address" label="Address">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            Save Changes
                                        </Button>
                                        <Button onClick={() => setIsEditing(false)} style={{ marginLeft: '10px' }}>
                                            Cancel
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        )}

                        {/* Change password form */}
                        {isChangingPassword && (
                            <Card title="Change Password" bordered={false} style={{ width: 300, marginTop: 20 }}>
                                <Form
                                    onFinish={handleChangePassword}
                                >
                                    <Form.Item
                                        name="old_password"
                                        label="Old Password"
                                        rules={[{ required: true, message: 'Please input your old password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                    <Form.Item
                                        name="new_password"
                                        label="New Password"
                                        rules={[{ required: true, message: 'Please input your new password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                    <Form.Item
                                        name="confirm_new_password"
                                        label="Confirm New Password"
                                        rules={[{ required: true, message: 'Please confirm your new password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit">
                                            Change Password
                                        </Button>
                                        <Button onClick={() => setIsChangingPassword(false)} style={{ marginLeft: '10px' }}>
                                            Cancel
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        )}
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    Education ©{new Date().getFullYear()} Created by Ngoc Huyen
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Profile;
