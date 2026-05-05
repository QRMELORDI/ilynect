const express = require('express');
const router = express.Router();
const db = require('../db/database');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

router.get('/', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let rawContent = await db.allAsync(`SELECT * FROM daily_content WHERE active_date = ?`, [today]);
    
    if (rawContent.length === 0) {
      console.log(`🤖 Generating AI content for ${today}...`);
      await generateDailyContentWithAI(today);
      rawContent = await db.allAsync(`SELECT * FROM daily_content WHERE active_date = ?`, [today]);
    }

    // Convert array to a flat object for easier consumption
    const content = {};
    rawContent.forEach(item => {
      content[item.type] = item.content;
    });

    // Special handling for health tips (split string back to array)
    if (content.health_tip) {
      content.tips = content.health_tip.split('. ').filter(t => t.trim() !== '');
    }
    
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function generateDailyContentWithAI(date) {
  const prompt = `Generate a JSON object with the following fields for a daily app. All Telugu content must be in Telugu script.
  1. fact: 1 amazing science fact (English)
  2. quiz: 1 brain teaser with answer in brackets (English)
  3. gk: 1 General Knowledge question (English)
  4. manchi_maata: 1 Telugu inspirational quote (Telugu)
  5. speciality: 1 unique fact about today's date ${date} (English)
  6. joke: 1 funny Telugu joke (Telugu)
  7. health_tips: A list of 5 health tips (Telugu)
  
  Return ONLY the raw JSON object.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const aiContent = JSON.parse(data.choices[0].message.content);

    const mappings = [
      { type: 'fact', content: aiContent.fact, lang: 'en' },
      { type: 'quiz', content: aiContent.quiz, lang: 'en' },
      { type: 'gk', content: aiContent.gk, lang: 'en' },
      { type: 'manchi_maata', content: aiContent.manchi_maata, lang: 'te' },
      { type: 'speciality', content: aiContent.speciality, lang: 'en' },
      { type: 'joke', content: aiContent.joke, lang: 'te' },
      { type: 'health_tip', content: aiContent.health_tips.join('. '), lang: 'te' }
    ];

    for (const item of mappings) {
      await db.runAsync(
        `INSERT INTO daily_content (type, content, language, active_date) VALUES (?, ?, ?, ?)`,
        [item.type, item.content, item.lang, date]
      );
    }
  } catch (err) {
    console.error("AI Generation Error:", err);
    // Fallback to static content if AI fails
  }
}

module.exports = router;
