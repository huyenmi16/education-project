import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faPen, faChartPie, faTimeline } from '@fortawesome/free-solid-svg-icons';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import './Sidebar.css';
import logo from '../assets/sidebar-logo.jpg';

const { Sider } = Layout;

function getItem(label, key, icon, route, children) {
  return {
    key,
    icon,
    route,
    children,
    label,
  };
}

const items = [
  getItem('Khóa học', '1', <FontAwesomeIcon icon={faBookOpen} />, '/list-courses'),
  getItem('Bài kiểm tra', '2', <FontAwesomeIcon icon={faPen} />, '/listquiz'),
  getItem('Báo cáo hằng ngày', '3', <FontAwesomeIcon icon={faChartPie} />, '/report'),
  getItem('Lịch sử', 'sub1', <FontAwesomeIcon icon={faTimeline} />, null, [
    getItem('Khóa học của tôi', '4', null, '/mycourse'),
    getItem('Lịch sử báo cáo', '5', null, '/history-report'),
  ]),
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();
  const location = useLocation(); // Lấy location hiện tại

  useEffect(() => {
    // Cập nhật selectedKey dựa trên URL
    const currentItem = findItemByPath(items, location.pathname);
    if (currentItem) {
      setSelectedKey(currentItem.key);
    }
  }, [location.pathname]); // Gọi lại mỗi khi URL thay đổi

  const handleMenuClick = (e) => {
    const clickedItem = findItemByKey(items, e.key);
    if (clickedItem && clickedItem.route) {
      setSelectedKey(e.key); // Cập nhật selectedKey ngay khi nhấp vào menu
      navigate(clickedItem.route); // Điều hướng đến route
    }
  };

  const findItemByKey = (items, key) => {
    for (const item of items) {
      if (item.key === key) {
        return item;
      }
      if (item.children) {
        const found = findItemByKey(item.children, key);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const findItemByPath = (items, path) => {
    for (const item of items) {
      if (item.route === path) {
        return item;
      }
      if (item.children) {
        const found = findItemByPath(item.children, path);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} className="custom-sider">
      <div className="sidebar-logo">
        <img src={logo} alt="logo" className="logo-image" />
      </div>
      <Menu 
        theme="dark" 
        selectedKeys={[selectedKey]} // Chọn key đang được chọn
        mode="inline" 
        items={items} 
        onClick={handleMenuClick} // Cập nhật key khi click
        className="menu-padding"
      />
    </Sider>
  );
};

export default Sidebar;
