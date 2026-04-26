'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { useAuthStore } from '@/lib/auth-store'

interface Notification {
  id: number
  type: string
  message: string
  is_read: boolean
  created_at: string
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const fetchUnread = async () => {
    if (!isAuthenticated()) return
    try {
      const { data } = await api.get('/api/notifications/?is_read=false&limit=10')
      setNotifications(data)
    } catch {}
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => clearInterval(interval)
  }, [])

  const markRead = async (id: number) => {
    await api.post(`/api/notifications/${id}/read/`)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllRead = async () => {
    await api.post('/api/notifications/read-all/')
    setNotifications([])
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent focus:outline-none">
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">Нет новых уведомлений</div>
        ) : (
          <>
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 cursor-pointer"
                onClick={() => markRead(n.id)}
              >
                <span className="text-sm">{n.message}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString('ru')}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="text-center text-sm text-blue-600 cursor-pointer"
              onClick={markAllRead}
            >
              Прочитать все
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
