import React, { useState, useEffect } from "react";
import { Modal, Select, Input, Checkbox, Form, Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

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
        const response = await axios.get(`http://127.0.0.1:5000/api/all-quiz/${selectedCourse}/`, {
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
          image: image ? { uid: image } : null,  // Kiểm tra nếu có hình ảnh
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

  return (
    <Modal
      title="Thêm câu hỏi mới"
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="save"
          type="primary"
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
        <Form.Item label="Chọn khóa học">
          <Select
            placeholder="Chọn khóa học"
            onChange={(value) => setSelectedCourse(value)}
          >
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Select Quiz */}
        <Form.Item label="Chọn bộ câu hỏi">
          <Select
            placeholder="Chọn bộ câu hỏi"
            onChange={(value) => setSelectedQuiz(value)}
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
        <Form.Item label="Nội dung câu hỏi">
          <Input.TextArea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Nhập nội dung câu hỏi"
          />
        </Form.Item>

        {/* Image Upload */}
        <Form.Item label="Hình ảnh">
          <Upload
            beforeUpload={(file) => {
              setImage(file);
              return false; // Prevent auto-upload
            }}
            onRemove={() => setImage(null)}
          >
            <Button icon={<PlusOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>

        {/* Answers */}
        <Form.Item label="Các đáp án">
          {answers.map((answer) => (
            <div
              key={answer.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Input
                placeholder={`Đáp án ${answers.indexOf(answer) + 1}`}
                style={{ flex: 1, marginRight: 8 }}
                value={answer.content}
                onChange={(e) => updateAnswer(answer.id, "content", e.target.value)}
              />
              <Checkbox
                checked={answer.isCorrect}
                onChange={(e) =>
                  updateAnswer(answer.id, "isCorrect", e.target.checked)
                }
              />
            </div>
          ))}
          <Button type="dashed" onClick={addAnswer} block icon={<PlusOutlined />}>
            Thêm đáp án
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuestionFormModal;
