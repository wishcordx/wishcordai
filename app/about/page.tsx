import Header from '@/components/Header';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1a1b1e] text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            About WishAI
          </h1>
          <p className="text-xl text-gray-300">
            Where AI meets the holiday spirit 🎄✨
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* What is WishAI */}
          <section className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011]">
            <h2 className="text-3xl font-bold mb-4 text-indigo-400">🎅 What is WishAI?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              WishAI is a revolutionary social platform that combines the magic of the holiday season with cutting-edge AI technology. 
              Share your Christmas wishes, create festive memes, send voice messages, and interact with AI-powered Christmas characters 
              who respond in unique, entertaining personalities.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Built on the Solana blockchain with Web3 integration, WishAI creates a decentralized community where every wish is 
              permanently recorded and every interaction is authentic.
            </p>
          </section>

          {/* Our AI Mods */}
          <section className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011]">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400">🤖 Meet Our AI Mods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🎅 <span className="text-red-400">SantaMod69</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The jolly judge who reviews wishes with Christmas spirit. Will your wish be granted or will you get coal?
                </p>
              </div>

              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  👺 <span className="text-green-400">GrinchMod</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The grumpy critic who sees through fake wishes. Brutally honest and hilariously cynical.
                </p>
              </div>

              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🧝 <span className="text-yellow-400">ElfMod</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The cheerful helper who provides constructive wish advice with endless enthusiasm.
                </p>
              </div>

              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  ⛄ <span className="text-blue-400">FrostyMod</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The cool philosopher who drops wisdom while staying chill about everything.
                </p>
              </div>

              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🦌 <span className="text-orange-400">RudolphMod</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The motivational leader who inspires you to reach for the stars with your wishes.
                </p>
              </div>

              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🎁 <span className="text-pink-400">ScammerMod</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The chaotic trickster who might give great advice or lead you totally astray. Good luck!
                </p>
              </div>

              <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  🔔 <span className="text-yellow-300">JingBells叮噹鈴</span>
                </h3>
                <p className="text-sm text-gray-400">
                  The savvy Chinese trader who mixes market wisdom with festive fortune cookies.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011]">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400">✨ Platform Features</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="text-3xl">📝</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">Text Wishes</h3>
                  <p className="text-gray-400">Share your holiday wishes and get AI responses instantly</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🎨</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">Meme Editor</h3>
                  <p className="text-gray-400">Create custom festive memes with our built-in editor and send them to the feed</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🎤</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">Voice Messages</h3>
                  <p className="text-gray-400">Record voice wishes and get AI voice responses from your favorite mods</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">@</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">@Mention Tagging</h3>
                  <p className="text-gray-400">Tag specific mods using @SantaMod69 style mentions for targeted responses</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">💬</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">Community Interaction</h3>
                  <p className="text-gray-400">React to wishes, post replies, and engage with the community</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🔗</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">Web3 Integration</h3>
                  <p className="text-gray-400">Connect your Solana wallet for authenticated experiences and $WISH token access</p>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="text-3xl">🎭</span>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-white">Custom Profiles</h3>
                  <p className="text-gray-400">Create your unique identity with custom avatars and usernames</p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011]">
            <h2 className="text-3xl font-bold mb-6 text-indigo-400">⚙️ Powered By</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">Claude AI</p>
                <p className="text-xs text-gray-400 mt-1">Text Generation</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">GPT-4 Vision</p>
                <p className="text-xs text-gray-400 mt-1">Image Analysis</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">OpenAI Whisper</p>
                <p className="text-xs text-gray-400 mt-1">Voice Transcription</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">ElevenLabs</p>
                <p className="text-xs text-gray-400 mt-1">Voice Synthesis</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">Next.js 14</p>
                <p className="text-xs text-gray-400 mt-1">Framework</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">Supabase</p>
                <p className="text-xs text-gray-400 mt-1">Database & Storage</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">Solana</p>
                <p className="text-xs text-gray-400 mt-1">Blockchain</p>
              </div>
              <div className="text-center p-4 bg-[#202225] rounded-lg border border-[#0f1011]">
                <p className="font-semibold text-white">Fabric.js</p>
                <p className="text-xs text-gray-400 mt-1">Canvas Editor</p>
              </div>
            </div>
          </section>

          {/* $WISH Token */}
          <section className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg p-8 border border-indigo-500/30">
            <h2 className="text-3xl font-bold mb-4 text-indigo-300">💎 $WISH Token</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              $WISH is the native token powering the WishAI ecosystem. Hold $WISH to access premium features, 
              exclusive AI personalities, and participate in governance decisions.
            </p>
            <Link 
              href="/wishtoken"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
            >
              Learn More About $WISH →
            </Link>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Make Your Wish?</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
              >
                Start Wishing
              </Link>
              <Link 
                href="/how-it-works"
                className="px-8 py-3 bg-[#1e1f22] hover:bg-[#202225] border border-[#0f1011] rounded-lg font-semibold transition-colors"
              >
                How It Works
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
