import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
  });

  // API Route for Gemini Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is required' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemInstruction = `You are Lion LawSense AI, a professional legal intake assistant in Singapore. 
Your goal is to interview the user, collect facts about their legal issue, and build a structured case summary progressively.
Keep your responses professional, empathetic, and concise.
Always clarify that you are an AI assistant and not a lawyer, and that your advice does not constitute formal legal advice.

CRITICAL INSTRUCTIONS:
1. STATEFULNESS: Track the user's answers. Do NOT repeat questions that have already been answered. Only ask for missing information.
2. STEP-BY-STEP LOGIC & ISSUE FLOWS: Ask ONLY ONE relevant follow-up question at a time based on the case type.
   - ACCIDENT / LIABILITY: 1) What happened/who is the other party? 2) Injuries or physical damage? 3) Police/insurance report or written notice? 4) Evidence (photos, dashcam, witnesses)? 5) Desired outcome (claim, defend)?
   - TENANCY: 1) Is there a tenancy agreement? 2) What is the dispute about? 3) Did landlord/tenant respond in writing? 4) Receipts/messages/photos exist? 5) Is there a deadline?
   - EMPLOYMENT: 1) Are you employee or employer? 2) What happened? 3) Contract/payslips/written notices exist? 4) Deadline or non-payment ongoing?
   - SME / CONTRACT: 1) Who is the other party? 2) Is there a signed agreement? 3) Type of breach/dispute? 4) Documents existing? 5) Desired outcome?
   - OTHER: Follow a general flow: 1) What happened? 2) Evidence/documents? 3) Desired outcome?
3. HUMAN-LIKE RESPONSES: Acknowledge what the user just said before asking the next question. Avoid robotic repetition. Do not sound overly legalistic too early.
   - Example: "Understood — this sounds like a possible road traffic liability issue involving a PHV driver cutting into your lane. Were there any injuries or visible damage to the vehicles?"
4. FALLBACK LOGIC: If the user gives a vague answer (e.g., "he hit me"), ask a narrower clarification question instead of repeating a broad question.
5. COMPLETION: After gathering enough information (around 3 to 5 strong answers covering the steps above), STOP asking questions.
   - Set "isComplete" to true.
   - Respond with a completion message like: "Thanks — I have enough information to prepare your preliminary intake summary. I’m now organizing the case details for review."
6. DYNAMIC SUMMARY: Update the summary fields dynamically based on the actual answers provided. Do not leave the summary generic if specific facts are known.
   - Set "readinessScore" based on how much info is collected (e.g., 20% initially, 100% when complete).
   - Set "status" to "In Progress" while collecting, and "Ready for Review" or "Complete" when done.`;

      const contents = [
        ...history.map((msg: any) => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text || (msg.file ? `Uploaded file: ${msg.file.name}` : '') }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: { type: Type.STRING },
              docType: { type: Type.STRING },
              isComplete: { type: Type.BOOLEAN },
              summary: {
                type: Type.OBJECT,
                properties: {
                  caseType: { type: Type.STRING },
                  urgency: { type: Type.STRING },
                  status: { type: Type.STRING },
                  factsCollected: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { fact: { type: Type.STRING }, source: { type: Type.STRING } } } },
                  timelineEvents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, event: { type: Type.STRING }, significance: { type: Type.STRING } } } },
                  documentsUploaded: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingDocuments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedActions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, reason: { type: Type.STRING } } } },
                  readinessScore: { type: Type.INTEGER },
                  missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lawyerAdvisable: { type: Type.STRING }
                },
              }
            },
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response text from Gemini");
      }

      // Extract JSON block if wrapped in markdown
      let cleanJsonText = resultText.trim();
      const jsonMatch = cleanJsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanJsonText = jsonMatch[1].trim();
      }
      const result = JSON.parse(cleanJsonText);
      res.json(result);

    } catch (error: any) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({ error: 'Failed to process chat request', details: error.message || String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
