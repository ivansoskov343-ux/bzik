'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import Navbar from '@/components/Navbar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

interface Task {
  id: number
  title: string
  reward_hint: string
  created_at: string
  last_updated_at: string
  deadline: string | null
  is_closed: boolean
  is_recently_updated: boolean
  ideas_count: number
}

type OrderingKey = '-last_updated_at' | 'last_updated_at' | '-created_at' | 'created_at'

const ORDERING_LABELS: Record<OrderingKey, string> = {
  '-last_updated_at': 'Обновлено ↓',
  'last_updated_at': 'Обновлено ↑',
  '-created_at': 'Созданo ↓',
  'created_at': 'Создано ↑',
}

export default function TasksPage() {
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState<OrderingKey>('-last_updated_at')

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', search, ordering],
    queryFn: async () => {
      const params: Record<string, string> = { ordering }
      if (search) params.search = search
      const { data } = await api.get('/api/tasks/', { params })
      return data
    },
  })

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold mr-auto">Задания</h1>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(ORDERING_LABELS) as OrderingKey[]).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={ordering === key ? 'default' : 'outline'}
                onClick={() => setOrdering(key)}
              >
                {ORDERING_LABELS[key]}
              </Button>
            ))}
          </div>
          <Input
            className="max-w-xs"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading && <p className="text-muted-foreground">Загрузка...</p>}

        {!isLoading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-medium mb-1">
              {search ? 'Ничего не найдено' : 'Заданий пока нет'}
            </p>
            <p className="text-sm">
              {search ? 'Попробуйте изменить запрос' : 'Загляните позже — задания скоро появятся'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {tasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${task.is_closed ? 'opacity-50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <div className="flex gap-2 flex-shrink-0">
                      {task.is_recently_updated && (
                        <Badge variant="secondary" title={new Date(task.last_updated_at).toLocaleString('ru')}>
                          Обновлено {new Date(task.last_updated_at).toLocaleDateString('ru')}
                        </Badge>
                      )}
                      {task.is_closed && (
                        <Badge variant="destructive">Закрыто</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{task.ideas_count} идей</span>
                    <div className="flex gap-4">
                      {task.reward_hint && (
                        <span className="text-green-600 font-medium">{task.reward_hint}</span>
                      )}
                      {task.deadline && (
                        <span>До {new Date(task.deadline).toLocaleDateString('ru')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
