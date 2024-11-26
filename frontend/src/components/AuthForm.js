import React, { useState } from 'react';
import { Form, Input, Button, Tabs, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const { TabPane } = Tabs;

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [userStu, setUserStu] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    address: '',
    personal_email: '',
    role: 'student', // default role
    image: null, // state to hold image
    image_certificate: null, // state to hold image certificate
    id_card: ''
  });
  const [isLecturer, setIsLecturer] = useState(false); // State to check if role is lecturer

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const onChange = (e) => {
    setUserStu({
      ...userStu,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setIsLecturer(e.target.checked);
    setUserStu({
      ...userStu,
      role: e.target.checked ? 'lecturer' : 'student',
    });
  };

  const handleImageChange = (e) => {
    setUserStu({
      ...userStu,
      image: e.target.files[0],
    });
  };

  const handleImageCertificateChange = (e) => {
    setUserStu({
      ...userStu,
      image_certificate: e.target.files[0],
    });
  };

  const handleRegister = () => {
    if (userStu.password !== userStu.confirm_password) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    const formData = new FormData();
    // Append text fields
    Object.keys(userStu).forEach((key) => {
      if (key !== 'image' && key !== 'image_certificate') {
        formData.append(key, userStu[key]);
      }
    });
    // Append images
    if (userStu.image) {
      formData.append('image', userStu.image);
    }
    if (userStu.image_certificate) {
      formData.append('image_certificate', userStu.image_certificate);
    }

    // Chọn endpoint dựa trên vai trò
    const endpoint = userStu.role === 'lecturer' ? 'http://127.0.0.1:4000/api/register-teacher/' : 'http://127.0.0.1:4000/api/register-student/';

    axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        message.success('Đăng ký thành công!');
        console.log(response.data);
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra trong quá trình đăng ký!');
        console.error(error);
      });
  };

  const handleLogin = (values) => {
    // Xác định vai trò dựa trên email
    const isLecturerEmail = values.email.endsWith('@university.edu');
    const role = isLecturerEmail ? 'lecturer' : 'student';
  
    // Chọn endpoint dựa trên vai trò
    const endpoint = role === 'lecturer' ? 'http://127.0.0.1:4000/api/login-teacher/' : 'http://127.0.0.1:4000/api/login/';
  
    axios.post(endpoint, values)
      .then((response) => {
        const { access, refresh } = response.data;
  
        if (access && refresh) {
          localStorage.setItem('accessToken', access);
          localStorage.setItem('refreshToken', refresh);
          message.success('Đăng nhập thành công!');
  
          // Chuyển hướng tùy thuộc vào vai trò
          if (role === 'lecturer') {
            navigate('/teacher-manager'); // Redirect to teacher manager
          } else {
            navigate('/list-courses'); // Redirect to courses list
          }
  
          console.log(response.data);
        } else {
          message.error('Không tìm thấy token. Đăng nhập thất bại!');
        }
      })
      .catch((error) => {
        message.error('Có lỗi xảy ra trong quá trình đăng nhập!');
        console.error(error);
      });
  };
  
  

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '40px 0' }}>
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Đăng Nhập" key="login">
          <Form name="login" onFinish={handleLogin}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane tab="Đăng Ký" key="register">
          <Form name="register" onFinish={handleRegister}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập"
                name="username"
                onChange={onChange}
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                name="email"
                onChange={onChange}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                name="password"
                onChange={onChange}
              />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu"
                name="confirm_password"
                onChange={onChange}
              />
            </Form.Item>
            <Form.Item
              name="phone_number"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Số điện thoại"
                name="phone_number"
                onChange={onChange}
              />
            </Form.Item>
            <Form.Item
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="Địa chỉ"
                name="address"
                onChange={onChange}
              />
            </Form.Item>

            {/* Checkbox for role */}
            <Form.Item>
              <Checkbox onChange={handleRoleChange}>Đăng ký tài khoản giảng viên</Checkbox>
            </Form.Item>

            {/* Fields for lecturer */}
            {isLecturer && (
              <>
                <Form.Item
                  name="personal_email"
                  rules={[{ required: true, message: 'Vui lòng nhập email cá nhân!' }]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="Email cá nhân"
                    name="personal_email"
                    onChange={onChange}
                  />
                </Form.Item>
                <Form.Item
                  name="id_card"
                  rules={[{ required: true, message: 'Vui lòng nhập số CMND/CCCD!' }]}
                >
                  <Input
                    prefix={<IdcardOutlined />}
                    placeholder="Số CMND/CCCD"
                    name="id_card"
                    onChange={onChange}
                  />
                </Form.Item>
                <Form.Item
                  label="Tải lên chứng chỉ giảng viên"
                  name="image_certificate"
                  rules={[{ required: true, message: 'Vui lòng tải lên chứng chỉ!' }]}
                >
                  <Input type="file" accept="image/*" onChange={handleImageCertificateChange} />
                </Form.Item>
              </>
            )}

            {/* Upload Image for Student */}
            <Form.Item label="Tải lên ảnh đại diện" name="image">
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AuthForm;