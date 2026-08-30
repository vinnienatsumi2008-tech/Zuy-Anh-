import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Arsenal 1886 — Kỷ Nguyên Pháo Thủ | Official Limited Collection',
  description: 'Bộ sưu tập áo đấu Arsenal 1886 phiên bản giới hạn kỷ niệm 140 năm lịch sử hào hùng.',
  icons: {
    icon: '/assets/images/arsenal-1886-crest.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Cabinet+Grotesk:wght@400;500;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --red: #d81e3d;
            --red-dim: rgba(216, 30, 61, 0.15);
            --red-glow: rgba(216, 30, 61, 0.35);
            --gold: #e8c468;
            --gold-dim: rgba(232, 196, 104, 0.15);
            --cream: #f6f3eb;
            --bg: #0a0b0d;
            --bg-elev: #121316;
            --card: #14161a;
            --card-2: #1c1e24;
            --line: rgba(255, 255, 255, 0.08);
            --line-strong: rgba(255, 255, 255, 0.16);
            --text: #f1ede4;
            --mute: #8e929b;
            --mute-2: #5b5f68;
            --success: #22c55e;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
            line-height: 1.5;
          }
          a { color: inherit; text-decoration: none; }
          button { font-family: inherit; border: none; outline: none; background: none; }
          input, textarea, select { font-family: inherit; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: var(--bg); }
          ::-webkit-scrollbar-thumb { background: #262930; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: var(--gold); }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
