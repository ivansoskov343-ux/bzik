'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

const schema = z.object({
  email: z.string().email('Некорректный email'),
  nickname: z.string().min(3, 'Минимум 3 символа').max(50),
  password: z.string().min(8, 'Минимум 8 символов'),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: 'Пароли не совпадают',
  path: ['password2'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await api.post('/api/auth/register/', data)
      setDone(true)
    } catch (err: any) {
      const d = err.response?.data
      const msg = d?.email?.[0] || d?.nickname?.[0] || d?.password?.[0] || d?.detail || 'Ошибка регистрации'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center p-8">
          <p className="text-lg font-semibold mb-2">Аккаунт создан!</p>
          <p className="text-muted-foreground text-sm">
            Проверьте email и перейдите по ссылке для подтверждения.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="nickname">Никнейм</Label>
              <Input id="nickname" {...register('nickname')} />
              {errors.nickname && <p className="text-sm text-red-500">{errors.nickname.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password2">Повторите пароль</Label>
              <Input id="password2" type="password" {...register('password2')} />
              {errors.password2 && <p className="text-sm text-red-500">{errors.password2.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Войти</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
