import React, { useState, useEffect } from "react";
import { List, Form, Input, Button, Rate, message, Card } from "antd";
import axios from "axios";
import CourseCard from "./CourseCard";
const { TextArea } = Input;

const CourseReviews = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0); // Rating state
  const [loading, setLoading] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]); // Recommended courses state

  const [currentUserRating, setCurrentUserRating] = useState(null);
  // Fetch reviews
  useEffect(() => {

    const fetchReviews = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn cần đăng nhập để xem đánh giá.");
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/course/${courseId}/review/`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add the token to the headers
            },
          }
        );

        // Assuming `response.data` is an array of reviews
        setReviews(response.data);

        // Find the current user's review by filtering the list
        const currentUserReview = response.data.find(
          (review) => review.current_user_review === true
        );

        if (currentUserReview) {
          const userRating = currentUserReview.rating;
          setCurrentUserRating(userRating); // Store the current user's rating
          console.log("Current user rating:", userRating);
          // fetchRecommendations()
        } else {
          console.log("Current user has no review.");
          setCurrentUserRating(null); // Reset if no review
        }


      } catch (error) {
        console.error("Error fetching reviews:", error);
        message.error("Không thể tải đánh giá. Vui lòng thử lại!");
      }
    };

    fetchReviews();
  }, [courseId]);

  useEffect(() => {
    // Khi currentUserRating thay đổi, gọi fetchRecommendations
    if (currentUserRating !== null) {
      fetchRecommendations(); // Gọi fetchRecommendations với currentUserRating
    }
  }, [currentUserRating]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!newReview || newRating === 0) {
      message.error("Vui lòng nhập nội dung đánh giá và chọn số sao!");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/course/${courseId}/review/`,
        { rating: newRating, review: newReview }, // Send rating and review
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviews([...reviews, response.data]); // Update review list
      setNewReview("");
      setNewRating(0); // Reset rating
      message.success("Gửi đánh giá thành công!");
      fetchRecommendations()
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error(
        error.response?.data?.error || "Không thể gửi đánh giá. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended courses
  const fetchRecommendations = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Bạn cần đăng nhập để xem khóa học đề xuất.");
      return;
    }

    try {
      let response;
      if (newRating) {
        response = await axios.post(
          `http://localhost:8000/api/recommendation/`,
          { course_id: courseId, rating: newRating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      else {
        response = await axios.post(
          `http://localhost:8000/api/recommendation/`,
          { course_id: courseId, rating: currentUserRating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }



      setRecommendedCourses(response.data); // Update recommended courses
      message.success("Tải khóa học đề xuất thành công!");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      message.error(
        error.response?.data?.error || "Không thể tải khóa học đề xuất. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div style={{ marginTop: "24px" }}>
      <h2>Đánh giá từ người dùng</h2>
      <List
        itemLayout="horizontal"
        dataSource={reviews}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <>
                  <strong>Người dùng {item.name}</strong>
                  <Rate disabled defaultValue={item.rating} style={{ marginLeft: 8 }} />
                </>
              }
              description={item.review || "Không có nhận xét."}
            />
            <div>{new Date(item.review_date).toLocaleDateString()}</div>
          </List.Item>
        )}
      />

      <h3>Viết đánh giá của bạn</h3>
      <Form onFinish={handleReviewSubmit}>
        <Form.Item>
          <Rate
            value={newRating}
            onChange={(value) => setNewRating(value)}
            style={{ marginBottom: 8 }}
          />
        </Form.Item>
        <Form.Item>
          <TextArea
            rows={4}
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Nhập đánh giá của bạn..."
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>

      {/* Section for fetching recommended courses */}
      {/* <Button
        type="primary"
        onClick={fetchRecommendations}
        style={{ marginTop: "16px" }}
      >
        Tải khóa học đề xuất
      </Button> */}

      {/* Section for displaying recommended courses */}
      {recommendedCourses.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Khóa học đề xuất</h3>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={recommendedCourses}
            renderItem={(course) => (
              <List.Item>
                {/* <Card
                  hoverable
                  cover={<img alt={course.title} src={course.image} />}
                >
                  <Card.Meta title={course.title} description={course.description} />
                </Card> */}


                <CourseCard
                  id={course.id}
                  title={course.title}
                  price={course.price}
                  time={`Duration: ${course.duration}`}
                  teacher={course.instructor}
                  participants={`Level: ${course.level}`} // Using level to show as participants
                  imageUrl={course.image ? `http://127.0.0.1:8000${course.image}` : 'https://via.placeholder.com/300x150'}
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
