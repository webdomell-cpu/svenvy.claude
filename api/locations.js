// api/locations.js — Vercel Serverless Function
// ⚠️  For production: replace with real DB (Supabase, etc.)

let locations = [
  { id:"l1", name:"Marina Walk",      city:"Dubai Marina", scans:1247, watchRate:94, active:true,  qrUrl:"https://app.scenvy.de/l/l1", createdAt:"2025-11-01" },
  { id:"l2", name:"JBR Terrace",      city:"JBR Beach",    scans:893,  watchRate:78, active:true,  qrUrl:"https://app.scenvy.de/l/l2", createdAt:"2025-11-15" },
  { id:"l3", name:"DIFC Branch",      city:"DIFC",         scans:614,  watchRate:88, active:true,  qrUrl:"https://app.scenvy.de/l/l3", createdAt:"2025-12-01" },
  { id:"l4", name:"Mall of Emirates", city:"Al Barsha",    scans:329,  watchRate:61, active:false, qrUrl:"https://app.scenvy.de/l/l4", createdAt:"2026-01-10" },
]

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    if (req.method === 'GET') {
      const { active } = req.query
      let data = [...locations]
      if (active !== undefined) data = data.filter(l => l.active === (active === 'true'))
      return res.status(200).json({ success: true, data, total: data.length })
    }

    if (req.method === 'POST') {
      const { name, city } = req.body
      if (!name) return res.status(400).json({ success: false, error: 'name is required' })
      const id = 'l' + Date.now()
      const newLoc = {
        id, name, city: city || 'Dubai',
        scans: 0, watchRate: 0, active: true,
        qrUrl: `https://app.scenvy.de/l/${id}`,
        createdAt: new Date().toISOString()
      }
      locations.push(newLoc)
      return res.status(201).json({ success: true, data: newLoc })
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ success: false, error: 'id is required' })
      locations = locations.map(l => l.id === id ? { ...l, ...updates } : l)
      return res.status(200).json({ success: true, data: locations.find(l => l.id === id) })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ success: false, error: 'id is required' })
      locations = locations.filter(l => l.id !== id)
      return res.status(200).json({ success: true, message: 'Location deleted' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })

  } catch (err) {
    console.error('Locations API error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
