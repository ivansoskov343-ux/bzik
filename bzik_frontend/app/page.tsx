import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-black font-mono relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-20 left-10 w-64 h-64 border border-black opacity-10 rotate-12"></div>
        <div className="absolute bottom-40 right-10 w-80 h-80 border border-black opacity-5 -rotate-6"></div>
        
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Заголовок */}
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-tight">
              сначала была <span className="text-accent">идея</span>
            </h1>
            
            {/* Подзаголовок */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl">
              поставляем идеи, с которых начнутся ваше продвижение, узнаваемость и влюбленные клиенты
            </p>
            
            {/* Кнопки призыва к действию */}
            <div className="flex flex-wrap gap-4 mb-20">
              <Link href="/tasks">
                <Button 
                  size="lg" 
                  className="bg-black text-white border-2 border-black hover:bg-white hover:text-black rounded-none px-8 py-6 text-lg font-bold transition-all"
                >
                  хочу идею
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-none px-8 py-6 text-lg font-bold transition-all"
                >
                  присоединиться
                </Button>
              </Link>
            </div>
            
            {/* Блоки навигации */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <Link href="/tasks">
                <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                  <h3 className="text-2xl font-bold mb-2">Задания</h3>
                  <p className="text-muted-foreground">Найдите актуальные задания и предложите своё решение</p>
                </div>
              </Link>
              <Link href="/profile">
                <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                  <h3 className="text-2xl font-bold mb-2">Личный кабинет</h3>
                  <p className="text-muted-foreground">Ваши идеи, история и награды</p>
                </div>
              </Link>
              <Link href="/ideas/misc">
                <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all cursor-pointer">
                  <h3 className="text-2xl font-bold mb-2">Прочее</h3>
                  <p className="text-muted-foreground">Идеи вне заданий и обсуждения</p>
                </div>
              </Link>
            </div>
            
            {/* Оранжевый акцентный блок */}
            <div className="bg-accent text-white p-10 text-center">
              <h2 className="text-4xl font-bold mb-4">хочу делать креативно</h2>
              <p className="text-xl mb-6">Оставьте заявку, и мы свяжемся с вами для обсуждения проекта</p>
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-black hover:text-white rounded-none px-10 py-6 text-xl font-bold transition-all"
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
