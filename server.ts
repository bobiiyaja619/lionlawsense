import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is required' });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemInstruction = `You are Lion LawSense AI, a legal triage assistant in Singapore. 
Your goal is to help users understand their legal issues, identify the type of document they have uploaded (if any), and provide a structured summary.
Keep your responses professional, empathetic, and concise.
Always clarify that you are an AI assistant and not a lawyer, and that your advice does not constitute formal legal advice.

When a user describes an issue, respond with a helpful analysis.
If they mention tenancy, landlord, deposit, or rent, classify it as a tenancy dispute.
If they mention fine, parking, or notice, classify it as a fine notice.
If they mention demand, letter, or sue, classify it as a demand letter.

Return a JSON object with the following structure:
{
  "responseText": "Your conversational response to the user",
  "docType": "tenancy_agreement | fine_notice | demand_letter | other",
  "summary": {
    "caseType": "String",
    "urgency": "Low | Medium | High",
    "nextSteps": ["Step 1", "Step 2"],
    "missingInfo": ["Info 1", "Info 2"],
    "lawyerAdvisable": "String"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: message,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              responseText: { type: Type.STRING },
              docType: { type: Type.STRING },
              summary: {
                type: Type.OBJECT,
                properties: {
                  caseType: { type: Type.STRING },
                  urgency: { type: Type.STRING },
                  nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingInfo: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lawyerAdvisable: { type: Type.STRING }
                },
                required: ["caseType", "urgency", "nextSteps", "missingInfo", "lawyerAdvisable"]
              }
            },
            required: ["responseText", "docType", "summary"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response text from Gemini");
      }

      const result = JSON.parse(resultText);
      res.json(result);

    } catch (error) {
      console.error('Error in /api/chat:', error);
      res.status(500).json({ error: 'Failed to process chat request' });
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
