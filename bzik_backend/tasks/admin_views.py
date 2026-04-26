import io

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from ideas.models import Idea
from ideas.serializers import IdeaListSerializer
from tasks.permissions import IsAdminUser
from .models import Task


class TaskIdeasExportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        ideas = Idea.objects.filter(task=task).select_related('author')
        fmt = request.query_params.get('format', 'excel')

        if fmt == 'pdf':
            return self._export_pdf(task, ideas)
        return self._export_excel(task, ideas)

    def _export_excel(self, task, ideas):
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Идеи'
        ws.append(['#', 'Автор', 'Никнейм', 'Текст', 'Статус', 'Дата'])
        for idea in ideas:
            ws.append([
                idea.pk,
                idea.author.email,
                idea.author.nickname,
                idea.text,
                idea.get_status_display(),
                idea.created_at.strftime('%Y-%m-%d %H:%M'),
            ])
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        filename = f'task_{task.pk}_ideas.xlsx'
        response = HttpResponse(
            buf.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    def _export_pdf(self, task, ideas):
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4)
        styles = getSampleStyleSheet()
        story = [Paragraph(f'Задание: {task.title}', styles['Title']), Spacer(1, 12)]

        for idea in ideas:
            story.append(Paragraph(
                f'<b>#{idea.pk}</b> — {idea.author.nickname} ({idea.created_at.strftime("%Y-%m-%d %H:%M")})',
                styles['Heading3']
            ))
            story.append(Paragraph(idea.text.replace('\n', '<br/>'), styles['Normal']))
            story.append(Paragraph(f'Статус: {idea.get_status_display()}', styles['Normal']))
            story.append(Spacer(1, 12))

        doc.build(story)
        buf.seek(0)
        filename = f'task_{task.pk}_ideas.pdf'
        response = HttpResponse(buf.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class MiscIdeasView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        ideas = Idea.objects.filter(task__isnull=True).select_related('author')
        return Response(IdeaListSerializer(ideas, many=True, context={'request': request}).data)
