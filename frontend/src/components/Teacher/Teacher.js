import React, { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, message, Upload, Modal } from 'antd';
import { EditOutlined, PlusOutlined, LockOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
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
            message.error('Không thể tải dữ liệu profile!');
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
            personal_email: profileData.personal_email,
            phone_number: profileData.phone_number,
            address: profileData.address,
            image: profileData.image || '',
            image_certificate: profileData.image_certificate || ''
        });
    };
    const handleImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file); // Save the selected image file
        } else {
            setUploadedFile(null); // Clear the image if it's not an image file
            message.error('Vui lòng chọn tệp hình ảnh hợp lệ!');
        }
    };

    const handleUpdateProfile = async (values) => {
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('email', values.email);
        formData.append('personal_email', values.personal_email);
        formData.append('phone_number', values.phone_number);
        formData.append('address', values.address);

        // Append the image (either the previous image or the new one if uploaded)
        if (uploadedFile) {
            formData.delete('image');
            formData.append('image', uploadedFile);


        }
        else if (profileData.image) {
            try {
                let blob;
                const imageURL = profileData.image.startsWith(baseUrl)
                    ? profileData.image
                    : `${baseUrl}${profileData.image}`; // Đảm bảo URL đầy đủ

                // Kiểm tra nếu profileData.image là một URL
                if (typeof profileData.image === 'string') {
                    // Fetch the existing image URL
                    const response = await fetch(imageURL); // Sử dụng imageURL đã sửa
                    blob = await response.blob();
                } else if (profileData.image instanceof Blob || profileData.image instanceof File) {
                    // Nếu profileData.image là một đối tượng Blob/File trực tiếp
                    blob = profileData.image;
                } else {
                    throw new Error('Invalid image format');
                }

                // Kiểm tra nếu blob hợp lệ và có type
                if (!blob || !blob.type) {
                    throw new Error('Image blob is invalid');
                }

                // Get the file extension based on the MIME type of the blob
                const mimeType = blob.type.split('/')[1]; // Get the file type (e.g., 'jpeg', 'png')
                const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']; // List of supported extensions
                const extension = validExtensions.includes(mimeType) ? mimeType : 'jpg'; // Default to 'jpg' if invalid extension

                // Create the image file using the correct extension
                const imageFile = new File([blob], `user_images.${extension}`, { type: blob.type });


                // Append the image as binary data to the FormData object
                formData.append('image', imageFile); // Ensure formData is created properly



            } catch (error) {
                console.error('Error processing the image:', error);
                message.error('Không thể tải ảnh cũ');
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
            message.success(response.data.message || 'Cập nhật profile thành công!');
            setIsEditing(false);
            setUploadedFile(null); // Clear the uploaded file after successful submission

            setProfileData((prev) => ({
                ...prev,
                ...values,

            }));
            await fetchProfileData();
        } catch (error) {
            message.error(error.response?.data?.error || 'Đã xảy ra lỗi khi cập nhật profile!');
        }
    };
    return (
        // <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '20px', margin: 'auto', maxWidth: '90%' }}>
            <Card
                className="teacher-profile-card"
                title="Profile"
                extra={

                    <div className="teacher-profile-actions">
                        <EditOutlined onClick={showEditModal} />
                        <LockOutlined onClick={() => setIsChangingPassword(true)} />
                    </div>
                }
            >

                <div className="teacher-profile-content">
                    <div className="teacher-profile-details">
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
                        <div className="teacher-profile-image">
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

                    <Form.Item
                        name="image"
                        label="Ảnh đại diện"
                    >
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false} // Prevent auto upload
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
        // </Layout>
    );
};

export default Teacher;