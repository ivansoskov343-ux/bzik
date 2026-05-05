# План изменений внешнего вида сайта

## Задачи

1. **Убрать квадраты на заднем плане**
   - Удалить два декоративных элемента в `app/page.tsx` (строки 11-12):
     ```tsx
     <div className="absolute top-20 left-10 w-64 h-64 border border-black opacity-10 rotate-12"></div>
     <div className="absolute bottom-40 right-10 w-80 h-80 border border-black opacity-5 -rotate-6"></div>
     ```

2. **Убрать букву N в нижнем левом углу (логотип Next.js)**
   - Логотип Next.js по умолчанию отображается в режиме разработки. Чтобы его убрать, можно добавить в `next.config.ts` настройку `devIndicators: { appIsrStatus: false }` или скрыть через CSS. Проще всего добавить глобальный стиль:
     ```css
     /* В globals.css */
     .nextjs-logo { display: none; }
     ```
   - Однако точный метод требует уточнения. Возможно, логотип встроен в компонент `next/font`. Если он не виден в коде, можно проигнорировать, так как это дефолтный элемент Next.js, который можно отключить в конфигурации.

3. **Убрать все цвета, кроме черного и белого**
   - Изменить цветовые переменные в `app/globals.css`:
     - Заменить `--accent: #f75419;` на `--accent: #000000;` (для светлой темы) и `--accent: #ffffff;` (для темной темы).
     - Заменить `--destructive: #d42204;` на `--destructive: #000000;` / `#ffffff`.
     - Заменить `--chart-1: #f75419;` на `#000000`.
     - Заменить `--sidebar-accent: #f75419;` на `#000000`.
     - Для темной темы аналогично.
   - Пример изменений для секции `:root` и `.dark`.

4. **Сделать границы полей (кнопок) тоньше в два раза**
   - Заменить все вхождения `border-2` на `border` (1px).
   - Заменить `border-b-2`, `border-t-2` и т.д. на `border-b`, `border-t`.
   - Файлы для изменения:
     - `components/Navbar.tsx`
     - `app/page.tsx`
     - `app/(auth)/login/page.tsx`
     - `app/(auth)/register/page.tsx`
     - `app/(auth)/forgot-password/page.tsx`
     - `app/tasks/page.tsx`
     - `app/ideas/misc/page.tsx`
     - `app/profile/page.tsx`
     - и другие.

## Детальные изменения

### 1. globals.css

Заменить блок `:root`:
```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --card: #ffffff;
  --card-foreground: #000000;
  --popover: #ffffff;
  --popover-foreground: #000000;
  --primary: #000000;
  --primary-foreground: #ffffff;
  --secondary: #f2f2f2;
  --secondary-foreground: #000000;
  --muted: #f2f2f2;
  --muted-foreground: #666666;
  --accent: #000000;
  --accent-foreground: #ffffff;
  --destructive: #000000;
  --border: #000000;
  --input: #f2f2f2;
  --ring: #000000;
  --chart-1: #000000;
  --chart-2: #000000;
  --chart-3: #f2f2f2;
  --chart-4: #666666;
  --chart-5: #ffffff;
  --radius: 0px;
  --sidebar: #ffffff;
  --sidebar-foreground: #000000;
  --sidebar-primary: #000000;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #000000;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #000000;
  --sidebar-ring: #000000;
}
```

Заменить блок `.dark`:
```css
.dark {
  --background: #000000;
  --foreground: #ffffff;
  --card: #1a1a1a;
  --card-foreground: #ffffff;
  --popover: #1a1a1a;
  --popover-foreground: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #000000;
  --secondary: #333333;
  --secondary-foreground: #ffffff;
  --muted: #333333;
  --muted-foreground: #cccccc;
  --accent: #ffffff;
  --accent-foreground: #000000;
  --destructive: #ffffff;
  --border: #ffffff;
  --input: #333333;
  --ring: #ffffff;
  --chart-1: #ffffff;
  --chart-2: #ffffff;
  --chart-3: #333333;
  --chart-4: #666666;
  --chart-5: #000000;
  --sidebar: #1a1a1a;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #ffffff;
  --sidebar-primary-foreground: #000000;
  --sidebar-accent: #ffffff;
  --sidebar-accent-foreground: #000000;
  --sidebar-border: #ffffff;
  --sidebar-ring: #ffffff;
}
```

### 2. Удаление квадратов

В `app/page.tsx` удалить строки 11-12 (декоративные элементы).

### 3. Замена border-2

Во всех файлах заменить `border-2` на `border`, `border-b-2` на `border-b` и т.д.

### 4. Проверка изменений

После внесения изменений запустить dev-сервер (уже запущен) и проверить визуальные изменения в браузере.

## Следующие шаги

Переключиться в режим Code для реализации этих изменений.
