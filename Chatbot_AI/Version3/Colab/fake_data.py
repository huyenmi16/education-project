import pandas as pd
import mysql.connector
import random
from datetime import datetime
# import schedule
import time
import logging
import os


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)


def generate_training_data():
    # Kết nối MySQL
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '123456',
        'database': 'course_service'
    }

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Lấy thông tin chi tiết khóa học
        cursor.execute("""
            SELECT 
                c.id,
                c.title as name,
                c.price,
                c.duration,
                c.level,
                c.description,
                us.username as instructor,
                us.email as instructor_email,
                us.phone_number as instructor_phone,
                ROUND(AVG(cr.rating), 1) as rating,
                COUNT(DISTINCT cr.id) as total_reviews,
                COUNT(DISTINCT reg.id) as total_students,
                GROUP_CONCAT(DISTINCT cr.review SEPARATOR '||') as student_reviews
            FROM course_service.course_service_course c
            LEFT JOIN user_service.user_service_user us ON c.create_by = us.id 
            LEFT JOIN course_service.course_service_coursereview cr ON c.id = cr.course_id_id
            LEFT JOIN course_service.course_service_courseregistration reg ON c.id = reg.course_id
            WHERE c.is_approved = 1
            GROUP BY c.id
        """)
        courses = cursor.fetchall()

        # Lấy danh sách chapters và lessons
        cursor.execute("""
            SELECT 
                ch.course_id,
                ch.title as chapter_title,
                COUNT(l.id) as lesson_count,
                GROUP_CONCAT(l.title SEPARATOR ', ') as lesson_titles
            FROM course_service_chapter ch
            LEFT JOIN course_service_lesson l ON ch.id = l.chapter_id
            GROUP BY ch.id
        """)
        chapter_data = cursor.fetchall()

        # Map chapter data to courses
        chapter_map = {}
        for chapter in chapter_data:
            if chapter['course_id'] not in chapter_map:
                chapter_map[chapter['course_id']] = []
            chapter_map[chapter['course_id']].append(chapter)

        # Template câu hỏi và câu trả lời
        templates = {
            # Chào hỏi
            "greeting": {
                "questions": [
                    "Xin chào",
                    "Hi",
                    "Hello",
                    "Chào bạn",
                    "Hey there",
                    "Có ai ở đây không",
                    "Có ai tư vấn giúp mình không"
                ],
                "answers": [
                    "Xin chào! Mình có thể giúp gì cho bạn về các khóa học?",
                    "Chào bạn! Mình là trợ lý tư vấn khóa học, bạn cần hỗ trợ gì ạ?",
                    "Hi! Rất vui được hỗ trợ bạn. Bạn quan tâm đến khóa học nào?",
                    "Chào bạn! Mình ở đây để tư vấn về các khóa học cho bạn."
                ]
            },

            # Cảm ơn
            "thanks": {
                "questions": [
                    "Cảm ơn bạn",
                    "Cảm ơn nhé",
                    "Thank you",
                    "Thanks",
                    "Cám ơn đã tư vấn",
                    "Ok cảm ơn nha"
                ],
                "answers": [
                    "Không có gì ạ! Chúc bạn học tập tốt!",
                    "Rất vui được hỗ trợ bạn. Nếu cần gì thêm, đừng ngại hỏi lại nhé!",
                    "Cảm ơn bạn đã quan tâm đến khóa học. Chúc bạn thành công!",
                    "Không có chi ạ! Hẹn gặp lại bạn!"
                ]
            },

            # Thông tin khóa học
            "course_info": {
                "questions": [
                    "Khóa học {name} có những gì?",
                    "Nội dung khóa học {name} là gì?",
                    "Khóa {name} dạy những gì?",
                    "Cho tôi biết thông tin về khóa {name}",
                    "Khóa {name} bao gồm những gì?",
                    "Học {name} sẽ được học những gì?",
                    "Giới thiệu về khóa {name}",
                    "Tổng quan về khóa {name}",
                    "{name} dạy những kiến thức gì?"
                ],
                "answers": [
                    "Khóa học {name} ({level}) bao gồm: {description}. Được giảng dạy bởi {instructor}, gồm {chapter_count} chương với các bài học như: {lesson_examples}",
                    "Khóa {name} là khóa học {level}, {description}. Giảng viên {instructor} sẽ hướng dẫn bạn qua {chapter_count} chương học chi tiết.",
                    "Đây là khóa học {level} với nội dung: {description}. Khóa học có {chapter_count} chương, được thiết kế và giảng dạy bởi {instructor}.",
                    "Khóa học {name} cung cấp {description}. Bạn sẽ được học {chapter_count} chương từ giảng viên {instructor}, bao gồm các bài học như: {lesson_examples}"
                ]
            },

            # Học phí và thanh toán
            "price": {
                "questions": [
                    "Học phí khóa {name} là bao nhiêu?",
                    "Khóa {name} giá bao nhiêu?",
                    "Chi phí để học {name}?",
                    "Giá khóa học {name}?",
                    "Học {name} tốn bao nhiêu tiền?",
                    "Cho hỏi giá khóa {name}?",
                    "{name} học phí là bao nhiêu?",
                    "Phí đăng ký học {name}?",
                    "Chi phí khóa học {name}?"
                ],
                "answers": [
                    "Học phí khóa {name} là {price}đ, đã bao gồm toàn bộ tài liệu và quyền truy cập vĩnh viễn.",
                    "Khóa học {name} có giá {price}đ, bạn sẽ được học trực tiếp với giảng viên {instructor} và nhận đầy đủ tài liệu.",
                    "Chi phí khóa {name} là {price}đ, đã bao gồm toàn bộ {chapter_count} chương học và tài liệu thực hành.",
                    "Giá khóa học {name} là {price}đ, học với giảng viên {instructor}. Bạn sẽ được hỗ trợ trong suốt quá trình học."
                ]
            },

            # Thời lượng khóa học
            "duration": {
                "questions": [
                    "Khóa học {name} kéo dài bao lâu?",
                    "Học {name} mất bao lâu?",
                    "Thời gian học {name}?",
                    "Hoàn thành khóa {name} trong bao lâu?",
                    "Thời lượng khóa {name}?",
                    "Mất bao lâu để học xong {name}?",
                    "{name} học trong bao lâu?",
                    "Thời gian hoàn thành {name}?"
                ],
                "answers": [
                    "Khóa học {name} có tổng thời lượng {duration} giờ, chia thành {chapter_count} chương học. Bạn có thể học linh hoạt theo tiến độ của mình.",
                    "Tổng thời lượng khóa {name} là {duration} giờ học. Với {chapter_count} chương, thời gian học hoàn toàn linh hoạt theo lịch của bạn.",
                    "Thời lượng khóa {name} là {duration} giờ, bao gồm cả lý thuyết và thực hành qua {chapter_count} chương học.",
                    "Khóa học {name} kéo dài {duration} giờ học. Bạn có thể học mọi lúc, mọi nơi và tự điều chỉnh tốc độ học."
                ]
            },

            # Đánh giá và phản hồi
            "reviews": {
                "questions": [
                    "Đánh giá về khóa {name}?",
                    "Khóa học {name} được review thế nào?",
                    "Feedback về khóa {name}?",
                    "Học viên đánh giá {name} thế nào?",
                    "Review khóa học {name}?",
                    "{name} có tốt không?",
                    "Mọi người nói gì về khóa {name}?",
                    "Khóa {name} được đánh giá sao?",
                    "Chất lượng khóa {name} thế nào?"
                ],
                "answers": [
                    "Khóa học {name} được đánh giá {rating}/5 sao từ {total_reviews} học viên. Một số đánh giá tiêu biểu: {review_examples}",
                    "Khóa {name} nhận được {rating}/5 sao với {total_reviews} đánh giá. Học viên nói: {review_examples}",
                    "Hiện có {total_students} học viên đã đăng ký khóa {name}, với điểm đánh giá trung bình {rating}/5 từ {total_reviews} review. Một số nhận xét: {review_examples}",
                    "Khóa học được đánh giá rất tốt với {rating}/5 sao ({total_reviews} lượt đánh giá). Phản hồi từ học viên: {review_examples}"
                ]
            },

            # Giảng viên
            "instructor": {
                "questions": [
                    "Ai là giảng viên khóa {name}?",
                    "Giảng viên {name} là ai?",
                    "Thông tin về giảng viên {name}?",
                    "Người dạy khóa {name}?",
                    "Giáo viên khóa {name} là ai?",
                    "Ai sẽ dạy khóa {name}?",
                    "Giảng viên dạy {name} có kinh nghiệm không?",
                    "Thông tin giáo viên khóa {name}"
                ],
                "answers": [
                    "Giảng viên khóa {name} là {instructor}, bạn có thể liên hệ qua email: {instructor_email} hoặc số điện thoại: {instructor_phone}",
                    "Khóa học {name} được giảng dạy bởi {instructor}. Giảng viên có thể hỗ trợ bạn qua {instructor_email}",
                    "{instructor} là giảng viên của khóa {name}, với {total_students} học viên đã đăng ký học. Liên hệ: {instructor_email}",
                    "Giảng viên {instructor} sẽ trực tiếp giảng dạy khóa {name}. Bạn có thể liên hệ giảng viên qua {instructor_phone}"
                ]
            },

            # Nội dung chi tiết
            "detailed_content": {
                "questions": [
                    "Các chương học trong khóa {name}?",
                    "Nội dung chi tiết khóa {name}?",
                    "Khóa {name} có những chương nào?",
                    "Outline khóa học {name}?",
                    "Chương trình học {name} gồm những gì?",
                    "Các phần học trong khóa {name}?",
                    "Syllabus khóa {name}?",
                    "Khóa {name} chia thành mấy phần?"
                ],
                "answers": [
                    "Khóa học {name} gồm {chapter_count} chương: {chapter_list}. Mỗi chương có các bài học chi tiết kèm bài tập thực hành.",
                    "Chương trình học {name} được chia thành {chapter_count} chương chính: {chapter_list}. Bạn sẽ được thực hành sau mỗi bài học.",
                    "Nội dung khóa {name} bao gồm {chapter_count} chương: {chapter_list}. Mỗi chương đều có video bài giảng và tài liệu đầy đủ.",
                    "Khóa học {name} được thiết kế với {chapter_count} chương: {chapter_list}. Bạn sẽ được học từ cơ bản đến nâng cao."
                ]
            },

            # Đối tượng học viên
            "target_audience": {
                "questions": [
                    "Khóa {name} phù hợp với ai?",
                    "Đối tượng học {name}?",
                    "Ai nên học khóa {name}?",
                    "Học {name} cần những gì?",
                    "Yêu cầu để học {name}?",
                    "Level nào phù hợp với khóa {name}?",
                    "Cần chuẩn bị gì để học {name}?",
                    "Khóa {name} dành cho đối tượng nào?"
                ],
                "answers": [
                    "Khóa học {name} phù hợp với trình độ {level}. {description}",
                    "Đối tượng học {name} là người muốn học ở trình độ {level}. {description}",
                    "Khóa {name} được thiết kế cho người học {level}, {description}",
                    "Bạn không cần kinh nghiệm trước đó để học khóa {name} vì đây là khóa học {level}. {description}"
                ]
            },

            # Bổ sung template hỗ trợ và tương tác
            "support": {
                "questions": [
                    "Tôi cần giúp đỡ",
                    "Bạn có thể tư vấn cho tôi không?",
                    "Tôi muốn tìm khóa học phù hợp",
                    "Giúp tôi chọn khóa học",
                    "Tôi nên học gì?"
                ],
                "answers": [
                    "Tôi có thể giúp bạn tìm khóa học phù hợp. Bạn quan tâm đến lĩnh vực nào?",
                    "Rất vui được tư vấn cho bạn. Bạn đã có kinh nghiệm gì chưa?",
                    "Để tư vấn tốt nhất, bạn có thể cho mình biết mục tiêu học tập của bạn là gì không?",
                    "Mình sẽ giúp bạn chọn khóa học phù hợp. Bạn muốn học để phục vụ mục đích gì?"
                ]
            },

            # Thêm templates mới
            "course_suggestions": {
                "questions": [
                    "Gợi ý cho tôi khóa học rẻ nhất",
                    "Khóa học nào rẻ nhất?",
                    "Khóa học giá tốt nhất?",
                    "Tìm khóa học giá rẻ",
                    "Khóa học nào có giá phải chăng nhất?",
                    "Tôi muốn tìm khóa học giá rẻ",
                    "Những khóa học giá dưới {price}",
                    "Khóa học nào phù hợp với ngân sách {price}?",
                    "Có khóa học nào dưới {price} không?"
                ],
                "answers": [
                    "Khóa học có giá thấp nhất hiện tại là khóa {cheapest_course} với giá {cheapest_price}đ. Ngoài ra còn có các khóa học giá tốt khác như: {affordable_courses}",
                    "Tôi gợi ý cho bạn khóa {cheapest_course} với mức giá {cheapest_price}đ - đây là khóa học có giá tốt nhất. Một số lựa chọn khác trong tầm giá tương tự: {affordable_courses}",
                    "Top 3 khóa học có giá tốt nhất: 1. {cheapest_course} ({cheapest_price}đ), {affordable_courses}"
                ]
            },

            "interest_based": {
                "questions": [
                    "Tôi thích {interest}, có khóa học nào phù hợp không?",
                    "Gợi ý khóa học về {interest}",
                    "Có khóa học nào về {interest} không?",
                    "Tôi muốn học {interest}",
                    "Khóa học liên quan đến {interest}",
                    "Học {interest} thì nên chọn khóa nào?"
                ],
                "answers": [
                    "Với sở thích về {interest}, tôi gợi ý bạn các khóa học sau: {related_courses}. Các khóa học này đều có nội dung liên quan đến {interest}.",
                    "Dựa trên sở thích {interest} của bạn, tôi recommend: {related_courses}. Đây là những khóa học được đánh giá tốt trong lĩnh vực này.",
                    "Cho sở thích {interest}, bạn có thể tham khảo: {related_courses}. Mỗi khóa học sẽ giúp bạn phát triển theo một hướng khác nhau."
                ]
            },

            "course_comparison": {
                "questions": [
                    "So sánh khóa {course1} và {course2}",
                    "Khóa {course1} và {course2} khác nhau thế nào?",
                    "Nên học {course1} hay {course2}?",
                    "Giữa {course1} và {course2} nên chọn khóa nào?",
                    "So sánh giá và nội dung {course1} với {course2}"
                ],
                "answers": [
                    "So sánh 2 khóa học:\n1. {course1}: {description1}, giá {price1}đ, {duration1} giờ học\n2. {course2}: {description2}, giá {price2}đ, {duration2} giờ học",
                    "Phân tích 2 khóa:\n- {course1}: Level {level1}, {rating1}/5 sao, {total_students1} học viên\n- {course2}: Level {level2}, {rating2}/5 sao, {total_students2} học viên",
                    "Đánh giá chi tiết:\n{course1}: {reviews1}\n{course2}: {reviews2}"
                ]
            }
        }

        # Xử lý dữ liệu từ database
        for course in courses:
            try:
                # Format các thông tin cơ bản
                course['duration'] = round(float(course['duration']) / 3600000000, 1)
                course['price'] = "{:,.0f}".format(float(course['price']))

                # Xử lý các trường có thể None
                course['description'] = course['description'] or "Chưa có mô tả"
                course['instructor'] = course['instructor'] or "Chưa có giảng viên"
                course['instructor_email'] = course['instructor_email'] or "Chưa có email"
                course['instructor_phone'] = course['instructor_phone'] or "Chưa có số điện thoại"
                course['rating'] = course['rating'] or 0
                course['total_reviews'] = course['total_reviews'] or 0
                course['total_students'] = course['total_students'] or 0

                # Thêm thông tin chapters
                course_chapters = chapter_map.get(course['id'], [])
                course['chapter_count'] = len(course_chapters)
                course['chapter_list'] = ", ".join([f"{idx + 1}. {ch['chapter_title']}"
                                                    for idx, ch in enumerate(course_chapters)]) or "Đang cập nhật"

                # Xử lý lessons
                all_lessons = []
                for ch in course_chapters:
                    if ch['lesson_titles']:
                        all_lessons.extend(ch['lesson_titles'].split(', '))
                course['lesson_examples'] = ", ".join(random.sample(all_lessons,
                                                                    min(3,
                                                                        len(all_lessons)))) if all_lessons else "Đang cập nhật"

                # Xử lý reviews
                if course['student_reviews']:
                    reviews = course['student_reviews'].split('||')
                    course['review_examples'] = " | ".join(random.sample(reviews,
                                                                         min(2, len(reviews))))
                else:
                    course['review_examples'] = "Chưa có đánh giá"

            except Exception as e:
                logging.error(f"Error processing course {course['id']}: {str(e)}")
                continue

        def process_course_data(courses):
            """Xử lý dữ liệu khóa học cho templates mới"""
            try:
                # Chuyển giá từ string về float để so sánh
                for course in courses:
                    course['price_number'] = float(course['price'].replace(',', ''))

                # Sắp xếp theo giá
                sorted_by_price = sorted(courses, key=lambda x: x['price_number'])
                cheapest_course = sorted_by_price[0]
                affordable_courses = ", ".join([
                    f"{c['name']} ({c['price']}đ)"
                    for c in sorted_by_price[1:4]
                ])

                # Map các sở thích/lĩnh vực với từ khóa
                interest_map = {
                    'lập trình web': ['web', 'javascript', 'react', 'frontend'],
                    'AI': ['machine learning', 'ai', 'deep learning', 'trí tuệ nhân tạo'],
                    'data': ['data', 'sql', 'phân tích dữ liệu', 'python'],
                    'mobile': ['android', 'ios', 'flutter', 'mobile'],
                    'backend': ['backend', 'java', 'nodejs', 'php'],
                    'devops': ['devops', 'cloud', 'aws', 'docker'],
                    'testing': ['testing', 'kiểm thử', 'automation test'],
                    # Thêm các lĩnh vực khác
                }

                # Process từng khóa học
                for course in courses:
                    course.update({
                        'cheapest_course': cheapest_course['name'],
                        'cheapest_price': cheapest_course['price'],
                        'affordable_courses': affordable_courses
                    })

                    # Tìm lĩnh vực liên quan
                    course_interests = []
                    for interest, keywords in interest_map.items():
                        if any(kw.lower() in course['name'].lower() or
                               kw.lower() in course['description'].lower()
                               for kw in keywords):
                            course_interests.append(interest)

                    if course_interests:
                        # Tìm các khóa học cùng lĩnh vực
                        related = []
                        for c in courses:
                            for interest in course_interests:
                                if any(kw.lower() in c['name'].lower() or
                                       kw.lower() in c['description'].lower()
                                       for kw in interest_map[interest]):
                                    if c['id'] != course['id']:
                                        related.append(c['name'])

                        course['interests'] = course_interests
                        course['related_courses'] = ", ".join(set(related[:3]))
                    else:
                        course['interests'] = ["chưa phân loại"]
                        course['related_courses'] = "Chưa có khóa học liên quan"

                return courses

            except Exception as e:
                logging.error(f"Error in process_course_data: {str(e)}")
                raise

        processed_courses = process_course_data(courses)

        # Tạo dữ liệu training
        questions = []
        answers = []

        try:
            # Thêm câu hỏi chào hỏi và cảm ơn (2%)
            for _ in range(5):
                template_type = random.choice(['greeting', 'thanks', 'support'])
                question = random.choice(templates[template_type]['questions'])
                answer = random.choice(templates[template_type]['answers'])
                questions.append(question)
                answers.append(answer)

            # Tạo câu hỏi liên quan đến khóa học (60%)
            for _ in range(50):
                template_type = random.choice([k for k in templates.keys()
                                               if k not in ['greeting', 'thanks', 'support']])
                course = random.choice(courses)

                question = random.choice(templates[template_type]['questions'])
                answer = random.choice(templates[template_type]['answers'])

                try:
                    question = question.format(**course)
                    answer = answer.format(**course)

                    questions.append(question)
                    answers.append(answer)
                except KeyError as e:
                    logging.error(f"KeyError in template {template_type}: {str(e)}")
                    continue

            # Tạo câu hỏi liên quan đến gợi ý khóa học (38%)
            for _ in range(95):
                template_type = random.choice(['course_suggestions', 'interest_based'])
                course = random.choice(processed_courses)

                if template_type == 'interest_based':
                    # Take random interest from course
                    interest = random.choice(course['interests'])

                question = random.choice(templates[template_type]['questions'])
                answer = random.choice(templates[template_type]['answers'])

                try:
                    question = question.format(interest=interest) if template_type == 'interest_based' else question
                    answer = answer.format(**course,
                                           interest=interest) if template_type == 'interest_based' else answer.format(
                        **course)
                    questions.append(question)
                    answers.append(answer)
                except KeyError as e:
                    logging.error(f"KeyError in new template {template_type}: {str(e)}")
                    continue

            # Tạo DataFrame và lưu file
            df = pd.DataFrame({
                "question": questions,
                "answer": answers
            })

            # output_file = f"Data3.xlsx"
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

            # Tạo đường dẫn tới thư mục Colab
            colab_path = os.path.join(project_root, 'Colab')

            # Tạo file path
            output_file = os.path.join(colab_path, 'Data.xlsx')

            df.to_excel(output_file, index=False)

            logging.info(f"Successfully generated training data: {output_file}")
            print(f"Generated training data at {datetime.now()}")

        except Exception as e:
            logging.error(f"Error generating training data: {str(e)}")
            raise

    except Exception as e:
        logging.error(f"Database error: {str(e)}")
        raise

    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            logging.info("Database connection closed")


# def run_scheduler():
#     schedule.every().day.at("00:00").do(generate_training_data)
#
#     while True:
#         schedule.run_pending()
#         time.sleep(60)
#
#
# if __name__ == "__main__":
#     try:
#         # Generate initial data
#         generate_training_data()
#         # Start scheduler
#         run_scheduler()
#     except Exception as e:
#         logging.error(f"Application error: {str(e)}")

generate_training_data()

