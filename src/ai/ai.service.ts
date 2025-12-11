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
  private readonly apiKey = 'AIzaSyCFV73GS4A0ZPd409zv_ny-iBvyeOD5_4s';
  private readonly modelName = 'gemini-2.5-flash';

  constructor(private supabase: SupabaseClient) { }

  async generateResponse(
    userId: string,
    conversationId: string,
    userMessage: string
  ): Promise<AIResponse> {

    // 1. Fetch Context (Optional refinement: get history here if desired)
    // For now, we'll send the user message directly to the LLM with a system prompt.

    // 2. Call Gemini API
    const replyText = await this.callLLMProvider(userMessage, userId);

    // 3. Save Assistant Message To DB
    await this.saveMessage(conversationId, 'assistant', replyText);

    return {
      reply_text: replyText
    };
  }

  private async callLLMProvider(userMessage: string, userId: string): Promise<string> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{
                text: `System: Eres NutriAI, un asistente nutricionista experto, empático y profesional.
Tus respuestas deben ser SIEMPRE en español.
Tu objetivo es proporcionar guías de nutrición detalladas, precisas y personalizadas.
Cuando un usuario haga una consulta, no des respuestas genéricas. Analiza su solicitud y proporciona:
1. Explicación clara del concepto.
2. Recomendaciones específicas de alimentos o hábitos.
3. Si es apropiado, un ejemplo de menú o plan breve.
4. Advertencias relevantes (ej. alergias, condiciones médicas).
Mantén un tono motivador pero basado en ciencia.

User: ${userMessage}`
              }]
            }
          ]
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
    throw new Error('No system user found to send format AI messages.');
  }

  private async saveMessage(convId: string, role: string, content: string) {
    // For assistant messages, we need a sender_id. We'll use a system user.
    // In a real app, 'system' might be a special UUID constant seeded in DB.
    const senderId = await this.getSystemUserId();

    await this.supabase.from('messages').insert({
      conversation_id: convId,
      content,
      sender_id: senderId,
      metadata: { role } // Store role in metadata for UI if needed
    });
  }
}
