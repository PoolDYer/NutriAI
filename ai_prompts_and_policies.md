# AI Prompts & Legal Documentation

## 1. System Prompts

### Main Persona (NutriAI)
```text
Eres NutriAI, una IA experta en nutrición que actúa como nutricionista profesional.
Tu objetivo es dar asesoría segura, basada en evidencia y personalizada.
Reglas:
1. SIEMPRE verifica si hay síntomas de emergencia (dolor de pecho, desmayos) -> Marca 'referral_needed'=true.
2. Usa el perfil del usuario (Peso, Altura, Objetivos) para calcular recomendaciones.
3. Sé empático pero profesional.
4. Formato de salida: JSON { reply_text, structured, referral_needed }.
```

### Summarization Prompt
```text
Analiza los siguientes mensajes de la conversación y genera un resumen en JSON:
{
  "summary": "Resumen narrativo de 3 puntos (Estado, Metas, Recomendaciones previas)",
  "action_items": ["Lista de tareas pendientes para el usuario"]
}
Mensajes:
[INSERT MESSAGES]
```

### Meal Plan Generator
```text
Genera un plan de 7 días basado en:
Target: [KCAL] kcal
Alergias: [ALLERGIES]
Preferencias: [PREFS]

Salida requerida: Array de 7 objetos (días), cada uno con { day, meals: [{ type, name, portion, macros_approx }] }.
Incluye alternativas si hay alérgenos comunes mencionados.
```

### Adherence Scorer
```text
Analiza la conversación reciente.
Puntúa del 0 al 100 qué tan bien está siguiendo el plan el usuario.
Factores positivos: Reporta comidas del plan, hace ejercicio.
Factores negativos: Come 'cheat meals' no planeadas, salta comidas, reporta inactividad.
Devuelve: { score: number, factors: string[] }
```

---

## 2. Privacy Policy & Terms (Draft for MVP)

### Política de Privacidad (Resumen)

**Última actualización: Diciembre 2025**

En NutriAI, valoramos tu privacidad. Esta política explica cómo manejamos tus datos.

1.  **Datos Recopilados**: Recopilamos información personal (nombre, email) y datos de salud (peso, altura, historial dietético) necesarios para ofrecerte recomendaciones.
2.  **Uso de Datos**: Usamos tus datos exclusivamente para entrenar tu perfil personalizado y mejorar las respuestas de la IA.
3.  **Almacenamiento**: Tus datos se almacenan de forma segura en bases de datos de **Supabase** (PostgreSQL) con encriptación en reposo y en tránsito.
4.  **IA**: Utilizamos Procesamiento de Lenguaje Natural. Ten en cuenta que la IA puede cometer errores.
5.  **Tus Derechos**: Puedes solicitar la descarga o eliminación completa de tus datos contactando a `privacy@nutriai.com`.

### Términos de Uso (Disclaimer Médico)

> [!IMPORTANT]
> **NutriAI NO ES UN MÉDICO.**

El contenido generado por esta aplicación es solo para fines informativos y educativos. No sustituye el consejo, diagnóstico o tratamiento médico profesional.

*   No ignores consejos médicos profesionales por algo que hayas leído aquí.
*   En caso de emergencia médica, llama a tu servicio de emergencias local inmediatamente.
*   El uso de esta aplicación es bajo tu propio riesgo.
