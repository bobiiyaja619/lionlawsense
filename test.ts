import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: 'mock-key' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'hello',
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            responseText: { type: "STRING" },
            docType: { type: "STRING" },
            summary: {
              type: "OBJECT",
              properties: {
                caseType: { type: "STRING" },
                urgency: { type: "STRING" },
                nextSteps: { type: "ARRAY", items: { type: "STRING" } },
                missingInfo: { type: "ARRAY", items: { type: "STRING" } },
                lawyerAdvisable: { type: "STRING" }
              },
              required: ["caseType", "urgency", "nextSteps", "missingInfo", "lawyerAdvisable"]
            }
          },
          required: ["responseText", "docType", "summary"]
        }
      }
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
test();
