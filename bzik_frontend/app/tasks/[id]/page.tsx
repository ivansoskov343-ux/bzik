'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

const HIDE_IDEAS_KEY = 'bzik:hide_others_ideas'

interface Task {
  id: number
  title: string
  description: string
  reward_hint: string
  created_at: string
  last_updated_at: string
  deadline: string | null
  is_closed: boolean
  is_recently_updated: boolean
  is_favorited: boolean
  clarifications: { id: number; text: string; created_at: string }[]
}

interface Idea {
  id: number
  author: { id: number; nickname: string }
  text: string
  created_at: string
  status: string
  files_count: number
}

interface IdeaDetail {
  id: number
  author: { id: number; nickname: string }
  text: string
  created_at: string
  status: string
  files: { id: number; file: string; original_name: string }[]
  comments: { id: number; author: { nickname: string }; text: string; created_at: string }[]
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [hideOthers, setHideOthers] = useState(false)
  const [revealedIdeas, setRevealedIdeas] = useState<Set<number>>(new Set())
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null)
  const [ideaSubmitted, setIdeaSubmitted] = useState(false)
  const [ideasOrdering, setIdeasOrdering] = useState<'-created_at' | 'created_at'>('-created_at')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem(HIDE_IDEAS_KEY)
    if (stored === 'true') setHideOthers(true)
  }, [])

  const toggleHide = () => {
    setHideOthers((prev) => {
      localStorage.setItem(HIDE_IDEAS_KEY, String(!prev))
      if (!prev) setRevealedIdeas(new Set()) // reset reveals when hiding
      return !prev
    })
  }

  const toggleReveal = (ideaId: number) => {
    setRevealedIdeas((prev) => {
      const next = new Set(prev)
      if (next.has(ideaId)) next.delete(ideaId)
      else next.add(ideaId)
      return next
    })
  }

  const { data: task, isLoading: taskLoading } = useQuery<Task>({
    queryKey: ['task', id],
    queryFn: async () => (await api.get(`/api/tasks/${id}/`)).data,
  })

  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ['ideas', id, ideasOrdering],
    queryFn: async () => (await api.get(`/api/ideas/?task=${id}&ordering=${ideasOrdering}`)).data,
  })

  // Scroll to anchor after ideas load
  useEffect(() => {
    if (ideas.length === 0) return
    const hash = window.location.hash
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    }
  }, [ideas])

  const { data: ideaDetail } = useQuery<IdeaDetail>({
    queryKey: ['idea', selectedIdea],
    queryFn: async () => (await api.get(`/api/ideas/${selectedIdea}/`)).data,
    enabled: !!selectedIdea,
  })

  const favMutation = useMutation({
    mutationFn: () => api.post(`/api/tasks/${id}/favorite/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task', id] }),
  })

  const { register, handleSubmit, reset, watch } = useForm<{ text: string }>()

  const ideaMutation = useMutation({
    mutationFn: async (formData: FormData) => api.post('/api/ideas/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      toast.success('Идея отправлена!')
      reset()
      if (fileRef.current) fileRef.current.value = ''
      setIdeaSubmitted(true)
      qc.invalidateQueries({ queryKey: ['ideas', id, ideasOrdering] })
    },
    onError: (err: any) => {
      const d = err.response?.data
      const msg = d?.text?.[0] || d?.uploaded_files?.[0] || d?.detail || 'Ошибка отправки'
      toast.error(msg)
    },
  })

  const { register: commentRegister, handleSubmit: handleCommentSubmit, reset: resetComment } = useForm<{ text: string }>()

  const commentMutation = useMutation({
    mutationFn: (data: { text: string }) => api.post(`/api/ideas/${selectedIdea}/comments/`, data),
    onSuccess: () => {
      resetComment()
      qc.invalidateQueries({ queryKey: ['idea', selectedIdea] })
    },
  })

  const onIdeaSubmit = handleSubmit((data) => {
    const fd = new FormData()
    fd.append('task', id)
    fd.append('text', data.text)
    const files = fileRef.current?.files
    if (files) {
      Array.from(files).forEach((f) => fd.append('uploaded_files', f))
    }
    ideaMutation.mutate(fd)
  })

  if (taskLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">Загрузка...</div>
      </>
    )
  }

  if (!task) return null

  const myIdeas = ideas.filter((i) => i.author.id === user?.id)
  const othersIdeas = ideas.filter((i) => i.author.id !== user?.id)

  const statusLabel: Record<string, string> = {
    submitted: 'Отправлено',
    in_progress: 'В работе',
    rejected: 'Отклонено',
    winner: 'Победитель',
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl font-bold flex-1">{task.title}</h1>
              {task.is_recently_updated && (
                <Badge variant="secondary" title={new Date(task.last_updated_at).toLocaleString('ru')}>
                  Обновлено {new Date(task.last_updated_at).toLocaleDateString('ru')}
                </Badge>
              )}
              {task.is_closed && <Badge variant="destructive">Закрыто</Badge>}
            </div>

            {task.reward_hint && (
              <p className="text-green-600 font-medium mb-3">{task.reward_hint}</p>
            )}
            {task.deadline && (
              <p className="text-sm text-muted-foreground mb-4">
                Дедлайн: {new Date(task.deadline).toLocaleString('ru')}
              </p>
            )}

            <div className="prose max-w-none mb-8 whitespace-pre-wrap text-sm leading-relaxed">
              {task.description}
            </div>

            {/* Clarifications */}
            {task.clarifications.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Уточнения</h2>
                <div className="space-y-3">
                  {task.clarifications.map((c) => (
                    <div key={c.id} className="border-l-4 border-blue-400 pl-4 py-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(c.created_at).toLocaleString('ru')}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit idea */}
            {!task.is_closed && (
              ideaSubmitted ? (
                <Card className="mb-8 border-green-200 bg-green-50">
                  <CardContent className="flex flex-col items-center py-8 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="font-semibold text-green-800 mb-1">Идея отправлена!</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Ваша идея принята на рассмотрение. Вы можете отправить ещё одну.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setIdeaSubmitted(false)}>
                      Отправить ещё одну идею
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardHeader><CardTitle className="text-base">Отправить идею</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={onIdeaSubmit} className="space-y-3">
                      <div>
                        <Textarea
                          {...register('text', { required: true, maxLength: 5000 })}
                          placeholder="Опишите вашу идею..."
                          rows={5}
                        />
                        <p className="text-xs text-muted-foreground text-right mt-1">
                          {(watch('text') || '').length} / 5000
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">
                          Прикрепить файлы (до 3, JPG/PNG/PDF, до 10 МБ каждый)
                        </label>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          className="text-sm"
                        />
                      </div>
                      <Button type="submit" disabled={ideaMutation.isPending}>
                        {ideaMutation.isPending ? 'Отправка...' : 'Отправить идею'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )
            )}

            {/* Ideas list */}
            <div>
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <h2 className="text-lg font-semibold">
                  Идеи ({ideas.length})
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={ideasOrdering === '-created_at' ? 'default' : 'outline'}
                    onClick={() => setIdeasOrdering('-created_at')}
                  >
                    Новые ↓
                  </Button>
                  <Button
                    size="sm"
                    variant={ideasOrdering === 'created_at' ? 'default' : 'outline'}
                    onClick={() => setIdeasOrdering('created_at')}
                  >
                    Старые ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:hidden"
                    onClick={toggleHide}
                  >
                    {hideOthers ? 'Показать чужие' : 'Скрыть чужие'}
                  </Button>
                </div>
              </div>

              {/* My ideas always shown */}
              {myIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isOwn
                  statusLabel={statusLabel}
                  selected={selectedIdea === idea.id}
                  onSelect={() => setSelectedIdea(selectedIdea === idea.id ? null : idea.id)}
                  ideaDetail={selectedIdea === idea.id ? ideaDetail : undefined}
                  commentRegister={commentRegister}
                  handleCommentSubmit={handleCommentSubmit}
                  commentMutation={commentMutation}
                />
              ))}

              {/* Others' ideas — always rendered, text hidden when hideOthers */}
              {othersIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isOwn={false}
                  textHidden={hideOthers && !revealedIdeas.has(idea.id)}
                  onToggleReveal={() => toggleReveal(idea.id)}
                  statusLabel={statusLabel}
                  selected={selectedIdea === idea.id}
                  onSelect={() => setSelectedIdea(selectedIdea === idea.id ? null : idea.id)}
                  ideaDetail={selectedIdea === idea.id ? ideaDetail : undefined}
                  commentRegister={commentRegister}
                  handleCommentSubmit={handleCommentSubmit}
                  commentMutation={commentMutation}
                />
              ))}

              {ideas.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <div className="text-4xl mb-2">💡</div>
                  <p className="text-sm">Идей пока нет. Будьте первым!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-52 flex-shrink-0 hidden sm:block">
            <div className="sticky top-20 space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={toggleHide}
              >
                {hideOthers ? 'Показать чужие идеи' : 'Скрыть чужие идеи'}
              </Button>
              <Button
                variant={task.is_favorited ? 'secondary' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => favMutation.mutate()}
              >
                {task.is_favorited ? '★ В избранном' : '☆ В избранное'}
              </Button>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}

function IdeaCard({
  idea, isOwn, textHidden = false, onToggleReveal, statusLabel, selected, onSelect, ideaDetail,
  commentRegister, handleCommentSubmit, commentMutation,
}: {
  idea: any
  isOwn: boolean
  textHidden?: boolean
  onToggleReveal?: () => void
  statusLabel: Record<string, string>
  selected: boolean
  onSelect: () => void
  ideaDetail?: any
  commentRegister: any
  handleCommentSubmit: any
  commentMutation: any
}) {
  return (
    <Card
      id={`idea-${idea.id}`}
      className={`mb-3 scroll-mt-20 ${isOwn ? 'border-blue-200' : ''}`}
    >
      <CardContent className="pt-4">
        {/* Header row: nickname + date + badges + eye */}
        <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{idea.author.nickname}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(idea.created_at).toLocaleString('ru')}
              {idea.files_count > 0 && ` · ${idea.files_count} файл(а)`}
            </span>
          </div>
          <div className="flex gap-2 items-center flex-shrink-0">
            {isOwn && <Badge variant="outline" className="text-xs">Моя</Badge>}
            <Badge variant="secondary" className="text-xs">{statusLabel[idea.status]}</Badge>
            {!isOwn && onToggleReveal && (
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={textHidden ? 'Показать идею' : 'Скрыть идею'}
                onClick={(e) => { e.stopPropagation(); onToggleReveal() }}
              >
                {textHidden ? '👁' : '🙈'}
              </button>
            )}
          </div>
        </div>

        {/* Idea text */}
        {textHidden ? (
          <p className="text-sm text-muted-foreground italic">Идея скрыта</p>
        ) : (
          <p className="text-sm whitespace-pre-wrap line-clamp-3">{idea.text}</p>
        )}

        {/* Comments toggle button */}
        {!textHidden && (
          <button
            className="mt-3 text-xs text-blue-600 hover:underline flex items-center gap-1"
            onClick={(e) => { e.stopPropagation(); onSelect() }}
          >
            {selected ? '▲ Свернуть' : `▼ Комментарии`}
          </button>
        )}

        {selected && ideaDetail && (
          <div className="mt-3 border-t pt-4" onClick={(e) => e.stopPropagation()}>
            {ideaDetail.files.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium mb-1">Файлы:</p>
                {ideaDetail.files.map((f: any) => (
                  <a
                    key={f.id}
                    href={f.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline block"
                  >
                    {f.original_name}
                  </a>
                ))}
              </div>
            )}

            <div className="space-y-2 mb-3">
              {ideaDetail.comments.length === 0 && (
                <p className="text-xs text-muted-foreground">Комментариев пока нет.</p>
              )}
              {ideaDetail.comments.map((c: any) => (
                <div key={c.id} className="bg-muted rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{c.author.nickname}</span>
                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString('ru')}</span>
                  </div>
                  <p className="text-xs">{c.text}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCommentSubmit((data: any) => commentMutation.mutate(data))}
              className="flex gap-2"
            >
              <input
                {...commentRegister('text', { required: true })}
                placeholder="Комментарий..."
                className="flex-1 text-xs border rounded px-2 py-1"
                onClick={(e) => e.stopPropagation()}
              />
              <Button type="submit" size="sm" variant="outline" className="text-xs h-7">
                Отправить
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
