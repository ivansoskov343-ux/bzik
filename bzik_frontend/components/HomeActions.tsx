'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'

export default function HomeActions() {
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated } = useAuthStore()

  useEffect(() => setMounted(true), [])

  const authed = mounted && isAuthenticated()

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/tasks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-5xl mb-3">📋</div>
              <h2 className="text-xl font-semibold mb-1">К заданиям</h2>
              <p className="text-sm text-muted-foreground">
                Найдите актуальные задания и предложите своё решение
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={authed ? '/profile' : '/login'}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="text-5xl mb-3">👤</div>
              <h2 className="text-xl font-semibold mb-1">Личный кабинет</h2>
              <p className="text-sm text-muted-foreground">
                Ваши идеи, история и награды
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {mounted && !authed && (
        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button variant="outline">Вход</Button>
          </Link>
          <Link href="/register">
            <Button>Регистрация</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
