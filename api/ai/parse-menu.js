import { executeAiTask } from './ai-key-manager.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { documentText, menuItemsText, venue, style, primaryColor, secondaryColor, phone, whatsapp, address, instagram } = req.body || {}

  const rawInput = (documentText || '') + '\n' + (menuItemsText || '')

  const defaultSample = {
    branding: {
      name: venue || 'Gourmet Bistro & Grill',
      style: style || 'fine_dining',
      primaryColor: primaryColor || '#7C3AED',
      secondaryColor: secondaryColor || '#FF2D8D',
      phone: phone || '+49 30 1234567',
      whatsapp: whatsapp || '+491701234567',
      address: address || 'Musterstraße 12, Berlin',
      instagram: instagram || '@scenvy_gourmet',
    },
    categories: [
      {
        id: 'cat_vorspeisen',
        name: { de: 'Vorspeisen & Antipasti', en: 'Starters & Antipasti' },
        icon: '🥗',
        items: [
          {
            id: 'item_1',
            name: { de: 'Trüffel Burrata', en: 'Truffle Burrata' },
            description: { de: 'Cremige Burrata auf wildem Rucola, getrockneten Kirschtomaten und frischem schwarzen Trüffel', en: 'Creamy burrata on wild arugula, sun-dried cherry tomatoes and fresh black truffle' },
            price: '14.50 €',
            variants: [
              { name: { de: 'Standard', en: 'Standard' }, price: '14.50 €' },
              { name: { de: 'mit 24 Monate Parma', en: 'with 24-Month Parma Ham' }, price: '18.90 €' }
            ],
            allergens: ['G'],
            diet: ['vegetarian'],
            highlight: true,
            imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb16655?w=600&auto=format&fit=crop'
          },
          {
            id: 'item_2',
            name: { de: 'Bruschetta Classica', en: 'Classic Bruschetta' },
            description: { de: 'Knuspriges Landbrot mit Würfeln von San-Marzano-Tomaten, Knoblauch und frischem Basilikum', en: 'Crispy sourdough bread topped with diced San Marzano tomatoes, garlic and fresh basil' },
            price: '8.90 €',
            variants: [],
            allergens: ['A'],
            diet: ['vegan', 'vegetarian'],
            highlight: false,
            imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop'
          }
        ]
      },
      {
        id: 'cat_hauptgerichte',
        name: { de: 'Hauptgerichte', en: 'Main Courses' },
        icon: '🍝',
        items: [
          {
            id: 'item_3',
            name: { de: 'Tagliolini al Tartufo', en: 'Truffle Tagliolini' },
            description: { de: 'Hausgemachte Eier-Pasta in cremiger Salbeibutter mit frisch geriebenem Sommer-Trüffel', en: 'Handmade egg pasta tossed in creamy sage butter and topped with freshly shaved summer truffle' },
            price: '21.00 €',
            variants: [
              { name: { de: 'S (Vorspeise)', en: 'S (Starter Portion)' }, price: '15.00 €' },
              { name: { de: 'L (Hauptgericht)', en: 'L (Main Portion)' }, price: '21.00 €' }
            ],
            allergens: ['A', 'C', 'G'],
            diet: ['vegetarian'],
            highlight: true,
            imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop'
          },
          {
            id: 'item_4',
            name: { de: 'Dry Aged Ribeye Steak', en: 'Dry-Aged Ribeye Steak' },
            description: { de: '300g Premium Steak gegrillt am Lavastein, serviert mit Trüffel-Fries und Kräuterbutter', en: '300g premium beef grilled over lava stone, served with truffle fries and herb butter' },
            price: '34.50 €',
            variants: [],
            allergens: ['G'],
            diet: [],
            highlight: true,
            imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop'
          }
        ]
      },
      {
        id: 'cat_desserts',
        name: { de: 'Dessert & Süßes', en: 'Desserts & Sweets' },
        icon: '🍰',
        items: [
          {
            id: 'item_5',
            name: { de: 'Tiramisu della Casa', en: 'Homemade Tiramisu' },
            description: { de: 'Klassisches Rezept nach Omas Art mit Savoiardi, Mascarpone, Espresso und dunklem Cacao', en: 'Classic Italian recipe with savoiardi, creamy mascarpone, espresso and dark cocoa' },
            price: '7.50 €',
            variants: [],
            allergens: ['A', 'C', 'G'],
            diet: ['vegetarian'],
            highlight: true,
            imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop'
          }
        ]
      }
    ],
    allergensLegend: {
      A: { de: 'Glutenhaltiges Getreide', en: 'Cereals containing gluten' },
      B: { de: 'Krebstiere', en: 'Crustaceans' },
      C: { de: 'Eier', en: 'Eggs' },
      D: { de: 'Fische', en: 'Fish' },
      G: { de: 'Milch & Laktose', en: 'Milk & Lactose' },
      H: { de: 'Schalenfrüchte / Nüsse', en: 'Nuts' },
      L: { de: 'Sellerie', en: 'Celery' },
      M: { de: 'Senf', en: 'Mustard' }
    }
  }

  if (!rawInput.trim()) {
    return res.status(200).json(defaultSample)
  }

  try {
    const prompt = `You are an expert AI Restaurant Menu Specialist for SCENVY.
Convert the following unstructured restaurant menu / document text into a structured JSON menu package.
Extract categories, dishes, descriptions, prices, variants, allergens (A, B, C, D, G, H, L, M), and diet tags (vegan, vegetarian, glutenfree, halal).
Translate dish titles and descriptions into BOTH German (de) and English (en).

Return strictly JSON matching this structure:
{
  "branding": {
    "name": "${venue || 'Restaurant'}",
    "style": "${style || 'modern'}",
    "primaryColor": "${primaryColor || '#7C3AED'}",
    "secondaryColor": "${secondaryColor || '#FF2D8D'}",
    "phone": "${phone || ''}",
    "whatsapp": "${whatsapp || ''}",
    "address": "${address || ''}",
    "instagram": "${instagram || ''}"
  },
  "categories": [
    {
      "id": "cat_1",
      "name": { "de": "Kategorie Name DE", "en": "Category Name EN" },
      "icon": "emoji",
      "items": [
        {
          "id": "item_1",
          "name": { "de": "Gericht DE", "en": "Dish EN" },
          "description": { "de": "Beschreibung DE", "en": "Description EN" },
          "price": "12.50 €",
          "variants": [
            { "name": { "de": "Klein", "en": "Small" }, "price": "9.50 €" }
          ],
          "allergens": ["A", "G"],
          "diet": ["vegan", "vegetarian"],
          "highlight": true,
          "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop"
        }
      ]
    }
  ],
  "allergensLegend": {
    "A": { "de": "Glutenhaltiges Getreide", "en": "Cereals containing gluten" },
    "G": { "de": "Milch & Laktose", "en": "Milk & Lactose" },
    "C": { "de": "Eier", "en": "Eggs" },
    "H": { "de": "Schalenfrüchte / Nüsse", "en": "Nuts" }
  }
}

Raw Menu Input Text:
"""
${rawInput.slice(0, 10000)}
"""`

    const parsed = await executeAiTask(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      })

      const raw = response.text || '{}'
      let jsonStr = raw
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) jsonStr = match[0]
      return JSON.parse(jsonStr)
    })

    if (!parsed || !parsed.categories || !Array.isArray(parsed.categories)) {
      return res.status(200).json(defaultSample)
    }

    // Enrich with default image URLs if missing
    const foodStock = [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop'
    ]

    let imgIdx = 0
    if (parsed.categories && Array.isArray(parsed.categories)) {
      parsed.categories.forEach(cat => {
        if (cat.items && Array.isArray(cat.items)) {
          cat.items.forEach(item => {
            if (!item.imageUrl) {
              item.imageUrl = foodStock[imgIdx % foodStock.length]
              imgIdx++
            }
          })
        }
      })
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('AI parse-menu error:', err)
    return res.status(200).json(defaultSample)
  }
}

