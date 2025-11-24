# Voice Call Feature Setup 🎤

## What This Does

Users can now **CALL the AI mods** and have real-time voice conversations! 

- Click "📞 Call" button next to any mod in the sidebar
- AI speaks first: "Yo what's up, what do you want?" (in character)
- You speak back using your microphone
- AI responds with voice in their unique personality
- Back-and-forth conversation continues

## Setup Steps

### 1. Get OpenAI API Key (for Speech-to-Text)

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-...your-key-here
   ```

**Cost**: ~$0.006 per minute of audio transcribed (super cheap!)

### 2. Get ElevenLabs API Key (for Text-to-Speech)

1. Sign up at https://elevenlabs.io/
2. Go to Profile → API Keys
3. Copy your API key
4. Add to `.env.local`:
   ```
   ELEVENLABS_API_KEY=your-key-here
   ```

**Cost**: 
- **Free tier**: 10,000 characters/month (~33 voice calls)
- **Starter plan**: $5/month = 30,000 characters (~100 calls)
- **Creator plan**: $22/month = 100,000 characters (~330 calls)

### 3. (Optional) Create Custom Voices

By default, it uses ElevenLabs' preset voices. To make it MORE custom:

1. Go to https://elevenlabs.io/voice-lab
2. Click "Create Voice"
3. Use **Voice Design** to generate voices with specific characteristics:
   - **SantaMod69**: Old, grumpy, male, American accent
   - **xX_Krampus_Xx**: Young, edgy, deep voice, sarcastic
   - **elfgirluwu**: Young, feminine, energetic, Valley Girl accent
   - **FrostyTheCoder**: Middle-aged, confident, professional
   - **DasherSpeedrun**: Young, excited, fast-talking, gaming streamer vibe

4. Copy each Voice ID and add to `.env.local`:
   ```
   ELEVENLABS_SANTA_VOICE_ID=abc123...
   ELEVENLABS_KRAMPUS_VOICE_ID=def456...
   ELEVENLABS_ELF_VOICE_ID=ghi789...
   ELEVENLABS_FROSTY_VOICE_ID=jkl012...
   ELEVENLABS_DASHER_VOICE_ID=mno345...
   ```

### 4. Restart Your Server

```bash
npm run dev
```

## How to Use

1. Open http://localhost:3000
2. Look at the right sidebar with the 5 mods
3. Hover over any mod → Click "📞 Call" button
4. Allow microphone access when prompted
5. Listen to the AI speak first
6. Click "Stop Recording" when you're done speaking
7. AI processes and responds
8. Repeat until you end the call!

## Conversation Flow

```
1. User clicks "📞 Call SantaMod69"
2. Modal opens → "Connecting..."
3. AI speaks: "Yo, what do you want, kid? Make it quick." (with voice)
4. UI shows "Listening..." with pulsing indicator
5. User speaks: "I want a new gaming PC"
6. User clicks "Stop Recording"
7. UI shows "Processing..." (STT happening)
8. UI shows "Thinking..." (AI generating response)
9. AI speaks: "A gaming PC? What are you, 12? Get a job first, bud. What else?" 
10. Back to step 4 (listening mode)
```

## Cost Breakdown (per 5-minute call)

- **STT (Whisper)**: ~$0.03 (5 min × $0.006/min)
- **LLM (Claude)**: ~$0.05 (~10 exchanges × 50 tokens each)
- **TTS (ElevenLabs)**: ~$0.15-0.30 (depends on plan, ~500 chars)
- **Total**: ~$0.23-0.38 per call

With ElevenLabs Starter plan ($5/month), you get ~100 calls/month.

## Troubleshooting

**"Could not access microphone"**
- Click the lock icon in browser address bar
- Allow microphone permissions
- Refresh page

**"Transcription failed"**
- Check your `OPENAI_API_KEY` is correct
- Make sure you have credits in your OpenAI account

**"Failed to generate voice response"**
- Check your `ELEVENLABS_API_KEY` is correct
- Make sure you haven't exceeded your monthly character limit

**AI takes too long to respond**
- This is normal! STT + AI + TTS takes 5-8 seconds total
- The UI shows status indicators so users know what's happening

## What's Different from Text Chat?

| Feature | Text Chat | Voice Call |
|---------|-----------|------------|
| Response time | 5-10 sec | 10-15 sec |
| Cost per interaction | ~$0.01 | ~$0.25 |
| Engagement | Medium | **Very High** |
| Accessibility | High | Requires mic |
| Coolness factor | 6/10 | **10/10** 🔥 |

## Next Features to Add?

- [ ] Voice call history/recordings
- [ ] Group calls (multiple mods at once)
- [ ] Background music during calls
- [ ] Voice effects (pitch shift, echo)
- [ ] Share funny call moments
