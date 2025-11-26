# Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel Dashboard → Project Settings → Environment Variables

---

## **1. Supabase Variables**

### `NEXT_PUBLIC_SUPABASE_URL`
```
Your Supabase project URL
Example: https://abcdefghijklmn.supabase.co
```
**Where to find:** Supabase Dashboard → Settings → API → Project URL

---

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
```
Your Supabase anon/public key
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Where to find:** Supabase Dashboard → Settings → API → anon public key

---

### `SUPABASE_SERVICE_ROLE_KEY`
```
Your Supabase service role key (keep secret!)
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Where to find:** Supabase Dashboard → Settings → API → service_role key

⚠️ **IMPORTANT:** Mark this as "Secret" in Vercel (hide from logs)

---

## **2. OpenAI Variables**

### `OPENAI_API_KEY`
```
Your OpenAI API key for Whisper (voice transcription)
Example: sk-proj-...
```
**Where to find:** https://platform.openai.com/api-keys

⚠️ **Mark as Secret**

---

## **3. Anthropic Variables**

### `ANTHROPIC_API_KEY`
```
Your Anthropic API key for Claude (AI responses)
Example: sk-ant-api03-...
```
**Where to find:** https://console.anthropic.com/settings/keys

⚠️ **Mark as Secret**

---

## **4. ElevenLabs Variables**

### `ELEVENLABS_API_KEY`
```
Your ElevenLabs API key for voice generation
Example: sk_...
```
**Where to find:** https://elevenlabs.io/app/settings/api-keys

⚠️ **Mark as Secret**

---

### `ELEVENLABS_SANTA_VOICE_ID`
```
Voice ID for SantaMod69
Example: pNInz6obpgDQGcFmaJgB
```

### `ELEVENLABS_KRAMPUS_VOICE_ID`
```
Voice ID for xX_Krampus_Xx
Example: onwK4e9ZLuTAKqWW03F9
```

### `ELEVENLABS_ELF_VOICE_ID`
```
Voice ID for elfgirluwu
Example: EXAVITQu4vr4xnSDxMaL
```

### `ELEVENLABS_FROSTY_VOICE_ID`
```
Voice ID for FrostyTheCoder
Example: TxGEqnHWrfWFTfGW9XjX
```

### `ELEVENLABS_DASHER_VOICE_ID`
```
Voice ID for DasherSpeedrun
Example: VR6AewLTigWG4xSOukaG
```

### `ELEVENLABS_SCAMMER_VOICE_ID`
```
Voice ID for SantaKumar
Example: pqHfZKP75CvOlQylNhV4
```

### `ELEVENLABS_JINGBELLS_VOICE_ID`
```
Voice ID for JingBells叮噹鈴
Example: pNInz6obpgDQGcFmaJgB
```

### `ELEVENLABS_BARRY_VOICE_ID`
```
Voice ID for BarryJingle
Example: mQJemUdtNfAfUYHccHzZ
```

**Where to find:** ElevenLabs → Voices → Click voice → Copy Voice ID

---

## **5. BarryJingle Agent ID**

### `ELEVENLABS_BARRY_AGENT_ID`
```
Agent ID for BarryJingle conversational AI
Example: agent_9001kb09fjj7enh88s7w59m63172
```

**Where to find:** ElevenLabs → Conversational AI → BarryJingle → URL contains agent ID

---

## **How to Add in Vercel:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. For each variable:
   - **Key:** Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value:** Your actual value
   - **Environment:** Select all (Production, Preview, Development)
   - **Mark as Secret:** Enable for API keys
5. Click **Save**

---

## **After Adding Variables:**

1. Redeploy your project:
   - Go to **Deployments** tab
   - Click **...** on latest deployment
   - Click **Redeploy**

2. Or trigger new deployment:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

---

## **Testing:**

After deployment, test these features:
- ✅ Post a wish → Check if it saves to Supabase
- ✅ Tag a mod → Check if AI responds
- ✅ Voice message → Check if Whisper transcribes
- ✅ Voice call → Check if ElevenLabs works
- ✅ Barry popup → Check if auto-call works

---

## **Summary of Required Variables:**

**Must Have (11 variables):**
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `OPENAI_API_KEY`
5. `ANTHROPIC_API_KEY`
6. `ELEVENLABS_API_KEY`
7. `ELEVENLABS_SANTA_VOICE_ID`
8. `ELEVENLABS_KRAMPUS_VOICE_ID`
9. `ELEVENLABS_ELF_VOICE_ID`
10. `ELEVENLABS_BARRY_VOICE_ID`
11. `ELEVENLABS_BARRY_AGENT_ID`

**Optional (5 more voice IDs):**
- `ELEVENLABS_FROSTY_VOICE_ID`
- `ELEVENLABS_DASHER_VOICE_ID`
- `ELEVENLABS_SCAMMER_VOICE_ID`
- `ELEVENLABS_JINGBELLS_VOICE_ID`

---

## **Security Notes:**

🔒 **NEVER commit these to GitHub!**
🔒 **Mark all API keys as "Secret" in Vercel**
🔒 **NEXT_PUBLIC_* variables are exposed to browser (safe for Supabase URLs)**
🔒 **Service keys should NEVER have NEXT_PUBLIC_ prefix**
