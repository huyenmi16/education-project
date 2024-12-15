import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, message, Upload, Modal } from 'antd';
import { EditOutlined, PlusOutlined, LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './NavBar';
import './CourseLayout.css';
import './Profile.css';
const { Content, Footer } = Layout;

const Profile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phone_number: '',
        address: '',
        image: '',
    });

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm] = Form.useForm();

    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();
    const [uploadedFile, setUploadedFile] = useState(null);

    const baseUrl = 'http://127.0.0.1:4000';

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${baseUrl}/api/profile/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProfileData(response.data);
        } catch (error) {
            message.error('Cannot load profile data!');
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

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

    const showEditModal = () => {
        setIsEditing(true);
        form.setFieldsValue({
            username: profileData.username,
            email: profileData.email,
            phone_number: profileData.phone_number,
            address: profileData.address,
            image: profileData.image || ''
        });
    };

    const handleImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file);
        } else {
            setUploadedFile(null);
            message.error('Please select a valid image file!');
        }
    };

    const handleUpdateProfile = async (values) => {
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('email', values.email);
        formData.append('personal_email', values.personal_email);
        formData.append('phone_number', values.phone_number);
        formData.append('address', values.address);

        if (uploadedFile) {
            formData.append('image', uploadedFile);
        } else if (profileData.image) {
            try {
                const imageURL = profileData.image.startsWith(baseUrl)
                    ? profileData.image
                    : `${baseUrl}${profileData.image}`;

                const response = await fetch(imageURL);
                const blob = await response.blob();

                if (!blob || !blob.type) {
                    throw new Error('Invalid image');
                }

                const mimeType = blob.type.split('/')[1];
                const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
                const extension = validExtensions.includes(mimeType) ? mimeType : 'jpg';

                const imageFile = new File([blob], `user_images.${extension}`, { type: blob.type });
                formData.append('image', imageFile);
            } catch (error) {
                console.error('Error processing the image:', error);
                message.error('Could not load the existing image');
            }
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(
                `${baseUrl}/api/update-profile/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            message.success(response.data.message || 'Profile updated successfully!');
            setIsEditing(false);
            setUploadedFile(null);

            await fetchProfileData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Error updating profile!');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar style={{ position: 'fixed', height: '100vh' }} />
            <Layout>
                <Navbar style={{ position: 'fixed', width: '100%', zIndex: 1 }}  profileData={profileData}  />

                <Content className="content-course-layout">
                    <Card
                        className="profile-card"
                        title="Profile"
                        extra={
                            <div className="profile-actions">
                                <EditOutlined onClick={showEditModal} />
                                <LockOutlined onClick={() => setIsChangingPassword(true)} />
                            </div>
                        }
                    >
                        <div className="profile-content">
                            <div className="profile-details">
                                <p><UserOutlined /> <strong>Username:</strong> {profileData.username}</p>
                                <p><MailOutlined /> <strong>Email:</strong> {profileData.email}</p>
                                <p><PhoneOutlined /> <strong>Phone Number:</strong> {profileData.phone_number}</p>
                                <p><HomeOutlined /> <strong>Address:</strong> {profileData.address}</p>
                            </div>

                            {profileData.image && (
                                <div className="profile-image">
                                    <img
                                        src={`${baseUrl}${profileData.image}`}
                                        alt="Profile"
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

                            <Form.Item
                                name="image"
                                label="Profile Picture"
                            >
                                <Upload
                                    listType="picture-card"
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    accept="image/*"
                                    onChange={({ file }) => handleImageChange(file)}
                                >
                                    <PlusOutlined />
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

                <Footer style={{ textAlign: 'center' }}>
                    Education ©{new Date().getFullYear()} Created by Ngoc Huyen
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Profile;