const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { randomUUID } = require('crypto');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

router.get('/daily', async (req, res) => {
  try {
    const { type } = req.query; // 'education' or 'health'
    const today = new Date().toISOString().split('T')[0];
    
    let content = await db.getAsync(
      'SELECT * FROM daily_content WHERE type = ? AND active_date = ?', [type, today]
    );
    
    if (!content) {
      const seeded = await fetchContentFromGroq(type);
      await db.runAsync(
        'INSERT OR REPLACE INTO daily_content (id, type, content_json, active_date) VALUES (?, ?, ?, ?)', 
        [randomUUID(), type, JSON.stringify(seeded), today]
      );
      content = await db.getAsync(
        'SELECT * FROM daily_content WHERE type = ? AND active_date = ?', [type, today]
      );
    }
    
    res.json(JSON.parse(content.content_json));
  } catch (err) { 
    console.error('Daily content error:', err);
    // Return fallback content instead of error
    if (req.query.type === 'health') {
      res.json(getHealthFallback());
    } else {
      res.json(getEducationFallback());
    }
  }
});

async function fetchContentFromGroq(type) {
  if (type === 'health') {
    return await fetchHealthContent();
  }
  return await fetchEducationContent();
}

async function fetchEducationContent() {
  const prompt = `You are a Telugu educational content generator. Generate daily educational content for a Telugu-speaking audience.
Return ONLY a valid JSON object (no markdown, no intro text) with these exact keys:
{
  "fact": "One amazing science/world fact in Telugu script",
  "quiz": "A brain teaser quiz question in Telugu with answer in parentheses at the end",
  "gk": "One General Knowledge question with answer in Telugu",
  "manchi_maata": "A beautiful motivational quote in Telugu script",
  "speciality": "What is special about today in Telugu",
  "joke": "A funny joke in Telugu script",
  "idiom": "A Telugu idiom (సామెత) with its meaning explained in Telugu",
  "brain_puzzle": "A brain sharpening logical puzzle in Telugu with the answer in parentheses",
  "math_puzzle": "A math numerical puzzle like '25 × 4 + 13 = ?' with the answer in parentheses. Use Telugu script for the question text but keep numbers in digits"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      })
    });

    const data = await response.json();
    let text = data.choices[0].message.content.trim();
    
    // Clean up markdown formatting
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    // Find first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      text = text.substring(start, end + 1);
    }

    const parsed = JSON.parse(text);
    // Ensure all fields exist
    return {
      fact: parsed.fact || "భూమి సూర్యుని చుట్టూ 107,000 కి.మీ/గం వేగంతో తిరుగుతుంది.",
      quiz: parsed.quiz || "రెక్కలు లేకుండా ఎగిరేది ఏమిటి? (సమయం)",
      gk: parsed.gk || "భారతదేశ అతిపెద్ద రాష్ట్రం ఏది? (రాజస్థాన్)",
      manchi_maata: parsed.manchi_maata || "కష్టపడితే ఫలితం తప్పక వస్తుంది.",
      speciality: parsed.speciality || "ప్రతి రోజు ఒక కొత్త అవకాశం.",
      joke: parsed.joke || "టీచర్: నువ్వు పెద్దయ్యాక ఏం అవుతావు? స్టూడెంట్: పెద్దవాడిని అవుతాను సార్!",
      idiom: parsed.idiom || "అడగనిదే అమ్మైనా పెట్టదు - అడగకుండా ఎవరూ సహాయం చేయరు అనే అర్థం.",
      brain_puzzle: parsed.brain_puzzle || "ఒక గదిలో 3 స్విచ్‌లు ఉన్నాయి. పైన ఒక బల్బ్ ఉంది. మీరు ఒక్కసారి మాత్రమే పైకి వెళ్ళగలరు. సరైన స్విచ్ ఎలా కనుగొంటారు? (ఒక స్విచ్ 10 నిమిషాలు ఆన్ చేసి ఆఫ్ చేయండి, రెండో స్విచ్ ఆన్ ఉంచండి, పైకి వెళ్ళండి - వేడిగా ఉంటే మొదటిది, వెలుగుతుంటే రెండవది)",
      math_puzzle: parsed.math_puzzle || "ఈ లెక్కను సాల్వ్ చేయండి: 15 × 3 + 27 - 12 = ? (సమాధానం: 60)"
    };
  } catch (err) {
    console.error('Groq Education Error:', err);
    return getEducationFallback();
  }
}

async function fetchHealthContent() {
  const prompt = `Generate 7 unique health tips in Telugu script. Each tip should be practical and useful for daily life.
Return ONLY a valid JSON array of 7 strings in Telugu. No markdown, no intro text. Example format:
["tip1 in Telugu", "tip2 in Telugu", ...]`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      })
    });

    const data = await response.json();
    let text = data.choices[0].message.content.trim();
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      text = text.substring(start, end + 1);
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return getHealthFallback();
  } catch (err) {
    console.error('Groq Health Error:', err);
    return getHealthFallback();
  }
}

function getEducationFallback() {
  return {
    fact: "మానవ మెదడు రోజుకు 70,000 ఆలోచనలు చేస్తుంది.",
    quiz: "నీళ్ళు లేకుండా బతికే చెట్టు ఏది? (క్రిస్మస్ ట్రీ - ప్లాస్టిక్ వాటిని!)",
    gk: "భారతదేశంలో అతిపెద్ద నది ఏది? (గంగా నది)",
    manchi_maata: "విజయం అనేది ప్రయత్నం చేసే వారికి మాత్రమే లభిస్తుంది.",
    speciality: "ప్రతి రోజూ నేర్చుకోవడానికి ఒక కొత్త అవకాశం!",
    joke: "డాక్టర్: మీకు ఏం సమస్య? రోగి: నాకు జ్ఞాపకశక్తి తగ్గిపోతోంది. డాక్టర్: ఎప్పటి నుండి? రోగి: ఏమిటి నుండి?",
    idiom: "అడిగేవాడికి చెప్పేవాడు లోకువ - అడిగే ధైర్యం ఉన్నవాడి ముందు చెప్పేవాడు తక్కువ అవుతాడు.",
    brain_puzzle: "ఒక రైతు దగ్గర 17 గొర్రెలు ఉన్నాయి. 9 తప్ప అన్నీ చనిపోయాయి. ఎన్ని బ్రతికి ఉన్నాయి? (9 గొర్రెలు)",
    math_puzzle: "ఈ లెక్కను సాల్వ్ చేయండి: 8 × 7 + 14 ÷ 2 = ? (సమాధానం: 63)"
  };
}

function getHealthFallback() {
  return [
    "💧 రోజూ కనీసం 8-10 గ్లాసుల నీళ్లు తాగండి. శరీరంలో నీటి శాతం తగ్గకుండా చూసుకోండి.",
    "🏃 ప్రతిరోజూ కనీసం 30 నిమిషాలు నడకకు వెళ్ళండి. ఇది గుండె ఆరోగ్యానికి చాలా మంచిది.",
    "🍎 ఉదయం ఖాళీ కడుపుతో పండ్లు తినడం వల్ల పోషకాలు బాగా శోషించబడతాయి.",
    "😴 రాత్రి 7-8 గంటల నిద్ర తప్పనిసరి. నిద్ర లేమి అనేక వ్యాధులకు కారణం.",
    "🧘 ధ్యానం మరియు ప్రాణాయామం మానసిక ఒత్తిడిని తగ్గిస్తాయి. రోజూ 10 నిమిషాలు చేయండి.",
    "🥗 భోజనంలో ఆకుపచ్చ కూరగాయలు ఎక్కువగా తీసుకోండి. వాటిలో విటమిన్లు, ఖనిజాలు ఎక్కువ.",
    "☀️ ఉదయం 15 నిమిషాలు ఎండలో నిలబడితే విటమిన్ D లభిస్తుంది."
  ];
}

module.exports = router;
