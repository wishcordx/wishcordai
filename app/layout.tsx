import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/lib/wallet-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Santa\'s Discord - Christmas Wish Server',
  description: 'Post your Christmas wish and get roasted by unhinged Discord mods. Will they grant your wish, deny it, or send you straight to coal?',
  icons: {
    icon: '/assets/logo.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/eruda" />
        <script dangerouslySetInnerHTML={{ __html: 'eruda.init();' }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#2b2d31]`}>
        <WalletProvider>
          <div className="min-h-screen bg-[#2b2d31]">
            {children}
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
