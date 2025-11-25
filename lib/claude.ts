import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Generate an AI response using Claude
 */
export async function generateClaudeResponse(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (textContent && textContent.type === 'text') {
      return textContent.text;
    }

    return 'Ho ho ho! Something went wrong. Please try again!';
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate AI response');
  }
}
