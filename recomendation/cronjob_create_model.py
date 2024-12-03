import mysql.connector
import pickle
import os
from datetime import datetime
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging


class CollaborativeFiltering:
    def __init__(self):
        self.user_item_matrix = None
        self.user_mapping = {}  # map user_id to matrix index
        self.item_mapping = {}  # map course_id to matrix index
        self.reverse_user_mapping = {}  # map matrix index to user_id
        self.reverse_item_mapping = {}  # map matrix index to course_id

    def _update_mappings(self, reviews):
        """Cập nhật mapping giữa ID thực tế và index trong ma trận"""
        for user_id, course_id, _ in reviews:
            if user_id not in self.user_mapping:
                idx = len(self.user_mapping)
                self.user_mapping[user_id] = idx
                self.reverse_user_mapping[idx] = user_id

            if course_id not in self.item_mapping:
                idx = len(self.item_mapping)
                self.item_mapping[course_id] = idx
                self.reverse_item_mapping[idx] = course_id

    def _create_or_update_matrix(self, reviews):
        """Tạo hoặc cập nhật user-item matrix"""
        # Kích thước ma trận mới
        n_users = len(self.user_mapping)
        n_items = len(self.item_mapping)

        # Nếu chưa có ma trận, tạo ma trận mới
        if self.user_item_matrix is None:
            self.user_item_matrix = np.zeros((n_users, n_items))
        # Nếu ma trận cũ nhỏ hơn, tạo ma trận mới lớn hơn
        elif self.user_item_matrix.shape[0] < n_users or self.user_item_matrix.shape[1] < n_items:
            new_matrix = np.zeros((n_users, n_items))
            new_matrix[:self.user_item_matrix.shape[0], :self.user_item_matrix.shape[1]] = self.user_item_matrix
            self.user_item_matrix = new_matrix

        # Cập nhật ratings mới vào ma trận
        for user_id, course_id, rating in reviews:
            user_idx = self.user_mapping[user_id]
            item_idx = self.item_mapping[course_id]
            self.user_item_matrix[user_idx, item_idx] = rating

    def partial_fit(self, reviews):
        """Train model với batch data mới"""
        try:
            # Cập nhật mappings với data mới
            self._update_mappings(reviews)

            # Cập nhật user-item matrix
            self._create_or_update_matrix(reviews)

            logging.info(f"Matrix updated successfully. New shape: {self.user_item_matrix.shape}")

        except Exception as e:
            logging.error(f"Error in partial_fit: {e}")
            raise

    def recommend_items(self, user_id, n_recommendations=5):
        """Gợi ý khóa học cho user"""
        try:
            if user_id not in self.user_mapping:
                return []

            user_idx = self.user_mapping[user_id]
            user_ratings = self.user_item_matrix[user_idx]

            # Tính similarity giữa các items
            item_similarity = cosine_similarity(self.user_item_matrix.T)

            # Dự đoán rating cho các khóa học chưa học
            predictions = np.zeros(len(self.item_mapping))
            for item_idx in range(len(self.item_mapping)):
                if user_ratings[item_idx] == 0:  # Chỉ dự đoán cho khóa học chưa học
                    similar_items = item_similarity[item_idx]
                    predictions[item_idx] = np.sum(similar_items * user_ratings) / (
                                np.sum(np.abs(similar_items)) + 1e-9)

            # Lấy top n khóa học có predicted rating cao nhất
            recommended_idx = np.argsort(predictions)[::-1][:n_recommendations]
            recommendations = [(self.reverse_item_mapping[idx], predictions[idx])
                               for idx in recommended_idx if predictions[idx] > 0]

            return recommendations

        except Exception as e:
            logging.error(f"Error in recommend_items: {e}")
            return []

    def get_similar_items(self, item_id, n_similar=5):
        """Tìm các khóa học tương tự"""
        try:
            if item_id not in self.item_mapping:
                return []

            item_idx = self.item_mapping[item_id]
            item_similarity = cosine_similarity(self.user_item_matrix.T)
            similar_scores = item_similarity[item_idx]

            # Lấy top n khóa học tương tự nhất (trừ chính nó)
            similar_idx = np.argsort(similar_scores)[::-1][1:n_similar + 1]
            similar_items = [(self.reverse_item_mapping[idx], similar_scores[idx])
                             for idx in similar_idx]

            return similar_items

        except Exception as e:
            logging.error(f"Error in get_similar_items: {e}")
            return []
# from collaborative_filtering import CollaborativeFiltering

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)



class ModelTrainer:
    def __init__(self):
        self.db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': '123456',
            'database': 'course_service',
            'port': '3306'
        }
        self.model_path = 'cf_model.pkl'

    def connect_db(self):
        try:
            conn = mysql.connector.connect(**self.db_config)
            return conn
        except mysql.connector.Error as err:
            logging.error(f"Database connection error: {err}")
            raise

    def get_untrained_reviews(self):
        conn = self.connect_db()
        cursor = conn.cursor(dictionary=True)

        try:
            query = """
                SELECT cr.user_id, cr.course_id_id as course_id, cr.rating, cr.id
                FROM course_service_coursereview cr
                WHERE cr.trained = 0
            """
            cursor.execute(query)
            reviews = cursor.fetchall()
            logging.info(f"Found {len(reviews)} untrained reviews")
            return reviews

        except mysql.connector.Error as err:
            logging.error(f"Error fetching reviews: {err}")
            raise
        finally:
            cursor.close()
            conn.close()

    def update_trained_status(self, review_ids):
        if not review_ids:
            return

        conn = self.connect_db()
        cursor = conn.cursor()

        try:
            query = """
                UPDATE course_service_coursereview 
                SET trained = 1 
                WHERE id IN ({})
            """.format(','.join(['%s'] * len(review_ids)))

            cursor.execute(query, review_ids)
            conn.commit()
            logging.info(f"Updated trained status for {len(review_ids)} reviews")

        except mysql.connector.Error as err:
            logging.error(f"Error updating trained status: {err}")
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()

    def load_or_create_model(self):
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    model = pickle.load(f)
                if isinstance(model, CollaborativeFiltering):
                    logging.info("Existing model loaded successfully")
                    return model
            except Exception as e:
                logging.error(f"Error loading existing model: {e}")

        logging.info("Creating new CollaborativeFiltering model")
        return CollaborativeFiltering()

    def save_model(self, model):
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(model, f)
            logging.info("Model saved successfully")
        except Exception as e:
            logging.error(f"Error saving model: {e}")
            raise

    def train(self):
        try:
            # Lấy reviews chưa được train
            untrained_reviews = self.get_untrained_reviews()

            if not untrained_reviews:
                logging.info("No new reviews to train")
                return

            # Load hoặc tạo model mới
            model = self.load_or_create_model()

            # Chuẩn bị data cho training
            review_data = [(review['user_id'], review['course_id'], review['rating'])
                           for review in untrained_reviews]

            # Train model với data mới
            model.partial_fit(review_data)

            # Lưu model
            self.save_model(model)

            # Update trạng thái trained
            review_ids = [review['id'] for review in untrained_reviews]
            self.update_trained_status(review_ids)

            logging.info(f"Training completed successfully with {len(untrained_reviews)} new reviews")

        except Exception as e:
            logging.error(f"Training failed: {e}")
            raise


if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.train()
