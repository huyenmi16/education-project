import React, { useState, useRef, useEffect } from 'react';
import {
    MessageOutlined,
    SendOutlined,
    CloseOutlined,
    RobotOutlined,
    UserOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import { Button, Input, Drawer, Avatar } from 'antd';


const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage = {
            text: inputValue,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('msg', inputValue);

            console.log('formData: ', formData)
            const response = await fetch('http://127.0.0.1:5005/get_response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: formData,
            });

            const responseText = await response.text();


            // Add bot message
            const botMessage = {
                text: responseText || 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.',
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            // Add error message
            const errorMessage = {
                text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <Button
                type="primary"
                shape="circle"
                icon={<MessageOutlined style={{ fontSize: '24px' }} />}
                size="large"
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            />

            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RobotOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                        <span>Trợ lý AI</span>
                    </div>
                }
                placement="right"
                onClose={() => setIsOpen(false)}
                open={isOpen}
                width={350}
                closeIcon={<CloseOutlined />}
                bodyStyle={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#f5f5f5'
                }}
                headerStyle={{
                    borderBottom: '1px solid #f0f0f0',
                    padding: '16px 24px'
                }}
            >
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            style={{
                                display: 'flex',
                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                alignItems: 'flex-start',
                                gap: '8px',
                            }}
                        >
                            {message.sender === 'bot' && (
                                <Avatar
                                    icon={<RobotOutlined />}
                                    style={{
                                        backgroundColor: '#1890ff',
                                        flexShrink: 0
                                    }}
                                />
                            )}
                            <div
                                style={{
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: message.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    backgroundColor: message.sender === 'user' ? '#1890ff' : 'white',
                                    color: message.sender === 'user' ? 'white' : 'rgba(0, 0, 0, 0.85)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}
                            >
                                <div style={{
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>{message.text}</div>
                                <div
                                    style={{
                                        fontSize: '11px',
                                        marginTop: '4px',
                                        opacity: 0.7,
                                        textAlign: message.sender === 'user' ? 'right' : 'left'
                                    }}
                                >
                                    {message.timestamp}
                                </div>
                            </div>
                            {message.sender === 'user' && (
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{
                                        backgroundColor: '#52c41a',
                                        flexShrink: 0
                                    }}
                                />
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar
                                icon={<RobotOutlined />}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '20px 20px 20px 4px',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}
                            >
                                <LoadingOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
                                Đang nhập...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div
                    style={{
                        padding: '16px',
                        borderTop: '1px solid #f0f0f0',
                        display: 'flex',
                        gap: '8px',
                        backgroundColor: 'white',
                    }}
                >
                    <Input
                        placeholder="Nhập tin nhắn..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        prefix={<MessageOutlined style={{ color: '#bfbfbf' }} />}
                        style={{ borderRadius: '20px' }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        disabled={isLoading}
                        style={{
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                </div>
            </Drawer>
        </>
    );
};

export default ChatBot;