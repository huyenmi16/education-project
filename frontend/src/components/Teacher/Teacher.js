import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, message, Upload } from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content, Footer } = Layout;

const Teacher = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        personal_email: '',
        phone_number: '',
        address: '',
        image: '',
        image_certificate: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const baseUrl = 'http://127.0.0.1:4000'; // Cấu hình URL gốc của server

    useEffect(() => {
        axios.get(`${baseUrl}/api/profile/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        })
        .then(response => {
            setProfileData(response.data);
        })
        .catch(() => {
            message.error('Failed to load profile data');
        });
    }, []);

    const handleUpdateProfile = values => {
        axios.put(`${baseUrl}/api/update-profile/`, values, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        })
        .then(response => {
            setProfileData(response.data);
            setIsEditing(false);
            message.success('Profile updated successfully');
        })
        .catch(() => {
            message.error('Failed to update profile');
        });
    };

    const handleChangePassword = values => {
        axios.post(`${baseUrl}/api/change-password/`, values, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        })
        .then(() => {
            setIsChangingPassword(false);
            message.success('Password changed successfully');
        })
        .catch(() => {
            message.error('Failed to change password');
        });
    };

    const handleImageUpload = options => {
        const { file } = options;
        const formData = new FormData();
        formData.append('image', file);

        axios.post(`${baseUrl}/api/upload-image/`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            setProfileData(prev => ({ ...prev, image: response.data.image }));
            message.success('Image uploaded successfully');
        })
        .catch(() => {
            message.error('Failed to upload image');
        });
    };

    const handleCertificateUpload = options => {
        const { file } = options;
        const formData = new FormData();
        formData.append('certificate', file);

        axios.post(`${baseUrl}/api/upload-certificate/`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            setProfileData(prev => ({ ...prev, image_certificate: response.data.image_certificate }));
            message.success('Certificate uploaded successfully');
        })
        .catch(() => {
            message.error('Failed to upload certificate');
        });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ padding: '20px', margin: 'auto', maxWidth: '600px' }}>
                <Card
                    title="Profile"
                    bordered={false}
                    style={{ width: '100%' }}
                    extra={
                        <EditOutlined onClick={() => setIsEditing(true)} style={{ fontSize: '20px', color: '#1890ff' }} />
                    }
                >
                    <p><strong>Username:</strong> {profileData.username}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Personal Email:</strong> {profileData.personal_email}</p>
                    <p><strong>Phone Number:</strong> {profileData.phone_number}</p>
                    <p><strong>Address:</strong> {profileData.address}</p>
                    {profileData.image && (
                        <img
                            src={`${baseUrl}${profileData.image}`}
                            alt="Profile"
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', marginBottom: '10px' }}
                        />
                    )}
                    {profileData.image_certificate && (
                        <p>
                            <a
                                href={`${baseUrl}${profileData.image_certificate}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Certificate
                            </a>
                        </p>
                    )}
                    <Button onClick={() => setIsChangingPassword(true)} style={{ marginTop: '10px' }}>
                        Change Password
                    </Button>
                </Card>

                {/* Update profile form */}
                {isEditing && (
                    <Card title="Update Profile" bordered={false} style={{ width: '100%', marginTop: 20 }}>
                        <Form initialValues={profileData} onFinish={handleUpdateProfile}>
                            <Form.Item name="username" label="Username">
                                <Input />
                            </Form.Item>
                            <Form.Item name="email" label="Email">
                                <Input />
                            </Form.Item>
                            <Form.Item name="personal_email" label="Personal Email">
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone_number" label="Phone Number">
                                <Input />
                            </Form.Item>
                            <Form.Item name="address" label="Address">
                                <Input />
                            </Form.Item>
                            <Form.Item name="image" label="Profile Image">
                                <Upload customRequest={handleImageUpload} showUploadList={false}>
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item name="image_certificate" label="Certificate">
                                <Upload customRequest={handleCertificateUpload} showUploadList={false}>
                                    <Button icon={<UploadOutlined />}>Upload</Button>
                                </Upload>
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
                    <Card title="Change Password" bordered={false} style={{ width: '100%', marginTop: 20 }}>
                        <Form onFinish={handleChangePassword}>
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
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Education ©{new Date().getFullYear()} Created by Ngoc Huyen
            </Footer>
        </Layout>
    );
};

export default Teacher;
