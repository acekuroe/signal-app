export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];
    
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
