import { API_BASE_URL, ENDPOINTS } from '../apiConfig';

export const askAI = async (prompt, type) => {
  try {
    const response = await fetch(ENDPOINTS.AI_ASK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI Error:', error);
    return {
      text: type === 'health'
        ? '⚠️ AI Assistant అందుబాటులో లేదు. దయచేసి తర్వాత ప్రయత్నించండి.'
        : '🤖 Education Assistant అందుబాటులో లేదు. దయచేసి తర్వాత ప్రయత్నించండి.',
      disclaimer: type === 'health' ? '⚠️ ఇది సమాచార మాత్రమే. వైద్య సలహా కోసం డాక్టర్‌ను సంప్రదించండి.' : null,
    };
  }
};
