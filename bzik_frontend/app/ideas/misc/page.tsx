'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Отправлено',
  in_progress: 'В работе',
  rejected: 'Отклонено',
  winner: 'Победитель',
}

export default function MiscIdeasPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset } = useForm<{ text: string }>()

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['misc-ideas'],
    queryFn: async () => (await api.get('/api/ideas/?misc=1')).data,
  })

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => api.post('/api/ideas/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      toast.success('Идея отправлена!')
      reset()
      if (fileRef.current) fileRef.current.value = ''
      qc.invalidateQueries({ queryKey: ['misc-ideas'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Ошибка')
    },
  })

  const onSubmit = handleSubmit((data) => {
    const fd = new FormData()
    fd.append('text', data.text)
    const files = fileRef.current?.files
    if (files) Array.from(files).forEach((f) => fd.append('uploaded_files', f))
    mutation.mutate(fd)
  })

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-6">Прочее — свободные идеи</h1>

        <Card className="mb-8">
          <CardHeader><CardTitle className="text-base">Поделиться идеей</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <Textarea {...register('text', { required: true })} placeholder="Ваша идея..." rows={4} />
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className="text-sm" />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && <p className="text-muted-foreground">Загрузка...</p>}

        <div className="space-y-3">
          {(ideas as any[]).map((idea: any) => (
            <Card key={idea.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{idea.author?.nickname}</span>
                  <Badge variant="secondary" className="text-xs">{STATUS_LABEL[idea.status]}</Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap">{idea.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(idea.created_at).toLocaleString('ru')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
