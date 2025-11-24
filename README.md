# WishAI 🎄

A clean, minimal Christmas-themed web app where users submit wishes and receive personalized AI responses from different Christmas personas.

## Features

- **Multiple Personas**: Get responses from Santa, Grinch, Elf, Snowman, or Reindeer
- **AI-Powered Replies**: Personalized responses using Claude AI
- **Clean Design**: Minimal, hand-made aesthetic with subtle Christmas accents
- **Wish Feed**: Browse recent wishes and replies from the community
- **Profile Pages**: View wishes by wallet address

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Blockchain**: Helius API (scaffolded for future wallet integration)

## Project Structure

```
WishAI/
├── app/
│   ├── api/
│   │   ├── health/route.ts      # Health check endpoint
│   │   ├── wish/route.ts         # Submit wish endpoint
│   │   └── wishes/route.ts       # Get wishes endpoint
│   ├── naughty-list/page.tsx     # All wishes page
│   ├── profile/[wallet]/page.tsx # User profile page
│   ├── wish/[id]/page.tsx        # Individual wish page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
├── components/
│   ├── Feed.tsx                  # Wish feed component
│   ├── Header.tsx                # Navigation header
│   ├── PersonaSelector.tsx       # Persona selection buttons
│   ├── WishCard.tsx              # Individual wish card
│   └── WishForm.tsx              # Wish submission form
├── lib/
│   ├── claude.ts                 # Claude API integration
│   ├── personas.ts               # Persona configurations
│   ├── supabase.ts               # Supabase client & queries
│   └── utils.ts                  # Utility functions
├── public/
│   ├── assets/                   # Static assets (empty for now)
│   └── bg.webp                   # Background pattern (user-provided)
├── typings/
│   └── types.ts                  # TypeScript type definitions
└── ...config files
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- An Anthropic API key
- (Optional) A Helius API key for Solana integration

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd WishAI
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

ANTHROPIC_API_KEY=your_anthropic_api_key

HELIUS_API_KEY=your_helius_api_key
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

4. **Set up the database**

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on setting up your Supabase database.

5. **Add your background image**

Place your `bg.webp` file in the `public/` directory.

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### `POST /api/wish`

Submit a new wish and get an AI response.

**Request Body:**
```json
{
  "wishText": "I wish for a white Christmas!",
  "persona": "santa",
  "walletAddress": "optional_wallet_address"
}
```

**Response:**
```json
{
  "success": true,
  "wish": {
    "id": "uuid",
    "wish_text": "...",
    "persona": "santa",
    "ai_reply": "...",
    "wallet_address": "...",
    "created_at": "2024-12-24T..."
  }
}
```

### `GET /api/wishes`

Get the most recent wishes.

**Response:**
```json
{
  "success": true,
  "wishes": [...]
}
```

### `GET /api/health`

Health check endpoint.

## Personas

Each persona has a unique personality and response style:

- **🎅 Santa**: Jolly, warm, and generous
- **💚 Grinch**: Cynical and sarcastic with a hidden soft spot
- **🧝 Elf**: Cheerful, energetic, and helpful
- **⛄ Snowman**: Calm, gentle, and peaceful
- **🦌 Reindeer**: Adventurous, loyal, and spirited

## Design Philosophy

This project emphasizes:

- **Clean, minimal UI** - No cluttered AI-generated aesthetics
- **Subtle Christmas theme** - Tasteful accents without overwhelming the user
- **Fast performance** - Optimized for quick load times
- **Accessibility** - Readable fonts, good contrast, simple navigation
- **Mobile-first** - Responsive design that works on all devices

## Future Enhancements

- Wallet integration (Solana via Helius)
- User authentication
- Wish reactions/likes
- Image generation for wishes
- NFT minting for special wishes
- Share wish functionality

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for the holidays** 🎄
