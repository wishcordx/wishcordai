export interface JudgeResponse {
  judge: Persona;
  response: string;
  verdict: 'GRANTED' | 'DENIED' | 'COAL' | 'PENDING';
}

export interface Wish {
  id: string;
  wallet_address: string;
  username?: string;
  avatar?: string;
  wish_text: string;
  persona: string;
  ai_reply: string | null;
  ai_status?: 'pending' | 'completed' | 'failed' | null;
  ai_audio_url?: string;
  ai_audio_path?: string;
  judge_responses?: Record<string, string>;
  final_verdict?: string;
  image_url?: string;
  image_path?: string;
  audio_url?: string;
  audio_path?: string;
  mentioned_personas?: string[];
  created_at: string;
}

export type Persona = 'santa' | 'grinch' | 'elf' | 'snowman' | 'reindeer' | 'scammer' | 'jingbells';

export interface PersonaConfig {
  name: string;
  emoji: string;
  systemPrompt: string;
  buttonColor: string;
}

export interface WishSubmitPayload {
  wishText: string;
  persona: Persona;
  walletAddress?: string;
  username?: string;
  avatar?: string;
  imageUrl?: string;
  imagePath?: string;
  audioUrl?: string;
  audioPath?: string;
  mentionedPersonas?: string[];
}

export interface WishResponse {
  success: boolean;
  wish?: Wish;
  error?: string;
}

export interface WishesResponse {
  success: boolean;
  wishes?: Wish[];
  error?: string;
}
