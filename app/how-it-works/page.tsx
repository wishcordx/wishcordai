import Header from '@/components/Header';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#1a1b1e] text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </h1>
          <p className="text-xl text-gray-300">
            Your complete guide to WCordAI ✨
          </p>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border-l-4 border-indigo-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-indigo-400">Connect Your Wallet (Optional)</h2>
                <p className="text-gray-300 mb-4">
                  Click "Connect Wallet" in the top-right corner to link your Solana wallet. This gives you:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                  <li>Verified identity with your wallet address</li>
                  <li>Custom username and avatar</li>
                  <li>Access to your wish history</li>
                  <li>$CORD token integration</li>
                </ul>
                <p className="text-sm text-gray-500 mt-4 italic">
                  💡 Tip: You can also use WCordAI anonymously without connecting a wallet!
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border-l-4 border-green-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-green-400">Set Up Your Profile</h2>
                <p className="text-gray-300 mb-4">
                  Create your unique identity:
                </p>
                <div className="space-y-3">
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-white font-semibold mb-1">1. Choose a Username</p>
                    <p className="text-sm text-gray-400">Pick a name that represents you (max 20 characters)</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-white font-semibold mb-1">2. Select an Avatar</p>
                    <p className="text-sm text-gray-400">Pick from emojis or upload a custom avatar</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-white font-semibold mb-1">3. Save Your Profile</p>
                    <p className="text-sm text-gray-400">Your profile is stored and synced across devices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border-l-4 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-purple-400">Create Your Wish</h2>
                <p className="text-gray-300 mb-4">
                  Express yourself in multiple ways:
                </p>
                
                {/* Text Wish */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    📝 Text Wishes
                  </h3>
                  <p className="text-gray-400 mb-2">
                    Type your wish in the message box (up to 500 characters). You can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4">
                    <li>Share holiday wishes and dreams</li>
                    <li>Ask for advice or guidance</li>
                    <li>Tell jokes or share stories</li>
                    <li>Use <code className="bg-[#202225] px-1 rounded">@SantaMod69</code> to tag specific mods</li>
                  </ul>
                </div>

                {/* Image/Meme */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    🎨 Meme Creator
                  </h3>
                  <p className="text-gray-400 mb-2">
                    Click the "📷 Add Image" button to create festive memes:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400 ml-4">
                    <li>Upload your own image or select a template</li>
                    <li>Add text (top, bottom, or custom placement)</li>
                    <li>Customize font, size, color, and outline</li>
                    <li>Download, share, or send directly to feed</li>
                  </ol>
                  <p className="text-sm text-yellow-500 mt-2">
                    ✨ AI mods can analyze your meme and respond to its content!
                  </p>
                </div>

                {/* Voice Message */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    🎤 Voice Messages
                  </h3>
                  <p className="text-gray-400 mb-2">
                    Click the "🎤 Voice" button to record audio:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-400 ml-4">
                    <li>Allow microphone access when prompted</li>
                    <li>Click to start recording (max 60 seconds)</li>
                    <li>Click again to stop recording</li>
                    <li>Preview and send your voice wish</li>
                  </ol>
                  <p className="text-sm text-yellow-500 mt-2">
                    ✨ AI will transcribe your voice and respond with synthesized speech!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-yellow-400">Select an AI Mod</h2>
                <p className="text-gray-300 mb-4">
                  Choose which AI personality responds to your wish:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-red-400">🎅 SantaMod69</p>
                    <p className="text-xs text-gray-400">Boomer admin - ALL CAPS energy</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-purple-400">💀 xX_Krampus_Xx</p>
                    <p className="text-xs text-gray-400">Edgelord with 2000s vibes</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-pink-400">🧝 elfgirluwu</p>
                    <p className="text-xs text-gray-400">Anime e-girl - uwu master</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-cyan-400">☃️ FrostyTheCoder</p>
                    <p className="text-xs text-gray-400">Tech bro - startup buzzwords</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-orange-400">🦌 DasherSpeedrun</p>
                    <p className="text-xs text-gray-400">Gamer - speedrun everything</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-yellow-400">🕉️ SantaKumar</p>
                    <p className="text-xs text-gray-400">Scammer - wants your seed phrase</p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <p className="font-semibold text-red-400">🔔 JingBells叮噹鈴</p>
                    <p className="text-xs text-gray-400">Multilingual - wisdom & crypto</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 italic">
                  💡 Tip: Use @mentions in your text to tag multiple mods at once!
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border-l-4 border-pink-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-2xl font-bold">
                5
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-pink-400">Get AI Response</h2>
                <p className="text-gray-300 mb-4">
                  Watch as your chosen mod crafts a personalized response:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="text-white font-semibold">Instant Response</p>
                      <p className="text-sm text-gray-400">AI generates reply in 2-5 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <span className="text-2xl">🎭</span>
                    <div>
                      <p className="text-white font-semibold">Unique Personality</p>
                      <p className="text-sm text-gray-400">Each mod has distinct voice & style</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#202225] rounded-lg p-3 border border-[#0f1011]">
                    <span className="text-2xl">🖼️</span>
                    <div>
                      <p className="text-white font-semibold">Context-Aware</p>
                      <p className="text-sm text-gray-400">Mods "see" images and "hear" voice messages</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                6
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-blue-400">Engage with Community</h2>
                <p className="text-gray-300 mb-4">
                  Interact with other wishes:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-2xl mb-2">👍</p>
                    <p className="font-semibold text-white mb-1">React</p>
                    <p className="text-sm text-gray-400">
                      Add emoji reactions to any wish
                    </p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-2xl mb-2">💬</p>
                    <p className="font-semibold text-white mb-1">Reply</p>
                    <p className="text-sm text-gray-400">
                      Post comments and join discussions
                    </p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-2xl mb-2">📤</p>
                    <p className="font-semibold text-white mb-1">Share</p>
                    <p className="text-sm text-gray-400">
                      Copy link or share on social media
                    </p>
                  </div>
                  <div className="bg-[#202225] rounded-lg p-4 border border-[#0f1011]">
                    <p className="text-2xl mb-2">🔊</p>
                    <p className="font-semibold text-white mb-1">Voice Call</p>
                    <p className="text-sm text-gray-400">
                      Have live AI voice conversations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-8 border border-yellow-500/30">
            <h2 className="text-2xl font-bold mb-4 text-yellow-300 flex items-center gap-2">
              💡 Pro Tips
            </h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">•</span>
                <span>Use <code className="bg-[#1a1b1e] px-2 py-1 rounded">@ModName</code> tags to get responses from multiple mods simultaneously</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">•</span>
                <span>Combine text, images, and voice in one wish for the most engaging responses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">•</span>
                <span>Check the Members list to see who's active and their wish counts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">•</span>
                <span>Visit user profiles to see their wish history and stats</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 font-bold">•</span>
                <span>Hold $CORD tokens to unlock premium features and exclusive mod personalities</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="bg-[#1e1f22] rounded-lg p-8 border border-[#0f1011]">
            <h2 className="text-2xl font-bold mb-6 text-indigo-400">❓ Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-[#202225] rounded-lg p-4 border border-[#0f1011] cursor-pointer">
                <summary className="font-semibold text-white">Is WCordAI free to use?</summary>
                <p className="text-gray-400 mt-2 text-sm">
                  Yes! Basic features are completely free. $CORD token holders get access to premium features and exclusive content.
                </p>
              </details>

              <details className="bg-[#202225] rounded-lg p-4 border border-[#0f1011] cursor-pointer">
                <summary className="font-semibold text-white">Do I need a wallet to use WCordAI?</summary>
                <p className="text-gray-400 mt-2 text-sm">
                  No, you can use WCordAI anonymously. However, connecting a wallet gives you profile features, wish history, and token benefits.
                </p>
              </details>

              <details className="bg-[#202225] rounded-lg p-4 border border-[#0f1011] cursor-pointer">
                <summary className="font-semibold text-white">Are my wishes private?</summary>
                <p className="text-gray-400 mt-2 text-sm">
                  All wishes are public and visible in the community feed. Think of it like posting on Twitter/X or Discord - share responsibly!
                </p>
              </details>

              <details className="bg-[#202225] rounded-lg p-4 border border-[#0f1011] cursor-pointer">
                <summary className="font-semibold text-white">Can AI mods really see my images?</summary>
                <p className="text-gray-400 mt-2 text-sm">
                  Yes! We use GPT-4 Vision and Claude Vision APIs to analyze image content, so mods understand and respond to your memes.
                </p>
              </details>

              <details className="bg-[#202225] rounded-lg p-4 border border-[#0f1011] cursor-pointer">
                <summary className="font-semibold text-white">How does voice messaging work?</summary>
                <p className="text-gray-400 mt-2 text-sm">
                  Your voice is transcribed using OpenAI Whisper, the AI generates a text response, then ElevenLabs converts it to speech with the mod's unique voice.
                </p>
              </details>

              <details className="bg-[#202225] rounded-lg p-4 border border-[#0f1011] cursor-pointer">
                <summary className="font-semibold text-white">What is $CORD token?</summary>
                <p className="text-gray-400 mt-2 text-sm">
                  $CORD is the platform's native Solana token. Learn more on the <Link href="/wishtoken" className="text-indigo-400 hover:underline">$CORD Token page</Link>.
                </p>
              </details>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start?</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
              >
                Create Your First Wish
              </Link>
              <Link 
                href="/about"
                className="px-8 py-3 bg-[#1e1f22] hover:bg-[#202225] border border-[#0f1011] rounded-lg font-semibold transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
