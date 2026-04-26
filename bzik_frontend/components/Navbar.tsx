'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { Button } from '@/components/ui/button'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          IdeaHub
        </Link>

        <nav className="flex items-center gap-3">
          {mounted && isAuthenticated() ? (
            <>
              <Link href="/tasks" className="text-sm text-muted-foreground hover:text-foreground">
                Задания
              </Link>
              <Link href="/ideas/misc" className="text-sm text-muted-foreground hover:text-foreground">
                Прочее
              </Link>
              <NotificationBell />
              <Link href="/profile">
                <Button variant="outline" size="sm">{user?.nickname ?? 'Профиль'}</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Выйти</Button>
            </>
          ) : mounted ? (
            <>
              <Link href="/login"><Button variant="outline" size="sm">Войти</Button></Link>
              <Link href="/register"><Button size="sm">Регистрация</Button></Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
