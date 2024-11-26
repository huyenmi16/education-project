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