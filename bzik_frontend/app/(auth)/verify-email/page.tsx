'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

function VerifyEmailContent() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Токен не указан.')
      return
    }
    api.get(`/api/auth/verify-email/${token}/`)
      .then(({ data }) => { setStatus('ok'); setMessage(data.detail) })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Ссылка недействительна.')
      })
  }, [token])

  return (
    <div className="text-center">
      {status === 'loading' && <p>Проверяем...</p>}
      {status === 'ok' && (
        <>
          <p className="text-lg font-semibold text-green-600">{message}</p>
          <Link href="/login" className="mt-4 block text-blue-600 hover:underline">Войти</Link>
        </>
      )}
      {status === 'error' && <p className="text-red-500">{message}</p>}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Suspense fallback={<p>Загрузка...</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
