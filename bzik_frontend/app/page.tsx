import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-black relative overflow-hidden">
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-tight">
              сначала была <span className="underline">идея</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 max-w-2xl">
              поставляем идеи, с которых начнутся ваше продвижение, узнаваемость и влюбленные клиенты
            </p>

            <div className="flex flex-wrap gap-4 mb-20">
              <Link href="/tasks">
                <Button
                  size="lg"
                  className="bg-black text-white border border-black hover:bg-white hover:text-black rounded-none px-8 py-6 text-lg font-bold transition-all"
                >
                  хочу идею
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border border-black bg-white text-black hover:bg-black hover:text-white rounded-none px-8 py-6 text-lg font-bold transition-all"
                >
                  присоединиться
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Link href="/tasks">
                <div className="border border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                  <h3 className="text-2xl font-bold mb-2">Задания</h3>
                  <p>Найдите актуальные задания и предложите своё решение</p>
                </div>
              </Link>
              <Link href="/profile">
                <div className="border border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                  <h3 className="text-2xl font-bold mb-2">Личный кабинет</h3>
                  <p>Ваши идеи, история и награды</p>
                </div>
              </Link>
              <Link href="/ideas/misc">
                <div className="border border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                  <h3 className="text-2xl font-bold mb-2">Прочее</h3>
                  <p>Идеи вне заданий и обсуждения</p>
                </div>
              </Link>
            </div>

            <div className="border border-black p-10 text-center">
              <h2 className="text-4xl font-bold mb-4">хочу делать креативно</h2>
              <p className="text-xl mb-6">Оставьте заявку, и мы свяжемся с вами для обсуждения проекта</p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-white hover:text-black border border-black rounded-none px-10 py-6 text-xl font-bold transition-all"
                >
                  оставить заявку
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
