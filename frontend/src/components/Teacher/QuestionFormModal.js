import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Checkbox, Form, Upload, Button, message } from "antd";
import axios from "axios";
import {
  PlusOutlined,
  BookOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';


const { Option } = Select;

const QuestionFormModal = ({ isVisible, onClose }) => {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [image, setImage] = useState(null);
  const [answers, setAnswers] = useState([{ id: Date.now(), content: "", isCorrect: false }]);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Fetch courses on component load
  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/all-courses/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (error) {
        message.error("Không thể tải danh sách khóa học!");
      }
    };

    fetchCourses();
  }, []);

  // Fetch quizzes when a course is selected
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!selectedCourse) return;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/quiz/get-by-course/${selectedCourse}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Quizzes API Response:", response.data); // Kiểm tra dữ liệu trả về
        setQuizzes(response.data.data || []);
      } catch (error) {
        message.error("Không thể tải danh sách bộ câu hỏi!");
      }
    };

    fetchQuizzes();
  }, [selectedCourse]);

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Bạn chưa đăng nhập!");
      return;
    }

    if (!selectedQuiz || !questionText.trim() || !selectedCourse) {
      message.error("Vui lòng điền đủ thông tin khóa học, bộ câu hỏi và nội dung câu hỏi.");
      return;
    }

    setIsSaving(true);

    try {
      // Chuẩn bị payload cho câu hỏi
      const questionPayload = {
        question: {
          text: questionText,
          course_id: selectedCourse,
        },
        options: answers.map((answer) => ({
          text: answer.content,
          is_correct: answer.isCorrect
        })),
      };

      // Gửi yêu cầu POST tới API
      const questionResponse = await axios.post(
        `http://127.0.0.1:5000/api/quiz/${selectedQuiz}/questions/`,
        questionPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("Câu hỏi và các đáp án đã được thêm thành công!");
      resetForm();  // Reset form nhưng không đóng modal
    } catch (error) {
      message.error("Không thể thêm câu hỏi!");
    } finally {
      setIsSaving(false);
    }
  };



  const resetForm = () => {
    setQuestionText("");
    setImage(null);
    setAnswers([{ id: Date.now(), content: "", isCorrect: false }]);
  };

  const addAnswer = () =>
    setAnswers([...answers, { id: Date.now(), content: "", isCorrect: false }]);

  const updateAnswer = (id, key, value) => {
    setAnswers(
      answers.map((answer) => (answer.id === id ? { ...answer, [key]: value } : answer))
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file

    if (file && file.type.startsWith('image/')) { // Ensure the file is an image
      setImageFile(file); // Save the selected image file
    } else {
      setImageFile(null); // Clear the image if it's not an image file
      message.error('Vui lòng chọn tệp hình ảnh hợp lệ!');
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QuestionCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <span>Thêm câu hỏi mới</span>
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" icon={<CloseCircleOutlined />} onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
        >
          Lưu
        </Button>,
      ]}
      width={800}
    >
      <Form layout="vertical">
        {/* Select Course */}
        <Form.Item
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOutlined style={{ color: '#1890ff' }} />
              Chọn khóa học
            </span>
          }
        >
          <Select
            placeholder="Chọn khóa học"
            onChange={(value) => setSelectedCourse(value)}
            style={{ width: '100%' }}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Select Quiz */}
        <Form.Item
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              Chọn bộ câu hỏi
            </span>
          }
        >
          <Select
            placeholder="Chọn bộ câu hỏi"
            onChange={(value) => setSelectedQuiz(value)}
            style={{ width: '100%' }}
          >
            {quizzes.length === 0 ? (
              <Option disabled>Không có bộ câu hỏi</Option>
            ) : (
              quizzes.map((quiz) => (
                <Option key={quiz.id} value={quiz.id}>
                  {quiz.name}
                </Option>
              ))
            )}
          </Select>
        </Form.Item>

        {/* Question Content */}
        <Form.Item
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QuestionCircleOutlined style={{ color: '#1890ff' }} />
              Nội dung câu hỏi
            </span>
          }
        >
          <Input.TextArea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Nhập nội dung câu hỏi"
            style={{ minHeight: '100px' }}
          />
        </Form.Item>

        {/* Answers */}
        <Form.Item
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              Các đáp án
            </span>
          }
        >
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {answers.map((answer, index) => (
              <div
                key={answer.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                  background: 'white',
                  padding: '8px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <span style={{
                  minWidth: '30px',
                  color: '#8c8c8c',
                  fontWeight: '500'
                }}>
                  {index + 1}.
                </span>
                <Input
                  placeholder={`Đáp án ${index + 1}`}
                  style={{
                    flex: 1,
                    marginRight: 8,
                    border: 'none',
                    borderBottom: '1px solid #d9d9d9'
                  }}
                  value={answer.content}
                  onChange={(e) => updateAnswer(answer.id, "content", e.target.value)}
                />
                <Checkbox
                  checked={answer.isCorrect}
                  onChange={(e) => updateAnswer(answer.id, "isCorrect", e.target.checked)}
                >
                  <span style={{ color: '#52c41a' }}>Đáp án đúng</span>
                </Checkbox>
              </div>
            ))}
          </div>
          <Button
            type="dashed"
            onClick={addAnswer}
            block
            icon={<PlusOutlined />}
            style={{
              borderColor: '#1890ff',
              color: '#1890ff'
            }}
          >
            Thêm đáp án
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

};

export default QuestionFormModal;
