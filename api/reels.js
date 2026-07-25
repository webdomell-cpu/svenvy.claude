// api/reels.js — Vercel Serverless Function
// ⚠️  For production: replace in-memory storage with a real DB
//     e.g. Supabase, PlanetScale, or Vercel Postgres

let reels = [
  { id:"r1", title:"Happy Hour Special", type:"offer",   status:"live",  views:3241, ctr:18.4, loc:"Marina Walk", emoji:"🍹", cta:"Order Now"  },
  { id:"r2", title:"Weekend Brunch",     type:"event",   status:"live",  views:2108, ctr:24.1, loc:"JBR Terrace", emoji:"🥂", cta:"Reserve"    },
  { id:"r3", title:"Chef's Special",     type:"menu",    status:"live",  views:1872, ctr:15.7, loc:"DIFC Branch", emoji:"🍽️",cta:"View Menu"  },
  { id:"r4", title:"Ladies Night",       type:"event",   status:"draft", views:0,    ctr:0,    loc:"Marina Walk", emoji:"✨", cta:"RSVP"       },
]

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { status, location } = req.query
      let data = [...reels]
      if (status)   data = data.filter(r => r.status === status)
      if (location) data = data.filter(r => r.loc === location)
      return res.status(200).json({ success: true, data, total: data.length })
    }

    if (req.method === 'POST') {
      const { title, type, status, loc, emoji, cta } = req.body
      if (!title) return res.status(400).json({ success: false, error: 'title is required' })
      const newReel = {
        id:    'r' + Date.now(),
        title, type: type || 'offer',
        status: status || 'draft',
        views: 0, ctr: 0,
        loc:   loc   || 'Main Location',
        emoji: emoji || '🎬',
        cta:   cta   || 'Learn More',
        createdAt: new Date().toISOString()
      }
      reels.push(newReel)
      return res.status(201).json({ success: true, data: newReel })
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ success: false, error: 'id is required' })
      reels = reels.map(r => r.id === id ? { ...r, ...updates } : r)
      const updated = reels.find(r => r.id === id)
      return res.status(200).json({ success: true, data: updated })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ success: false, error: 'id is required' })
      reels = reels.filter(r => r.id !== id)
      return res.status(200).json({ success: true, message: 'Reel deleted' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })

  } catch (err) {
    console.error('Reels API error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
