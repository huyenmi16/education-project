from rest_framework import serializers
from .models import Question, Option, Quiz,UserQuizCompletion

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)  # Bỏ read_only để có thể tạo options

    class Meta:
        model = Question
        fields = ['id', 'text', 'course_id', 'options']

    def create(self, validated_data):
        # Tách options data ra khỏi validated_data
        options_data = validated_data.pop('options', [])

        # Tạo question trước
        question = Question.objects.create(**validated_data)

        # Tạo các options cho question
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)

        return question



class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course_id', 'name', 'image', 'duration', 'quiz_time', 'questions']

class QuizCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuizCompletion
        fields = '__all__'