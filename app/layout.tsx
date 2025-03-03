import "../styles/globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

let title = "AI solutions for interior design";
let description = "Transform your space with our AI-powered interior design tool. Development by https://acty.dev/";
let ogimage = "/og-image.png";
let sitename = "interiordesgn.com";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: "https://interiordesgn.com",
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
  keywords: "interior design, AI, room transformation, home design, acty.dev, AI development",
  authors: [{ name: "Interior Design Team", url: "https://acty.dev/" }],
  referrer: "origin",
  creator: "Acty.dev Team",
};

// Добавляем глобальный интерфейс для window
declare global {
  interface Window {
    createStars: () => void;
    resizeStarsTimer?: NodeJS.Timeout;
    starsRouteObserver?: MutationObserver;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* CSS is automatically included by Next.js */}
        <link rel="canonical" href="https://interiordesgn.com" />
        <link rel="alternate" href="https://acty.dev/" title="AI Development" />
      </head>
      <body className="bg-black text-white">
        <Toaster 
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 5000 }}
        />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.createStars = function() {
                // Более надежная проверка, находимся ли мы на странице /dream
                const isDreamPage = window.location.pathname === '/dream' || 
                                   window.location.href.includes('/dream') ||
                                   document.querySelector('meta[data-page="/dream"]') !== null;
                
                if (isDreamPage) {
                  // На странице /dream удаляем все звезды
                  const existingContainers = document.querySelectorAll('.starry-background');
                  existingContainers.forEach(container => container.remove());
                  return; // Выходим, не создавая новые звезды
                }
                
                // Удаляем существующие контейнеры со звездами, если они есть
                const existingContainers = document.querySelectorAll('.starry-background');
                existingContainers.forEach(container => container.remove());
                
                // Создаем новый контейнер для звезд
                const container = document.createElement('div');
                container.className = 'starry-background';
                document.body.appendChild(container);
                
                // Цвета звезд с весами
                const starColors = [
                  'white', '#8b5cf6', '#6366f1', '#ec4899', '#a78bfa', 
                  '#60a5fa', '#f59e0b', '#10b981', '#f43f5e', '#fcd34d', 
                  '#06b6d4', '#d946ef'
                ];
                
                const colorWeights = [
                  0.35, 0.07, 0.07, 0.07, 0.07, 0.07,
                  0.05, 0.05, 0.05, 0.05, 0.05, 0.05
                ];
                
                // Функция для выбора цвета с учетом весов
                function getWeightedRandomColor() {
                  const random = Math.random();
                  let sum = 0;
                  
                  for (let i = 0; i < colorWeights.length; i++) {
                    sum += colorWeights[i];
                    if (random < sum) return starColors[i];
                  }
                  
                  return starColors[0];
                }
                
                // Количество звезд зависит от размера экрана
                const numStars = window.innerWidth < 768 ? 150 : 400;
                
                // Создаем обычные звезды
                for (let i = 0; i < numStars; i++) {
                  const star = document.createElement('div');
                  star.className = 'star';
                  
                  const twinkleSpeed = Math.random() * 0.8;
                  star.style.setProperty('--star-time', \`\${twinkleSpeed}\`);
                  star.style.animationDelay = \`\${Math.random() * 1}s\`;
                  
                  star.style.left = \`\${Math.random() * 100}%\`;
                  star.style.top = \`\${Math.random() * 100}%\`;
                  
                  const size = 1 + Math.random() * 3;
                  star.style.width = \`\${size}px\`;
                  star.style.height = \`\${size}px\`;
                  
                  const starColor = getWeightedRandomColor();
                  star.style.background = starColor;
                  
                  if (size > 1.5) {
                    star.style.boxShadow = \`0 0 \${Math.round(size * 1.5)}px \${starColor}\`;
                  }
                  
                  container.appendChild(star);
                }
                
                // Создаем крупные звезды
                for (let i = 0; i < 20; i++) {
                  const bigStar = document.createElement('div');
                  bigStar.className = 'star big-star';
                  
                  const twinkleSpeed = Math.random() * 0.5;
                  bigStar.style.setProperty('--star-time', \`\${twinkleSpeed}\`);
                  bigStar.style.animationDelay = \`\${Math.random() * 1}s\`;
                  
                  bigStar.style.left = \`\${Math.random() * 100}%\`;
                  bigStar.style.top = \`\${Math.random() * 100}%\`;
                  
                  const size = 3 + Math.random() * 3;
                  bigStar.style.width = \`\${size}px\`;
                  bigStar.style.height = \`\${size}px\`;
                  
                  const colorIndex = Math.floor(Math.random() * starColors.length);
                  const starColor = starColors[colorIndex];
                  bigStar.style.background = starColor;
                  bigStar.style.boxShadow = \`0 0 \${Math.round(size * 3)}px \${starColor}\`;
                  
                  container.appendChild(bigStar);
                }
                
                // Функция для создания падающих звезд
                function createShootingStar() {
                  if (!container || !document.body.contains(container)) return;
                  
                  const shootingStar = document.createElement('div');
                  shootingStar.className = 'shooting-star';
                  
                  const startX = 10 + Math.random() * 80;
                  shootingStar.style.left = \`\${startX}%\`;
                  shootingStar.style.top = '-5%';
                  
                  const length = 150 + Math.random() * 200;
                  shootingStar.style.setProperty('--tail-length', \`\${length}px\`);
                  
                  const angle = 30 + Math.random() * 30;
                  const direction = Math.random() > 0.5 ? 1 : -1;
                  shootingStar.style.setProperty('--fall-angle', \`\${direction * angle}deg\`);
                  
                  const duration = 1 + Math.random();
                  shootingStar.style.setProperty('--fall-duration', \`\${duration}s\`);
                  
                  const colorIndex = Math.floor(Math.random() * starColors.length);
                  const starColor = starColors[colorIndex];
                  shootingStar.style.setProperty('--star-color', starColor);
                  
                  container.appendChild(shootingStar);
                  
                  // Удаляем элемент после завершения анимации
                  setTimeout(() => {
                    if (shootingStar.parentNode === container) {
                      container.removeChild(shootingStar);
                    }
                  }, duration * 1000 + 100);
                  
                  // Планируем следующую звезду
                  const nextDelay = 3000 + Math.random() * 7000;
                  setTimeout(createShootingStar, nextDelay);
                }
                
                // Запускаем падающие звезды с разными задержками
                setTimeout(() => {
                  createShootingStar();
                  setTimeout(createShootingStar, 500);
                  setTimeout(createShootingStar, 1500);
                }, 1000);
              };
              
              // Запускаем создание звезд при загрузке страницы
              if (document.readyState === 'complete') {
                window.createStars();
              } else {
                window.addEventListener('load', window.createStars);
              }
              
              // Добавляем обработчик изменения размера окна
              window.addEventListener('resize', function() {
                if (window.resizeStarsTimer) {
                  clearTimeout(window.resizeStarsTimer);
                }
                
                window.resizeStarsTimer = setTimeout(function() {
                  window.createStars();
                }, 200);
              });
              
              // Наблюдаем за изменениями в DOM для отслеживания навигации в Next.js
              // Это помогает реагировать на client-side навигацию без перезагрузки страницы
              if (!window.starsRouteObserver) {
                window.starsRouteObserver = new MutationObserver(function(mutations) {
                  window.createStars(); // Пересоздаём звезды при изменении DOM
                });

                // Начинаем наблюдение за основным контейнером
                setTimeout(function() {
                  const mainElement = document.querySelector('main') || document.querySelector('#__next') || document.body;
                  if (mainElement) {
                    window.starsRouteObserver.observe(mainElement, {
                      childList: true,
                      subtree: true,
                      attributes: false
                    });
                  }
                }, 500);
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
