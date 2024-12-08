import {
    DollarCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    SignalFilled,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { Card, Button, Modal } from 'antd';
const { confirm } = Modal;


const CourseCard = ({
    course,
    onEdit,
    onDelete,
    onSeeMore,
    showAdminActions = false
}) => {
    const showDeleteConfirm = () => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa khóa học này?',
            icon: <ExclamationCircleOutlined />,
            content: `Khóa học: ${course.title}`,
            okText: 'Đồng ý',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                onDelete(course.id);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    return (
        <Card
            hoverable
            cover={
                <div style={{ position: 'relative', height: 200 }}>
                    <img
                        alt={course.title}
                        src={course.image ? `http://127.0.0.1:8000${course.image}` : 'https://via.placeholder.com/300x150'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            }
            style={{ width: "100%" }}
        >
            <Card.Meta
                title={<div style={{ fontSize: '18px', marginBottom: '12px' }}>{course.title}</div>}
                description={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#1890ff',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}>
                            <DollarCircleOutlined />
                            <span>${course.price}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                <span>{course.duration}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UserOutlined style={{ color: '#8c8c8c' }} />
                                <span>{course.instructor}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <SignalFilled style={{ color: '#8c8c8c' }} />
                                <span>Level: {course.level}</span>
                            </div>
                        </div>
                    </div>
                }
            />

            <div style={{
                marginTop: '16px',
                display: 'flex',
                justifyContent: showAdminActions ? 'space-between' : 'flex-end',
                alignItems: 'center',
                gap: '8px'
            }}>
                {showAdminActions && (
                    <>
                        <Button
                            onClick={() => onEdit(course)}
                            icon={<EditOutlined />}
                            type="text"
                            style={{ color: '#1890ff' }}
                        />
                        <Button
                            onClick={showDeleteConfirm}
                            // onClick={() => onDelete(course.id)}
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                        />
                    </>
                )}
                <Button
                    onClick={() => onSeeMore(course.id)}
                    type="primary"
                    icon={<EyeOutlined />}
                    style={{
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    See More
                </Button>
            </div>
        </Card>
    );
};
export default CourseCard;