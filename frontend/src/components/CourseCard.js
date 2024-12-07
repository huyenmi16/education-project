import React from "react";
import { Card, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleFilled,
  RightOutlined
} from '@ant-design/icons';


const CourseCard = ({ id, title, price, time, teacher, participants, imageUrl, is_registered }) => {
  const navigate = useNavigate();

  const handleStartNowClick = (id) => {
    navigate(`/course/${id}`);
  };

  return (
    <Card
      hoverable
      cover={
        <div style={{ position: 'relative' }}>
          <img alt={title} src={imageUrl} style={{ height: 200, objectFit: 'cover' }} />
          {is_registered && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: '#52c41a',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <CheckCircleFilled />
              Đã đăng ký
            </div>
          )}
        </div>
      }
      style={{
        width: 300,
        margin: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      <Card.Meta
        title={<div style={{ fontSize: '18px', marginBottom: '12px' }}>{title}</div>}
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1890ff',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              <DollarOutlined />
              <span>{price} VND</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                <span>{time}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#8c8c8c' }} />
                <span>{teacher}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TeamOutlined style={{ color: '#8c8c8c' }} />
                <span>{participants}</span>
              </div>
            </div>
          </div>
        }
      />
      <Button
        onClick={() => handleStartNowClick(id)}
        type="primary"
        style={{
          marginTop: '16px',
          width: '100%',
          height: '40px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        See More <RightOutlined />
      </Button>
    </Card>
  );
};


export default CourseCard;
