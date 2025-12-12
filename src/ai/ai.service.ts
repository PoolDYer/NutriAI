import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

// Interfaces for structured response
export interface AIResponse {
  reply_text: string;
  structured?: {
    kcal_approx?: number;
    macros?: { p: number; c: number; f: number };
    recommendations?: string[];
  };
  referral_needed?: boolean;
}

@Injectable()
export class AiService {
  private readonly apiKey = 'AIzaSyDDaqJhagrbOb33Y4K4CN0I81rUCLU-m3E';
  private readonly modelName = 'gemini-2.5-flash';

  constructor(private supabase: SupabaseClient) { }

  async generateResponse(
    userId: string,
    conversationId: string,
    userMessage: string
  ): Promise<AIResponse> {

    // 1. Recover History (Short-term memory)
    // Fetch last 10 messages, ordered newest to oldest
    const { data: historyData, error: historyError } = await this.supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('Error retrieving history:', historyError);
    }

    // 2. Format for Gemini (Oldest -> Newest)
    const pastMessages = (historyData || []).reverse().map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // 3. Ensure consistency:
    // If the controller already saved the new message, it should be in 'pastMessages' (at the end).
    // Logic: check the last message. If it matches 'userMessage', we are good.
    // If not (fetched before insert?? or weird race), append it.
    const lastMsg = pastMessages[pastMessages.length - 1];
    const isUserMsgMissing = !lastMsg || lastMsg.role !== 'user' || lastMsg.parts[0].text !== userMessage;

    if (isUserMsgMissing && userMessage) {
      pastMessages.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    // 4. System Instruction
    const systemInstruction = {
      parts: [{ text: "Eres NutriAI, un experto en nutrición que usa ingredientes locales y accesibles. Responde de forma amable y profesional. Tus respuestas deben ser SIEMPRE en español. Proporciona guías detalladas, recomendaciones y menús si es necesario." }]
    };

    // 5. Call Gemini with Context
    const replyText = await this.callLLMProvider(pastMessages, systemInstruction);

    // 6. Save Assistant Response
    await this.saveMessage(conversationId, 'assistant', replyText);

    return {
      reply_text: replyText
    };
  }

  private async callLLMProvider(contents: any[], systemInstruction: any): Promise<string> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: systemInstruction
        })
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Gemini API Error:', err);
        return "Lo siento, tuve problemas para conectar con mi cerebro de IA (Gemini) en este momento.";
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";
    } catch (error) {
      console.error('Gemini Network Error:', error);
      return "Error de conexión con el servicio de IA.";
    }
  }

  private async getSystemUserId(): Promise<string> {
    // Try to find a user with role 'admin' or 'nutritionist' to act as the AI
    // Or finds ANY user to act as system if none specific exists
    const { data } = await this.supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (data) return data.id;
    // Fallback: This shouldn't happen if users exist.
    console.warn('No system user found. Using null sender (might fail constraint).');
    return null;
  }

  private async saveMessage(convId: string, role: string, content: string) {
    const senderId = await this.getSystemUserId();

    await this.supabase.from('messages').insert({
      conversation_id: convId,
      content,
      sender_id: senderId,
      metadata: { role }
    });
  }
}
