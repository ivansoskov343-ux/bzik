'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false)
  const { register, handleSubmit } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    try {
      const { data: res } = await api.post('/api/auth/password-reset/', data)
      toast.success(res.detail)
      setDone(true)
    } catch {
      toast.error('Ошибка запроса')
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Восстановление пароля</CardTitle></CardHeader>
        <CardContent>
          {done ? (
            <p className="text-sm text-muted-foreground">Если email зарегистрирован, письмо отправлено.</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" {...register('email', { required: true })} />
              </div>
              <Button type="submit" className="w-full">Отправить ссылку</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
