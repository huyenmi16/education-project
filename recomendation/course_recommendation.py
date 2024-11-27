import os
import mysql.connector
import pickle
import logging

from recomendation.collaborative_filtering import CollaborativeFiltering

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


class CourseRecommender:
    def __init__(self):
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': '12345',
            'database': 'course_service',
            'port': '3306'
        }
        # self.model_path = 'cf_model.pkl'
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(current_dir, 'recomendation', 'cf_model.pkl')

        self.cf_model = self._load_model()

    def _load_model(self):
        """Load model từ file pkl"""
        try:
            with open(self.model_path, 'rb') as f:
                model = pickle.load(f)
            if not isinstance(model, CollaborativeFiltering):
                raise ValueError("Invalid model type")
            logging.info("Model loaded successfully")
            return model
        except Exception as e:
            logging.error(f"Error loading model: {e}")
            raise

    def get_all_reviews(self):
        """Lấy tất cả reviews từ database"""
        conn = mysql.connector.connect(**self.db_config)
        cursor = conn.cursor(dictionary=True)

        try:
            query = """
                SELECT cr.user_id, cr.course_id_id as course_id, cr.rating
                FROM course_service_coursereview cr
                ORDER BY cr.review_date DESC
            """
            cursor.execute(query)
            reviews = cursor.fetchall()
            logging.info(f"Fetched {len(reviews)} reviews from database")
            return reviews
        except mysql.connector.Error as err:
            logging.error(f"Error fetching reviews: {err}")
            raise
        finally:
            cursor.close()
            conn.close()

    def get_user_rated_courses(self, user_id):
        """Lấy danh sách khóa học user đã đánh giá"""
        conn = mysql.connector.connect(**self.db_config)
        cursor = conn.cursor()

        try:
            query = """
                SELECT course_id_id
                FROM course_service_coursereview
                WHERE user_id = %s
            """
            cursor.execute(query, (user_id,))
            rated_courses = [row[0] for row in cursor.fetchall()]
            return rated_courses
        finally:
            cursor.close()
            conn.close()

    def get_course_details(self, course_ids):
        """Lấy thông tin chi tiết của các khóa học"""
        if not course_ids:
            return []

        conn = mysql.connector.connect(**self.db_config)
        cursor = conn.cursor(dictionary=True)

        try:
            placeholders = ','.join(['%s'] * len(course_ids))
            query = f"""
                SELECT c.id, c.title, c.description, c.instructor, c.duration, 
                       c.price, c.level, c.image,
                       AVG(cr.rating) as avg_rating,
                       COUNT(cr.id) as total_ratings
                FROM course_service.course_service_course c
                LEFT JOIN course_service.course_service_coursereview cr ON c.id = cr.course_id_id
                WHERE c.id IN ({placeholders})
                GROUP BY c.id, c.title, c.description, c.instructor, 
                         c.duration, c.price, c.level, c.image
            """
            cursor.execute(query, course_ids)
            return cursor.fetchall()
        finally:
            cursor.close()
            conn.close()

    def recommend_courses(self, user_id, course_id, rating, rated_courses=None, top_n=3):
        """
        Gợi ý khóa học dựa trên đánh giá mới

        Parameters:
        - user_id: ID của người dùng
        - course_id: ID của khóa học vừa đánh giá
        - rating: Số sao đánh giá (1-5)
        - top_n: Số lượng khóa học muốn gợi ý

        Returns:
        - List of tuples (course_id, predicted_rating, course_details)
        """
        try:
            # Update model với đánh giá mới
            self.cf_model.partial_fit([(user_id, course_id, rating)])

            # Lấy danh sách khóa học đã đánh giá
            if not rated_courses:
                rated_courses = self.get_user_rated_courses(user_id)

            # Lấy gợi ý từ model
            recommendations = self.cf_model.recommend_items(user_id, n_recommendations=top_n + len(rated_courses))

            # Lọc bỏ các khóa học đã đánh giá
            filtered_recommendations = [
                                           (course_id, score)
                                           for course_id, score in recommendations
                                           if course_id not in rated_courses
                                       ][:top_n]

            # Lấy thông tin chi tiết của các khóa học được gợi ý
            course_ids = [course_id for course_id, _ in filtered_recommendations]
            # course_details = self.get_course_details(course_ids)
            course_details = course_ids

            # Kết hợp thông tin
            detailed_recommendations = []
            rating_adjustments = {
                lambda r: r < 1: 4,
                lambda r: r < 2: 3,
                lambda r: r < 3: 2,
                lambda r: r < 2: 1
            }

            def normalize_rating_scale(rating):
                for condition, adjustment in rating_adjustments.items():
                    if condition(rating):
                        return rating + adjustment
                return rating

            recommended_courses = [
                {
                    'course_id': course_id,
                    'predicted_rating': round(normalize_rating_scale(pred_rating), 2)
                }
                for course_id, pred_rating in filtered_recommendations
            ]

            # Sắp xếp theo predicted_rating giảm dần
            recommended_courses.sort(key=lambda x: x['predicted_rating'], reverse=True)

            logging.info(f"Generated {len(recommended_courses)} recommendations for user {user_id}")
            return recommended_courses
            # for (course_id, pred_rating), details in zip(filtered_recommendations, course_details):
            #     pred_rating = normalize_rating_scale(pred_rating)
            #     recommendation = {
            #         'course_id': course_id,
            #         'predicted_rating': round(pred_rating, 2),
            #         # Là điểm số dự đoán rằng người dùng có thể sẽ đánh giá cho khóa học này
            #         'title': details['title'],
            #         'description': details['description'],
            #         'instructor': details['instructor'],  # đã sửa từ instructor_name
            #         'duration': details['duration'],  # thêm duration
            #         'level': details['level'],
            #         'price': details['price'],
            #         'image': details['image'],  # thêm image
            #         'avg_rating': round(details['avg_rating'], 2) if details['avg_rating'] else None,
            #         # Là điểm trung bình thực tế mà khóa học nhận được từ tất cả người dùng đã đánh giá
            #         'total_ratings': details['total_ratings']
            #         # Là tổng số lượng người đã đánh giá cho khóa học
            #     }
            #     detailed_recommendations.append(recommendation)
            #
            # # Sắp xếp theo predicted_rating giảm dần
            # detailed_recommendations.sort(key=lambda x: x['predicted_rating'], reverse=True)
            #
            # logging.info(f"Generated {len(detailed_recommendations)} recommendations for user {user_id}")
            # return detailed_recommendations

        except Exception as e:
            logging.error(f"Error generating recommendations: {e}")
            raise

    def format_recommendations(self, recommendations):
        """Format kết quả gợi ý để hiển thị"""
        if not recommendations:
            return "Không có gợi ý khóa học nào phù hợp."

        result = "Các khóa học được gợi ý:\n\n"
        for i, rec in enumerate(recommendations, 1):
            result += f"{i}. Khóa học: {rec['title']}\n"
            result += f"   - course_id: {rec['course_id']}\n"
            result += f"   - Dự đoán số sao: {rec['predicted_rating']} ★\n"
            result += f"   - Giảng viên: {rec['instructor']}\n"
            result += f"   - Trình độ: {rec['level']}\n"
            result += f"   - Giá: {rec['price']:,} VND\n"
            if rec['avg_rating']:
                result += f"   - Đánh giá trung bình: {rec['avg_rating']} ★ ({rec['total_ratings']} đánh giá)\n"
            result += "\n"

        return result


if __name__ == "__main__":
    recommender = CourseRecommender()
    # Test với một user và khóa học cụ thể
    recommendations = recommender.recommend_courses(user_id=5, course_id=9, rating=5)
    print(recommender.format_recommendations(recommendations))
