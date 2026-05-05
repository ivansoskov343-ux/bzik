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
    <div className="flex-1 flex items-center justify-center px-4 py-16 bg-white font-mono">
      <Card className="w-full max-w-md border border-black rounded-none shadow-none">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-3xl font-bold text-center">Восстановление пароля</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          {done ? (
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6">Если email зарегистрирован, письмо отправлено.</p>
              <Button 
                className="bg-black text-white border border-black rounded-none hover:bg-white hover:text-black"
                onClick={() => setDone(false)}
              >
                Отправить ещё раз
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-lg font-bold">Email</Label>
                <Input 
                  type="email" 
                  {...register('email', { required: true })} 
                  className="border border-black rounded-none focus:ring-0 focus:border-black"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-black text-white border border-black rounded-none hover:bg-white hover:text-black text-lg font-bold py-6 transition-all"
              >
                Отправить ссылку
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
