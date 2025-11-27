import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * AI Router - Distributes tasks between OpenAI and Claude optimally
 */
export const aiRouter = {
  /**
   * Analyze meme/image content using GPT-4 Vision
   * Best for: Understanding memes, text in images, visual content
   * Cost: ~$0.01 per image
   */
  analyzeMemeWithOpenAI: async (imageUrl: string): Promise<string> => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this meme or image in detail. Include any text visible in the image, the overall theme, and the humor or message it conveys. Be concise but thorough.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low', // Use 'low' for cost efficiency, 'high' for detailed analysis
                },
              },
            ],
          },
        ],
      });

      return response.choices[0]?.message?.content || 'Unable to analyze image';
    } catch (error) {
      console.error('OpenAI Vision error:', error);
      return 'Image analysis unavailable';
    }
  },

  /**
   * Analyze meme/image content using Claude Vision
   * Best for: Nuanced understanding, cultural context
   * Cost: ~$0.005 per image (cheaper than OpenAI)
   */
  analyzeMemeWithClaude: async (imageUrl: string): Promise<string> => {
    try {
      // Fetch image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: 'Describe this meme or image in detail. Include any text visible in the image, the overall theme, and the humor or message it conveys. Be concise but thorough.',
              },
            ],
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      return textContent && 'text' in textContent ? textContent.text : 'Unable to analyze image';
    } catch (error) {
      console.error('Claude Vision error:', error);
      return 'Image analysis unavailable';
    }
  },

  /**
   * Smart meme analysis - uses best available API
   * Defaults to Claude (cheaper), falls back to OpenAI if needed
   */
  analyzeMeme: async (imageUrl: string, preferredAI: 'openai' | 'claude' = 'claude'): Promise<string> => {
    if (preferredAI === 'openai') {
      return aiRouter.analyzeMemeWithOpenAI(imageUrl);
    }
    return aiRouter.analyzeMemeWithClaude(imageUrl);
  },

  /**
   * Transcribe audio using OpenAI Whisper
   * Best for: Voice message transcription
   * Cost: $0.006 per minute
   */
  transcribeAudio: async (audioFile: File | Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', audioFile, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await openai.audio.transcriptions.create({
        file: audioFile as File,
        model: 'whisper-1',
        language: 'en', // Auto-detect if not specified
      });

      return response.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  },

  /**
   * Generate mod response using Claude (existing functionality)
   * Best for: Personality-driven responses, long context, creativity
   */
  generateModResponse: async (
    systemPrompt: string,
    wishContent: string,
    imageDescription?: string,
    audioTranscript?: string
  ): Promise<string> => {
    try {
      // Build context with all available information
      let fullContext = wishContent;

      if (audioTranscript) {
        fullContext = `[Voice Message]: ${audioTranscript}\n\n${fullContext}`;
      }

      if (imageDescription) {
        fullContext = `${fullContext}\n\n[Attached Image]: ${imageDescription}`;
      }

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: fullContext,
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === 'text');
      return textContent && 'text' in textContent ? textContent.text : 'Unable to generate response';
    } catch (error) {
      console.error('Claude response error:', error);
      throw new Error('Failed to generate AI response');
    }
  },

  /**
   * Parse @mentions from text
   * Returns array of mentioned persona IDs
   */
  parseMentions: (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.matchAll(mentionRegex);
    const mentions = Array.from(matches, (m) => m[1].toLowerCase());

    // Map common variations to persona IDs
    const personaMap: Record<string, string> = {
      santa: 'santa',
      santamod69: 'santa',
      grinch: 'grinch',
      elf: 'elf',
      snowman: 'snowman',
      frosty: 'snowman',
      reindeer: 'reindeer',
      rudolph: 'reindeer',
      scammer: 'scammer',
      jingbells: 'jingbells',
      jing: 'jingbells',
      叮噹鈴: 'jingbells',
      barry: 'barry',
      barryjingle: 'barry',
    };

    return [...new Set(mentions.map((m) => personaMap[m]).filter(Boolean))];
  },
};

export default aiRouter;
