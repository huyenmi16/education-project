import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, message, Upload, Modal } from 'antd';
import { EditOutlined, UploadOutlined, LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Teacher.css';

const { Content } = Layout;

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
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const baseUrl = 'http://127.0.0.1:4000';

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

    const handleUpdateProfile = (values) => {
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

    const handleChangePassword = (values) => {
        if (values.new_password !== values.confirm_new_password) {
            message.error('New passwords do not match');
            return;
        }

        axios.post(`${baseUrl}/api/change-password/`, values, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        })
        .then(() => {
            setIsChangingPassword(false);
            message.success('Password changed successfully');
            passwordForm.resetFields();
        })
        .catch((error) => {
            message.error(error.response?.data?.message || 'Failed to change password');
        });
    };

    const handleImageUpload = (options) => {
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

    const handleCertificateUpload = (options) => {
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
        <Layout style={{ minHeight: '80vh' }}>
            <Content style={{ padding: '20px', margin: 'auto', maxWidth: '1220px' }}>
            <Card
                    title="Profile"
                    bordered={false}
                    style={{ width: '170vh',height:'74vh' }}
                    extra={
                        <>
                            <EditOutlined 
                                onClick={() => {
                                    form.setFieldsValue(profileData);
                                    setIsEditing(true);
                                }} 
                                style={{ fontSize: '20px', color: '#1890ff', cursor: 'pointer' }} 
                            />
                            <LockOutlined 
                                onClick={() => setIsChangingPassword(true)} 
                                style={{ fontSize: '20px', color: '#1890ff', cursor: 'pointer', marginLeft: '15px' }} 
                            />
                        </>
                    }
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',marginTop:'100px' }}>
                        <div style={{ flex: 1 }}>
                            <p><strong>Username:</strong> {profileData.username}</p>
                            <p><strong>Email:</strong> {profileData.email}</p>
                            <p><strong>Personal Email:</strong> {profileData.personal_email}</p>
                            <p><strong>Phone Number:</strong> {profileData.phone_number}</p>
                            <p><strong>Address:</strong> {profileData.address}</p>
                            
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
                        </div>

                        {profileData.image && (
                            <div style={{ marginLeft: '20px' }}>
                                <img
                                    src={`${baseUrl}${profileData.image}`}
                                    alt="Profile"
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginBottom: '10px'
                                    }}
                                />
                            </div>
                        )}
                    </div>
            </Card>


                {/* Edit Profile Modal */}
                <Modal
                    title="Edit Profile"
                    open={isEditing}
                    onCancel={() => setIsEditing(false)}
                    footer={null}
                >
                    <Form 
                        form={form}
                        layout="vertical"
                        onFinish={(values) => {
                            handleUpdateProfile(values);
                        }}
                    >
                        <Form.Item 
                            name="username" 
                            label="Username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>
                        
                        <Form.Item 
                            name="email" 
                            label="Email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} />
                        </Form.Item>
                        
                        <Form.Item 
                            name="personal_email" 
                            label="Personal Email"
                            rules={[
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} />
                        </Form.Item>
                        
                        <Form.Item 
                            name="phone_number" 
                            label="Phone Number"
                        >
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                        
                        <Form.Item 
                            name="address" 
                            label="Address"
                        >
                            <Input prefix={<HomeOutlined />} />
                        </Form.Item>
                        
                        <Form.Item name="image" label="Profile Image">
                            <Upload 
                                customRequest={handleImageUpload} 
                                showUploadList={false}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />}>Upload Profile Image</Button>
                            </Upload>
                        </Form.Item>
                        
                        <Form.Item name="image_certificate" label="Certificate">
                            <Upload 
                                customRequest={handleCertificateUpload} 
                                showUploadList={false}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />}>Upload Certificate</Button>
                            </Upload>
                        </Form.Item>
                        
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Change Password Modal */}
                <Modal
                    title="Change Password"
                    open={isChangingPassword}
                    onCancel={() => setIsChangingPassword(false)}
                    footer={null}
                >
                    <Form 
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                    >
                        <Form.Item
                            name="old_password"
                            label="Old Password"
                            rules={[{ required: true, message: 'Please input your old password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} />
                        </Form.Item>
                        
                        <Form.Item
                            name="new_password"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please input your new password!' },
                                { min: 8, message: 'Password must be at least 8 characters long' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} />
                        </Form.Item>
                        
                        <Form.Item
                            name="confirm_new_password"
                            label="Confirm New Password"
                            dependencies={['new_password']}
                            rules={[
                                { required: true, message: 'Please confirm your new password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} />
                        </Form.Item>
                        
                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default Teacher;