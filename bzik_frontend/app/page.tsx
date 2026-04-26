import Navbar from '@/components/Navbar'
import HomeActions from '@/components/HomeActions'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Ваши идеи меняют всё
          </h1>
          <p className="text-lg text-muted-foreground">
            Участвуйте в заданиях, предлагайте решения и получайте вознаграждения за лучшие идеи.
          </p>
        </div>
        <HomeActions />
      </main>
    </>
  )
}
