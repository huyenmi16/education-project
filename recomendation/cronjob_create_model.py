import mysql.connector
import pickle
import os
from datetime import datetime
import logging
from collaborative_filtering import CollaborativeFiltering

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
            'password': '12345',
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
