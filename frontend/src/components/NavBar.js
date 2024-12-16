import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Dropdown } from 'antd';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = ({ courses, profileData }) => {
    const [userData, setUserData] = useState([]); // Khởi tạo state cho username
    const [searchQuery, setSearchQuery] = useState("");
    const [allCourses, setAllCourses] = useState([]); // Lưu trữ danh sách khóa học ban đầu
    const navigate = useNavigate();


    // Gọi API để lấy thông tin người dùng
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem("accessToken"); // Lấy token từ localStorage

            if (token) {
                try {
                    const response = await fetch("http://127.0.0.1:4000/api/profile/", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}` // Thêm token vào header
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data); // Lưu username từ response vào state
                    } else {
                        console.error("Failed to fetch profile");
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };

        fetchUserProfile();
    }, []);

    // Lưu danh sách tất cả các khóa học ban đầu
    useEffect(() => {
        if (courses) {
            setAllCourses(courses);
        }
    }, [courses]);

    useEffect(() => {
        if (profileData) {
            setUserData(profileData);
        }
    }, [profileData]);

    // Xử lý khi click vào "Profile"
    const handleProfileClick = () => {
        navigate("/profile"); // Điều hướng đến trang Profile
    };

    // Xử lý khi click vào "Logout"
    const handleLogout = () => {
        localStorage.removeItem("accessToken"); // Xóa token khỏi localStorage
        navigate("/"); // Điều hướng đến trang đăng nhập
    };

    // Xử lý khi thay đổi giá trị tìm kiếm
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            // Nếu có query, tìm kiếm trong danh sách khóa học
            const results = allCourses.filter(course =>
                course.title.toLowerCase().includes(query.toLowerCase())
            );
            navigate("/list-courses", { state: { searchResults: results } });
        } else {
            // Nếu không có query, hiển thị lại toàn bộ danh sách khóa học
            navigate("/list-courses", { state: { searchResults: allCourses } });
        }
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" onClick={handleProfileClick}>
                <span>Profile</span>
            </Menu.Item>
            <Menu.Item key="2" onClick={handleLogout}>
                <span className="logout-btn-1">Logout</span>
            </Menu.Item>
        </Menu>
    );

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                {/* Logo */}
            </div>
            {/* Search */}
            <div className="search">
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search"
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="search-icon"
                    onClick={() => handleSearchChange()}  // Xử lý khi click vào biểu tượng tìm kiếm
                    style={{ cursor: 'pointer' }} // Thêm kiểu con trỏ dạng tay khi hover
                />
            </div>

            <div className="user-profile">
                <Dropdown overlay={menu} trigger={['click']} className="profile-menu">
                    <div onClick={(e) => e.preventDefault()}>
                        <img
                            src={`http://localhost:4000${userData.image}`} // Cập nhật đường dẫn ảnh
                            alt="Avatar"
                            className="profile-avatar"
                        />
                        <span className="username">{userData.username || "Guest"}</span>

                        
                        <FontAwesomeIcon icon={faCaretDown} className="dropdown-icon" />
                    </div>
                </Dropdown>
            </div>
        </nav>
    );
};

export default Navbar;
