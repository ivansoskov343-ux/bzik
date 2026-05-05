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
    <header className="border-b border-black bg-white sticky top-0 z-50 font-mono">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-2xl tracking-tight">
          BZIK
        </Link>

        <nav className="flex items-center gap-6">
          {mounted && isAuthenticated() ? (
            <>
              <Link href="/tasks" className="text-sm hover:text-accent transition-colors">
                Задания
              </Link>
              <Link href="/ideas/misc" className="text-sm hover:text-accent transition-colors">
                Прочее
              </Link>
              <NotificationBell />
              <Link href="/profile">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border border-black rounded-none hover:bg-black hover:text-white"
                >
                  {user?.nickname ?? 'Профиль'}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="hover:bg-black hover:text-white rounded-none"
              >
                Выйти
              </Button>
            </>
          ) : mounted ? (
            <>
              <Link href="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border border-black rounded-none hover:bg-black hover:text-white"
                >
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="sm" 
                  className="bg-accent text-white border border-accent rounded-none hover:bg-white hover:text-accent hover:border-accent"
                >
                  Регистрация
                </Button>
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
