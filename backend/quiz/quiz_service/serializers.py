from rest_framework import serializers
from .models import Question, Option, Quiz,UserQuizCompletion

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)  # Nạp danh sách các đáp án

    class Meta:
        model = Question
        fields = ['id', 'text', 'course_id', 'options']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course_id', 'name', 'image', 'duration', 'quiz_time', 'questions']

class QuizCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizCompletion
        fields = '__all__'