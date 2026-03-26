import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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
1. Ask ONLY ONE relevant follow-up question at a time to clarify the situation.
2. If the user writes something unclear, ask for clarification (e.g., "I need a bit more context to classify this matter accurately. Who is the other party involved, and what happened?"). Do NOT return a generic error.
3. As you collect more information, update the summary fields.
4. If you have enough information to form a complete initial intake (usually after 3-4 turns), set "isComplete" to true.

Return a JSON object with the following structure:
{
  "responseText": "Your conversational response to the user, including your next question",
  "docType": "tenancy_agreement | fine_notice | demand_letter | court_notice | contract | other",
  "isComplete": boolean,
  "summary": {
    "caseType": "String (e.g., Tenancy Dispute, Uncategorized)",
    "urgency": "Unknown | Low | Medium | High | Critical",
    "status": "Incomplete | Collecting Facts | Structured | Ready for Review",
    "factsCollected": [{"fact": "String", "source": "User-stated | From uploaded document | Awaiting verification"}],
    "timelineEvents": [{"date": "String", "event": "String", "significance": "String"}],
    "documentsUploaded": ["String"],
    "missingDocuments": ["String"],
    "recommendedActions": [{"title": "String", "reason": "String"}],
    "readinessScore": number (0-100),
    "missingInfo": ["String"],
    "lawyerAdvisable": "String"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [systemInstruction, ...history.map((msg: any) => ({
          role: msg.role === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text || (msg.file ? `Uploaded file: ${msg.file.name}` : '') }]
        })), { role: 'user', parts: [{ text: message }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: "OBJECT",
            properties: {
              responseText: { type: "STRING" },
              docType: { type: "STRING" },
              isComplete: { type: "BOOLEAN" },
              summary: {
                type: "OBJECT",
                properties: {
                  caseType: { type: "STRING" },
                  urgency: { type: "STRING" },
                  status: { type: "STRING" },
                  factsCollected: { type: "ARRAY", items: { type: "OBJECT", properties: { fact: { type: "STRING" }, source: { type: "STRING" } } } },
                  timelineEvents: { type: "ARRAY", items: { type: "OBJECT", properties: { date: { type: "STRING" }, event: { type: "STRING" }, significance: { type: "STRING" } } } },
                  documentsUploaded: { type: "ARRAY", items: { type: "STRING" } },
                  missingDocuments: { type: "ARRAY", items: { type: "STRING" } },
                  recommendedActions: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, reason: { type: "STRING" } } } },
                  readinessScore: { type: "INTEGER" },
                  missingInfo: { type: "ARRAY", items: { type: "STRING" } },
                  lawyerAdvisable: { type: "STRING" }
                },
                required: ["caseType", "urgency", "status", "factsCollected", "timelineEvents", "documentsUploaded", "missingDocuments", "recommendedActions", "readinessScore", "missingInfo", "lawyerAdvisable"]
              }
            },
            required: ["responseText", "docType", "isComplete", "summary"]
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
