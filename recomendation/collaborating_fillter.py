import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import KFold
from typing import Tuple, List, Dict
import logging
from sklearn.metrics import precision_score, recall_score, f1_score
import pickle

class CollaborativeFiltering:
    def __init__(self, min_ratings: int = 5):
        """
        Khởi tạo mô hình Collaborative Filtering
        
        Parameters:
            min_ratings (int): Số lượng đánh giá tối thiểu cho mỗi user/course
        """
        self.similarity_matrix = None
        self.user_course_matrix = None
        self.min_ratings = min_ratings
        self.logger = self._setup_logger()
        self.global_mean = None
        self.user_means = None

    def _setup_logger(self) -> logging.Logger:
        """Thiết lập logger cho việc theo dõi"""
        logger = logging.getLogger('CollaborativeFiltering')
        logger.setLevel(logging.INFO)
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        return logger

    def preprocess_data(self, ratings_df: pd.DataFrame, courses_df: pd.DataFrame, 
                       users_df: pd.DataFrame) -> pd.DataFrame:
        """
        Tiền xử lý dữ liệu đầu vào
        
        Parameters:
            ratings_df: DataFrame chứa ratings
            courses_df: DataFrame chứa thông tin courses 
            users_df: DataFrame chứa thông tin users
            
        Returns:
            pd.DataFrame: Ma trận user-course đã được xử lý
        """
        self.logger.info("Bắt đầu tiền xử lý dữ liệu...")
        
        # Lọc users và courses có ít đánh giá
        user_counts = ratings_df['user_id'].value_counts()
        course_counts = ratings_df['course_id'].value_counts()
        
        valid_users = user_counts[user_counts >= self.min_ratings].index
        valid_courses = course_counts[course_counts >= self.min_ratings].index
        
        filtered_ratings = ratings_df[
            (ratings_df['user_id'].isin(valid_users)) & 
            (ratings_df['course_id'].isin(valid_courses))
        ]
        
        # Tính trung bình rating và xử lý outliers
        ratings_mean = filtered_ratings.groupby(['user_id', 'course_id'])['rating'].mean()
        
        # Tạo ma trận user-course
        user_course_matrix = ratings_mean.unstack(fill_value=0)
        
        self.logger.info(f"Số lượng users sau khi lọc: {len(valid_users)}")
        self.logger.info(f"Số lượng courses sau khi lọc: {len(valid_courses)}")
        
        return user_course_matrix

    def train(self, user_course_matrix: pd.DataFrame) -> None:
        """
        Huấn luyện mô hình
        
        Parameters:
            user_course_matrix: Ma trận user-course
        """
        self.logger.info("Bắt đầu huấn luyện mô hình...")
        
        self.user_course_matrix = user_course_matrix
        matrix_values = user_course_matrix.values
        
        # Tính global mean và user means
        self.global_mean = np.mean(matrix_values[matrix_values > 0])
        self.user_means = np.mean(matrix_values, axis=1, keepdims=True)
        self.user_means[self.user_means == 0] = self.global_mean
        
        # Normalize ma trận bằng z-score normalization
        normalized_matrix = np.zeros_like(matrix_values)
        mask = matrix_values > 0
        normalized_matrix[mask] = (matrix_values[mask] - self.global_mean)
        
        # Tính similarity matrix sử dụng cosine similarity
        self.similarity_matrix = cosine_similarity(normalized_matrix.T)
        
        self.logger.info("Hoàn thành huấn luyện mô hình")

    def evaluate(self, n_splits: int = 5) -> Dict[str, float]:
        """
        Đánh giá mô hình sử dụng k-fold cross validation
        
        Parameters:
            n_splits (int): Số lượng folds cho cross validation
            
        Returns:
            Dict[str, float]: Dictionary chứa các metrics đánh giá
        """
        self.logger.info(f"Bắt đầu đánh giá mô hình với {n_splits}-fold CV...")
        
        kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
        metrics = {'rmse': [], 'mae': [], 'precision': [], 'recall': [], 'f1_score': []}
        
        matrix_values = self.user_course_matrix.values
        
        for fold, (train_idx, test_idx) in enumerate(kf.split(matrix_values)):
            self.logger.info(f"Đánh giá fold {fold + 1}/{n_splits}")
            
            train_matrix = matrix_values[train_idx]
            test_matrix = matrix_values[test_idx]
            
            # Tính global mean cho tập train
            train_global_mean = np.mean(train_matrix[train_matrix > 0])
            
            # Normalize ma trận train
            train_normalized = np.zeros_like(train_matrix)
            train_mask = train_matrix > 0
            train_normalized[train_mask] = (train_matrix[train_mask] - train_global_mean)
            
            # Tính similarity matrix cho tập train
            train_similarity = cosine_similarity(train_normalized.T)
            
            # Dự đoán cho tập test
            pred_matrix = np.zeros_like(test_matrix)
            for i in range(len(test_matrix)):
                user_ratings = test_matrix[i]
                pred_ratings = np.dot(train_similarity, user_ratings)
                
                # Normalize và thêm global mean
                sim_sums = np.sum(np.abs(train_similarity), axis=1)
                sim_sums[sim_sums == 0] = 1
                pred_ratings = (pred_ratings / sim_sums) + train_global_mean
                
                # Clip predictions
                pred_ratings = np.clip(pred_ratings, 0, 5)
                pred_matrix[i] = pred_ratings
            
            # Tính metrics chỉ trên các rating khác 0 trong test set
            mask = test_matrix > 0
            if mask.sum() > 0:
                rmse = np.sqrt(mean_squared_error(test_matrix[mask], pred_matrix[mask]))
                mae = np.mean(np.abs(test_matrix[mask] - pred_matrix[mask]))
                
                # Tính Precision, Recall và F1-Score
                predicted_ratings = (pred_matrix > 0).astype(int)
                actual_ratings = (test_matrix > 0).astype(int)
                
                precision = precision_score(actual_ratings.flatten(), predicted_ratings.flatten())
                recall = recall_score(actual_ratings.flatten(), predicted_ratings.flatten())
                f1 = f1_score(actual_ratings.flatten(), predicted_ratings.flatten())
                
                metrics['rmse'].append(rmse)
                metrics['mae'].append(mae)
                metrics['precision'].append(precision)
                metrics['recall'].append(recall)
                metrics['f1_score'].append(f1)
                
                self.logger.info(f"Fold {fold + 1} - RMSE: {rmse:.4f}, MAE: {mae:.4f}, "
                               f"Precision: {precision:.4f}, Recall: {recall:.4f}, F1-Score: {f1:.4f}")
        
        final_metrics = {
            'mean_rmse': np.mean(metrics['rmse']),
            'std_rmse': np.std(metrics['rmse']),
            'mean_mae': np.mean(metrics['mae']),
            'std_mae': np.std(metrics['mae']),
            'mean_precision': np.mean(metrics['precision']),
            'std_precision': np.std(metrics['precision']),
            'mean_recall': np.mean(metrics['recall']),
            'std_recall': np.std(metrics['recall']),
            'mean_f1_score': np.mean(metrics['f1_score']),
            'std_f1_score': np.std(metrics['f1_score'])
        }
        
        self.logger.info(f"Kết quả đánh giá cuối cùng: {final_metrics}")
        return final_metrics

    def recommend(self, user_id: int, n_recommendations: int = 5, 
                exclude_rated: bool = True) -> List[Tuple[int, float]]:
        """
        Đưa ra gợi ý cho một user cụ thể
        
        Parameters:
            user_id: ID của user cần gợi ý
            n_recommendations: Số lượng gợi ý muốn nhận
            exclude_rated: Có loại bỏ các courses đã được đánh giá không
            
        Returns:
            List[Tuple[int, float]]: Danh sách các courses được gợi ý kèm điểm dự đoán
        """
        if user_id not in self.user_course_matrix.index:
            raise ValueError(f"User {user_id} không tồn tại trong training data")
            
        user_ratings = self.user_course_matrix.loc[user_id].values
        
        # Tính predicted ratings
        pred_ratings = np.dot(self.similarity_matrix, user_ratings)
        
        # Normalize và đảm bảo kết quả không âm
        sim_sums = np.sum(np.abs(self.similarity_matrix), axis=1)
        sim_sums[sim_sums == 0] = 1
        pred_ratings = (pred_ratings / sim_sums) + self.global_mean
        
        # Clip các giá trị để đảm bảo nằm trong khoảng hợp lý
        pred_ratings = np.clip(pred_ratings, 0, 5)
        
        # Tạo Series cho predictions
        pred_series = pd.Series(
            pred_ratings, 
            index=self.user_course_matrix.columns
        )
        
        if exclude_rated:
            # Loại bỏ courses đã được đánh giá
            pred_series = pred_series[user_ratings == 0]
        
        # Sắp xếp và lấy top-N recommendations
        recommendations = pred_series.nlargest(n_recommendations)
        
        return list(recommendations.items())
    
    def save_model(self, filename: str) -> None:
        """Lưu mô hình vào file"""
        with open(filename, 'wb') as f:
            pickle.dump(self, f)
        self.logger.info(f"Model đã được lưu vào {filename}")

def main():
    """Hàm main để chạy thử nghiệm mô hình"""
    try:
        # Đọc dữ liệu
        courses_df = pd.read_csv('items.csv')
        ratings_df = pd.read_csv('ratings.csv')
        users_df = pd.read_csv('users.csv')
        
        # In ra tên các cột để kiểm tra
        print("Columns in courses_df:", courses_df.columns.tolist())
        print("Columns in ratings_df:", ratings_df.columns.tolist())
        print("Columns in users_df:", users_df.columns.tolist())
        
        # Khởi tạo và train mô hình
        cf_model = CollaborativeFiltering(min_ratings=5)
        
        # Tiền xử lý dữ liệu
        user_course_matrix = cf_model.preprocess_data(ratings_df, courses_df, users_df)
        
        # Train mô hình
        cf_model.train(user_course_matrix)

        # Lưu mô hình vào file
        cf_model.save_model('cf_model.pkl')
        
        # Đánh giá mô hình
        evaluation_results = cf_model.evaluate(n_splits=5)
        print("\nEvaluation Results:", evaluation_results)
        
        # Đưa ra gợi ý cho một user cụ thể
        user_id = user_course_matrix.index[0]  # Lấy user_id đầu tiên
        recommendations = cf_model.recommend(user_id, n_recommendations=5)
        print(f"\nTop 5 recommendations for user {user_id}:")
        
        # Hiển thị recommendations một cách an toàn
        for course_id, pred_rating in recommendations:
            try:
                # Nếu courses_df có cột 'course_id' và 'title'
                if 'course_id' in courses_df.columns and 'title' in courses_df.columns:
                    course_name = courses_df[courses_df['course_id'] == course_id]['title'].iloc[0]
                # Nếu courses_df có cột 'id' và 'name'
                elif 'id' in courses_df.columns and 'name' in courses_df.columns:
                    course_name = courses_df[courses_df['id'] == course_id]['name'].iloc[0]
                # Nếu không tìm thấy cột phù hợp
                else:
                    course_name = f"Course {course_id}"
            except Exception as e:
                course_name = f"Course {course_id}"
                print(f"Warning: Could not find course name for id {course_id}. Error: {e}")
            
            print(f"{course_name}: {pred_rating:.4f}")

    except Exception as e:
        print(f"An error occurred: {e}")
        # In thêm thông tin chi tiết về lỗi
        import traceback
        print("\nDetailed error information:")
        print(traceback.format_exc())

if __name__ == "__main__":
    main()