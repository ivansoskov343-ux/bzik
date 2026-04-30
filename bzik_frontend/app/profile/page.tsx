'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

interface Idea {
  id: number
  task: number | null
  task_title: string | null
  text: string
  created_at: string
  status: string
}

interface MyComment {
  id: number
  text: string
  created_at: string
  idea_id: number
  task_id: number | null
  task_title: string | null
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Отправлено',
  in_progress: 'В работе',
  rejected: 'Отклонено',
  winner: 'Победитель',
}

type Tab = 'ideas' | 'comments'

export default function ProfilePage() {
  const { user, setUser, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('ideas')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) router.push('/login')
  }, [])

  const { data: balance } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => (await api.get('/api/profile/me/balance/')).data,
    enabled: isAuthenticated(),
  })

  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ['my-ideas'],
    queryFn: async () => (await api.get('/api/profile/me/ideas/')).data,
    enabled: isAuthenticated(),
  })

  const { data: comments = [] } = useQuery<MyComment[]>({
    queryKey: ['my-comments'],
    queryFn: async () => (await api.get('/api/profile/me/comments/')).data,
    enabled: isAuthenticated() && tab === 'comments',
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ nickname: string }>({
    defaultValues: { nickname: user?.nickname ?? '' },
  })

  useEffect(() => {
    reset({ nickname: user?.nickname ?? '' })
  }, [user?.nickname])

  const editMutation = useMutation({
    mutationFn: (data: { nickname: string }) => api.patch('/api/profile/me/', data),
    onSuccess: (res) => {
      setUser(res.data)
      setEditing(false)
      toast.success('Профиль обновлён')
      qc.invalidateQueries({ queryKey: ['balance'] })
    },
    onError: (err: any) => {
      const d = err.response?.data
      const msg = d?.nickname?.[0] || d?.detail || 'Ошибка сохранения'
      toast.error(msg)
    },
  })

  if (!user) return null

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6 bg-white font-mono">
        {/* Profile card */}
        <Card className="border-2 border-black rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-2 border-black">
            <CardTitle>Профиль</CardTitle>
            {!editing && (
              <Button size="sm" variant="outline" className="border-2 border-black rounded-none hover:bg-black hover:text-white" onClick={() => setEditing(true)}>
                Редактировать
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {editing ? (
              <form
                onSubmit={handleSubmit((data) => editMutation.mutate(data))}
                className="space-y-3"
              >
                <div>
                  <label className="text-sm font-medium block mb-1">Никнейм</label>
                  <Input
                    {...register('nickname', { required: 'Обязательное поле', minLength: { value: 2, message: 'Минимум 2 символа' } })}
                    placeholder="Никнейм"
                  />
                  {errors.nickname && (
                    <p className="text-xs text-destructive mt-1">{errors.nickname.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={editMutation.isPending} className="bg-accent text-white border-2 border-accent rounded-none hover:bg-white hover:text-accent hover:border-accent">
                    {editMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-2 border-black rounded-none hover:bg-black hover:text-white"
                    onClick={() => { setEditing(false); reset({ nickname: user.nickname }) }}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <p><span className="font-medium">Никнейм:</span> {user.nickname}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                {balance && (
                  <p><span className="font-medium">Баланс баллов:</span> {balance.balance_points}</p>
                )}
                {balance && (
                  <p>
                    <span className="font-medium">Выплаты:</span>{' '}
                    {balance.yookassa_linked ? 'Счёт привязан' : 'Счёт не привязан'}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div>
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={tab === 'ideas' ? 'default' : 'outline'}
              className={tab === 'ideas' ? 'bg-accent text-white border-2 border-accent rounded-none hover:bg-white hover:text-accent hover:border-accent' : 'border-2 border-black rounded-none hover:bg-black hover:text-white'}
              onClick={() => setTab('ideas')}
            >
              Мои идеи ({ideas.length})
            </Button>
            <Button
              size="sm"
              variant={tab === 'comments' ? 'default' : 'outline'}
              className={tab === 'comments' ? 'bg-accent text-white border-2 border-accent rounded-none hover:bg-white hover:text-accent hover:border-accent' : 'border-2 border-black rounded-none hover:bg-black hover:text-white'}
              onClick={() => setTab('comments')}
            >
              Мои комментарии
            </Button>
          </div>

          {tab === 'ideas' && (
            <div className="space-y-3">
              {ideas.length === 0 && (
                <p className="text-muted-foreground text-sm">Вы ещё не отправляли идей.</p>
              )}
              {ideas.map((idea) => (
                <Link
                  key={idea.id}
                  href={idea.task ? `/tasks/${idea.task}#idea-${idea.id}` : `/tasks/misc#idea-${idea.id}`}
                >
                  <Card className="border-2 border-black rounded-none hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer">
                      <CardContent className="pt-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-black font-medium">
                            {idea.task_title ?? 'Прочее'}
                          </span>
                          <Badge variant="secondary" className="text-xs border border-black bg-white text-black">
                            {STATUS_LABEL[idea.status]}
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2 text-black">{idea.text}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(idea.created_at).toLocaleString('ru')}
                        </p>
                      </CardContent>
                    </Card>
                </Link>
              ))}
            </div>
          )}

          {tab === 'comments' && (
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-muted-foreground text-sm">Вы ещё не оставляли комментариев.</p>
              )}
              {comments.map((comment) => (
                <Link
                  key={comment.id}
                  href={comment.task_id ? `/tasks/${comment.task_id}#idea-${comment.idea_id}` : '#'}
                >
                  <Card className="border-2 border-black rounded-none hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-shadow cursor-pointer">
                    <CardContent className="pt-4">
                      <p className="text-xs text-black font-medium mb-1">
                        {comment.task_title ?? 'Прочее'} → идея #{comment.idea_id}
                      </p>
                      <p className="text-sm line-clamp-2 text-black">{comment.text}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(comment.created_at).toLocaleString('ru')}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
