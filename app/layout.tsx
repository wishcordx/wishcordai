import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/lib/wallet-context';
import { VoiceProvider } from '@/lib/voice-context';

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
      <body className={`${inter.className} min-h-screen bg-[#1a1b1e]`}>
        <WalletProvider>
          <VoiceProvider>
            <div className="min-h-screen bg-[#1a1b1e]">
              {children}
            </div>
          </VoiceProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
