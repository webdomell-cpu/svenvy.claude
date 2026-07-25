import { GoogleGenAI } from '@google/genai'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { venue, offer, type, tone } = req.body
  if (!offer) return res.status(400).json({ error: 'offer is required' })

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    // Graceful fallback when no key is set yet
    const moodMap = { offer: 'purple', event: 'pink', menu: 'blue', promo: 'orange' }
    return res.status(200).json({
      hook: 'JETZT ENTDECKEN 🔥',
      headline: offer.length > 50 ? offer.slice(0, 50) + '…' : offer,
      subtext: `Exklusiv bei ${venue || 'deinem Venue'} — nicht verpassen!`,
      cta: 'Jetzt sichern',
      hashtags: ['scenvy', type || 'offer', 'venue'],
      emoji: type === 'event' ? '🎉' : type === 'menu' ? '🍽️' : '🍹',
      urgency: 'Nur für begrenzte Zeit',
      colorMood: moodMap[type] || 'purple',
      imageUrl: null,
      _note: 'GEMINI_API_KEY in environment variables required for live AI text & image generation'
    })
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })

    // 1. Generate text copy using Gemini 3.6 Flash
    const textPrompt = `You are the creative director for SCENVY, a TikTok-style reel platform for hospitality venues.

Create a reel content package for:
- Venue: ${venue || 'the venue'}
- Message/Offer: ${offer}
- Type: ${type || 'offer'}
- Tone: ${tone || 'exciting'}

Reply ONLY with compact valid JSON:
{
  "hook": "ATTENTION MAX 6 WORDS ALL CAPS",
  "headline": "compelling main message max 8 words",
  "subtext": "one short supporting sentence",
  "cta": "2-3 word button text",
  "hashtags": ["tag1", "tag2", "tag3"],
  "emoji": "single emoji",
  "urgency": "short scarcity line or empty string",
  "colorMood": "purple|pink|blue|orange|green",
  "imagePrompt": "English prompt describing a photorealistic, atmospheric vertical portrait photo for this venue offer"
}`

    const textRes = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: textPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    })

    const rawText = textRes.text || '{}'
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim())

    // 2. Generate custom AI Image using Gemini Image generation (Nano Banana series)
    let imageUrl = null
    try {
      const imgPrompt = parsed.imagePrompt || `Atmospheric vertical portrait photo of ${venue || 'a luxury venue'}, ${offer}, high end hospitality photography`
      const imgRes = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            { text: `${imgPrompt}, vertical 9:16 aspect ratio, vibrant colors, cinematic lighting` }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: '9:16'
          }
        }
      })

      const parts = imgRes.candidates?.[0]?.content?.parts || []
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png'
          imageUrl = `data:${mime};base64,${part.inlineData.data}`
          break
        }
      }
    } catch (imgErr) {
      console.warn('Gemini image generation warning:', imgErr)
    }

    return res.status(200).json({
      hook: parsed.hook || 'JETZT ENTDECKEN 🔥',
      headline: parsed.headline || offer,
      subtext: parsed.subtext || `Exklusiv bei ${venue || 'deinem Venue'}.`,
      cta: parsed.cta || 'Jetzt sichern',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['scenvy', 'dubai'],
      emoji: parsed.emoji || '✨',
      urgency: parsed.urgency || '',
      colorMood: parsed.colorMood || 'purple',
      imageUrl
    })
  } catch (err) {
    console.error('Gemini AI generate error:', err)
    return res.status(200).json({
      hook: 'JETZT ENTDECKEN 🔥',
      headline: offer,
      subtext: `Exklusiv bei ${venue || 'deinem Venue'}.`,
      cta: 'Jetzt sichern',
      hashtags: ['scenvy', 'dubai'],
      emoji: '✨',
      urgency: '',
      colorMood: 'purple',
      imageUrl: null
    })
  }
}
