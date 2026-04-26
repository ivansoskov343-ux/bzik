from django.conf import settings
from rest_framework import serializers

from accounts.serializers import UserPublicSerializer
from .models import Idea, IdeaFile, Comment


class IdeaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaFile
        fields = ('id', 'file', 'original_name', 'content_type', 'uploaded_at')
        read_only_fields = ('id', 'original_name', 'content_type', 'uploaded_at')


class CommentSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'author', 'text', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')


class IdeaListSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)
    files_count = serializers.IntegerField(source='files.count', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True, default=None)

    class Meta:
        model = Idea
        fields = ('id', 'task', 'task_title', 'author', 'text', 'created_at',
                  'status', 'files_count')


class IdeaDetailSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)
    files = IdeaFileSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Idea
        fields = ('id', 'task', 'author', 'text', 'created_at', 'status', 'files', 'comments')
        read_only_fields = ('id', 'author', 'created_at', 'task')


class IdeaCreateSerializer(serializers.ModelSerializer):
    uploaded_files = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False, max_length=3
    )

    class Meta:
        model = Idea
        fields = ('task', 'text', 'uploaded_files')

    def validate_uploaded_files(self, files):
        if len(files) > settings.MAX_IDEA_FILES:
            raise serializers.ValidationError(
                f'Максимум {settings.MAX_IDEA_FILES} файла.'
            )
        allowed = set(settings.ALLOWED_FILE_TYPES)
        for f in files:
            if f.content_type not in allowed:
                raise serializers.ValidationError(
                    f'Недопустимый тип файла: {f.content_type}. Разрешены JPG, PNG, PDF.'
                )
            if f.size > 10 * 1024 * 1024:
                raise serializers.ValidationError(
                    f'Файл {f.name} превышает 10 МБ.'
                )
        return files

    def create(self, validated_data):
        files = validated_data.pop('uploaded_files', [])
        idea = Idea.objects.create(**validated_data)
        for f in files:
            IdeaFile.objects.create(
                idea=idea,
                file=f,
                original_name=f.name,
                content_type=f.content_type,
            )
        return idea


class IdeaStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Idea
        fields = ('status',)
