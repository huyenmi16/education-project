from sklearn import preprocessing
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from pyvi import ViTokenizer
import re
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
import pickle
import nltk
from sklearn.model_selection import KFold
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score

# Đọc dữ liệu từ file Excel chứa Q&A về khóa học
# data = pd.read_excel('course_data.xlsx')
data = pd.read_excel('Data.xlsx')
X = data["question"]
Y = data["answer"]
print("Thuộc tính điều kiện (câu hỏi)")
print(X)
print("Thuộc tính cần dự đoán (câu trả lời)")
print(Y)

# Mã hóa Y
le = preprocessing.LabelEncoder()
le.fit(Y)

list_label = list(le.classes_)
print("Danh sách nhãn:")
print(list_label)
print("Số lượng nhãn:", len(list_label))

label = le.transform(Y)
print("Nhãn sau khi mã hóa:")
print(label)


def tienxuly(document):
    # Tokenize văn bản tiếng Việt
    document = ViTokenizer.tokenize(document)
    # Chuyển về lowercase
    document = document.lower()
    # Thay thế một số từ khóa đặc thù của khóa học
    document = document.replace("khoa hoc", "khoa_hoc")
    document = document.replace("bai giang", "bai_giang")
    document = document.replace("video bai giang", "video_bai_giang")
    document = document.replace("bai tap", "bai_tap")
    document = document.replace("gia tien", "gia_tien")
    document = document.replace("thoi gian", "thoi_gian")
    # Xóa các ký tự không cần thiết
    document = re.sub(r'[^\s\wáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđ_]', ' ', document)
    # Xóa khoảng trắng thừa
    document = re.sub(r'\s+', ' ', document).strip()
    return document


# Tiền xử lý dữ liệu
for i in range(0, X.count()):
    X[i] = tienxuly(X[i])

# Phân tích từ vựng
tokens = []
for i in range(0, X.count()):
    for j in X[i].split():
        tokens.append(j)

freq = nltk.FreqDist(tokens)
# freq.plot(20, cumulative=False)
# hiển thị diagram

# Định nghĩa stopwords cho context khóa học
stopword = [
    "khoa_hoc", "gi", "la", "nao", "thi", "co", "bao_nhieu",
    "nhu_the_nao", "nhu_nao", "the", "duoc", "khong"
]


def remove_stopwords(line):
    words = []
    for word in line.strip().split():
        if word not in stopword:
            words.append(word)
    return ' '.join(words)


# Loại bỏ stopwords
for i in range(0, X.count()):
    X[i] = remove_stopwords(X[i])

# Vectorize dữ liệu
vectorizer = CountVectorizer()


def transform(data):
    data = list(data)
    return vectorizer.fit_transform(data).todense()


# Chuyển đổi dữ liệu thành ma trận vector
data1 = np.asarray(transform(X))
print("Ma trận dữ liệu sau khi vectorize:")
print(data1)

# Chia tập dữ liệu thành training (90%) và testing (10%)
X_train, X_test, Y_train, Y_test = train_test_split(data1, label, test_size=0.1, random_state=0)
print("Kích thước tập training:", X_train.shape)
print("Kích thước tập testing:", X_test.shape)

# Khởi tạo và huấn luyện mô hình Naive Bayes
clf = MultinomialNB()
scores = cross_val_score(clf, X_train, Y_train, cv=5)
print("%0.2f accuracy với độ lệch chuẩn %0.2f" % (scores.mean() * 100, scores.std()))

# Training mô hình với toàn bộ tập training
clf.fit(X_train, Y_train)

# Đánh giá mô hình trên tập test
prediction = clf.predict(X_test)
print("Độ chính xác trên tập test:", accuracy_score(Y_test, prediction))

# Lưu các thành phần của mô hình
print("\nLưu các thành phần của mô hình...")

# Lưu vocabulary
print("Lưu vocabulary...")
pickle.dump(vectorizer.vocabulary_, open('vocab.pkl', 'wb'))

# Lưu model đã train
print("Lưu model...")
pickle.dump(clf, open('NB_ChatBot_model.pkl', 'wb'))

# Lưu bộ decode nhãn
print("Lưu label decoder...")
pickle.dump(le, open('decode_label.pkl', 'wb'))

print("\nĐã lưu thành công các thành phần của model!")

# Test thử một vài câu hỏi
print("\nTest một số câu hỏi mẫu:")

test_questions = [
    "Học phí khóa học Python là bao nhiêu?",
    "Khóa học có cấp chứng chỉ không?",
    "Tôi muốn học Machine Learning thì cần những gì?",
    "Học xong có được hỗ trợ tìm việc không?",
    "Học phí rẻ nhất?"
]


def predict_answer(question):
    # Tiền xử lý câu hỏi
    processed = tienxuly(question)
    # Loại bỏ stopword
    processed = remove_stopwords(processed)
    # Chuyển thành vector và đảm bảo là numpy array
    vector = np.asarray(vectorizer.transform([processed]).todense())
    # Dự đoán
    pred = clf.predict(vector)
    # Giải mã nhãn
    return le.inverse_transform(pred)[0]


print("\nKết quả test:")
for question in test_questions:
    print("\nCâu hỏi:", question)
    print("Câu trả lời:", predict_answer(question))

print("\nQuá trình huấn luyện và lưu model hoàn tất!")
