import { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { message, history } = JSON.parse(event.body || '{}');

    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'GEMINI_API_KEY environment variable is required' })
      };
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

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error in chat function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process chat request' })
    };
  }
};
