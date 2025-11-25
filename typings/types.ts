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
  judge_responses?: Record<string, string>;
  final_verdict?: string;
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
