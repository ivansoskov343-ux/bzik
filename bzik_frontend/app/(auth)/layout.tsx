import Navbar from '@/components/Navbar'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col">{children}</div>
    </>
  )
}
