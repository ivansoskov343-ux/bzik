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
      <div className="flex-1 flex items-center justify-center px-4 bg-white font-mono">
        <Card className="w-full max-w-md border border-black rounded-none shadow-none text-center p-10">
          <p className="text-2xl font-bold mb-4">Аккаунт создан!</p>
          <p className="text-muted-foreground text-lg">
            Проверьте email и перейдите по ссылке для подтверждения.
          </p>
          <Link href="/login">
            <Button className="mt-6 bg-black text-white border border-black rounded-none hover:bg-white hover:text-black">
              Войти
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-white font-mono">
      <Card className="w-full max-w-md border border-black rounded-none shadow-none">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-3xl font-bold text-center">Регистрация</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-bold">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                className="border border-black rounded-none focus:ring-0 focus:border-black"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-lg font-bold">Никнейм</Label>
              <Input 
                id="nickname" 
                {...register('nickname')} 
                className="border border-black rounded-none focus:ring-0 focus:border-black"
              />
              {errors.nickname && <p className="text-sm text-destructive">{errors.nickname.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-bold">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                className="border border-black rounded-none focus:ring-0 focus:border-black"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2" className="text-lg font-bold">Повторите пароль</Label>
              <Input 
                id="password2" 
                type="password" 
                {...register('password2')} 
                className="border border-black rounded-none focus:ring-0 focus:border-black"
              />
              {errors.password2 && <p className="text-sm text-destructive">{errors.password2.message}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent text-white border border-accent rounded-none hover:bg-white hover:text-accent text-lg font-bold py-6 transition-all" 
              disabled={loading}
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </Button>
          </form>
          <p className="mt-8 text-center text-lg">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-accent hover:underline font-bold">Войти</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
