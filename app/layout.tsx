import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletProvider } from '@/lib/wallet-context';
import { VoiceProvider } from '@/lib/voice-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WCordAI - AI-Powered Christmas Social Platform',
  description: 'Drop your Christmas wish and interact with 8 AI mods on WCordAI. A Discord-style platform where AI personalities respond to your wishes in real-time.',
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
