'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

interface FormData {
  email: string
  password: string
  password2: string
}

function ResetForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      await api.post('/api/auth/password-reset/confirm/', { ...data, token })
      setDone(true)
    } catch (err: any) {
      const d = err.response?.data
      const msg = d?.detail || d?.password?.[0] || d?.email?.[0] || 'Ошибка сброса пароля'
      setSubmitError(msg)
    }
  }

  if (done) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-lg font-semibold mb-1">Пароль изменён</h2>
          <p className="text-sm text-muted-foreground mb-4">Теперь можете войти с новым паролем.</p>
          <Link href="/login">
            <Button>Войти</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader><CardTitle>Новый пароль</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Введите ваш email"
              {...register('email', { required: 'Введите email' })}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Новый пароль</Label>
            <Input
              type="password"
              {...register('password', { required: 'Введите пароль', minLength: { value: 8, message: 'Минимум 8 символов' } })}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Повторите пароль</Label>
            <Input
              type="password"
              {...register('password2', {
                required: 'Повторите пароль',
                validate: (val) => val === watch('password') || 'Пароли не совпадают',
              })}
            />
            {errors.password2 && <p className="text-sm text-red-500">{errors.password2.message}</p>}
          </div>
          {submitError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
              {submitError}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Suspense fallback={<p>Загрузка...</p>}>
        <ResetForm />
      </Suspense>
    </div>
  )
}
