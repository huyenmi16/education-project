import pandas as pd
import pickle
from collaborating_fillter import CollaborativeFiltering  # Import lớp CollaborativeFiltering từ collab.py

# Đọc dữ liệu mới từ các file CSV
courses_df = pd.read_csv('data/items.csv')
ratings_df = pd.read_csv('data/ratings.csv')
users_df = pd.read_csv('data/users.csv')

# Tải mô hình đã lưu từ file 'cf_model.pkl'
with open('cf_model.pkl', 'rb') as f:
    cf_model = pickle.load(f)

# Nếu mô hình chưa khởi tạo, tạo một đối tượng mới của CollaborativeFiltering
if not isinstance(cf_model, CollaborativeFiltering):
    cf_model = CollaborativeFiltering()

# Cập nhật mô hình với dữ liệu mới
user_course_matrix = cf_model.preprocess_data(ratings_df, courses_df, users_df)

# Cập nhật ma trận user-course trong mô hình với dữ liệu mới
cf_model.user_course_matrix = user_course_matrix

# Huấn luyện lại mô hình với dữ liệu mới
cf_model.train(user_course_matrix)

# Sử dụng mô hình để đưa ra đề xuất cho một `user_id` cụ thể
user_id = user_course_matrix.index[0]  # Lấy user_id đầu tiên trong ma trận
recommendations = cf_model.recommend(user_id, n_recommendations=5)

# In kết quả đề xuất
print(f"\nTop 5 recommendations for user {user_id}:")
for course_id, pred_rating in recommendations:
    print(f"Course {course_id}: {pred_rating:.4f}")

# Lưu lại mô hình đã cập nhật nếu cần
with open('cf_model_updated.pkl', 'wb') as f:
    pickle.dump(cf_model, f)
