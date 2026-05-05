'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useAuthStore } from '@/lib/auth-store'

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setTokens, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setLoginError(null)
    try {
      const { data: tokens } = await api.post('/api/auth/login/', data)
      setTokens(tokens.access, tokens.refresh)
      const { data: profile } = await api.get('/api/profile/me/')
      setUser(profile)
      router.push('/tasks')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Неверный email или пароль'
      setLoginError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-white font-mono">
      <Card className="w-full max-w-md border border-black rounded-none shadow-none">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-3xl font-bold text-center">Вход</CardTitle>
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
              <Label htmlFor="password" className="text-lg font-bold">Пароль</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                className="border border-black rounded-none focus:ring-0 focus:border-black"
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {loginError && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive p-3">
                {loginError}
              </p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-black text-white border border-black rounded-none hover:bg-white hover:text-black text-lg font-bold py-6 transition-all" 
              disabled={loading}
            >
              {loading ? 'Входим...' : 'Войти'}
            </Button>
          </form>
          <div className="mt-8 text-center space-y-4">
            <div>
              <Link href="/forgot-password" className="text-black hover:text-accent underline text-lg">
                Забыли пароль?
              </Link>
            </div>
            <div className="text-lg">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-accent hover:underline font-bold">
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
