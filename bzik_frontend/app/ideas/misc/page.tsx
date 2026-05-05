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
      <main className="max-w-3xl mx-auto px-4 py-8 w-full bg-white font-mono">
        <h1 className="text-2xl font-bold mb-6 text-black">Прочее — свободные идеи</h1>

        <Card className="mb-8 border border-black rounded-none">
          <CardHeader className="border-b border-black"><CardTitle className="text-base">Поделиться идеей</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={onSubmit} className="space-y-3">
              <Textarea {...register('text', { required: true })} placeholder="Ваша идея..." rows={4} className="border border-black rounded-none focus-visible:ring-0 focus-visible:ring-offset-0" />
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className="text-sm border border-black rounded-none p-2 w-full" />
              <Button type="submit" disabled={mutation.isPending} className="bg-accent text-white border border-accent rounded-none hover:bg-white hover:text-accent hover:border-accent">
                {mutation.isPending ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && <p className="text-muted-foreground">Загрузка...</p>}

        <div className="space-y-3">
          {(ideas as any[]).map((idea: any) => (
            <Card key={idea.id} className="border border-black rounded-none hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-black">{idea.author?.nickname}</span>
                  <Badge variant="secondary" className="text-xs border border-black bg-white text-black">
                    {STATUS_LABEL[idea.status]}
                  </Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap text-black">{idea.text}</p>
                <p className="text-xs text-gray-600 mt-1">
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
