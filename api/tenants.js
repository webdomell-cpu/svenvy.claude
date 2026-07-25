// api/tenants.js — Vercel Serverless Function
// ⚠️  For production: use a real DB + auth middleware

let tenants = [
  { id:"t1", name:"The Marina Group",  plan:"enterprise", locs:4,  reels:28, mrr:299, status:"active", since:"2025-11", email:"marina@scenvy.de"  },
  { id:"t2", name:"Rooftop Bar 21",    plan:"pro",        locs:1,  reels:12, mrr:79,  status:"active", since:"2025-12", email:"rooftop@scenvy.de" },
  { id:"t3", name:"Souk Street Food",  plan:"pro",        locs:3,  reels:19, mrr:79,  status:"active", since:"2026-01", email:"souk@scenvy.de"    },
  { id:"t4", name:"DIFC Lounge & Co.", plan:"starter",    locs:1,  reels:4,  mrr:0,   status:"trial",  since:"2026-06", email:"difc@scenvy.de"    },
  { id:"t5", name:"The Palm Events",   plan:"enterprise", locs:6,  reels:41, mrr:299, status:"active", since:"2025-10", email:"palm@scenvy.de"    },
]

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // 🔐 In production: verify admin JWT here
  // const token = req.headers.authorization?.split(' ')[1]
  // if (!verifyAdminToken(token)) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (req.method === 'GET') {
      const summary = {
        total:      tenants.length,
        active:     tenants.filter(t => t.status === 'active').length,
        trial:      tenants.filter(t => t.status === 'trial').length,
        mrr:        tenants.reduce((s, t) => s + t.mrr, 0),
        enterprise: tenants.filter(t => t.plan === 'enterprise').length,
        pro:        tenants.filter(t => t.plan === 'pro').length,
        starter:    tenants.filter(t => t.plan === 'starter').length,
      }
      return res.status(200).json({ success: true, data: tenants, summary })
    }

    if (req.method === 'POST') {
      const { name, email, plan } = req.body
      if (!name || !email) return res.status(400).json({ success: false, error: 'name and email required' })
      const newTenant = {
        id:     't' + Date.now(),
        name, email,
        plan:   plan || 'starter',
        locs:   0, reels: 0,
        mrr:    plan === 'pro' ? 79 : plan === 'enterprise' ? 299 : 0,
        status: 'trial',
        since:  new Date().toISOString().slice(0, 7)
      }
      tenants.push(newTenant)
      return res.status(201).json({ success: true, data: newTenant })
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ success: false, error: 'id required' })
      tenants = tenants.map(t => t.id === id ? { ...t, ...updates } : t)
      return res.status(200).json({ success: true, data: tenants.find(t => t.id === id) })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ success: false, error: 'id required' })
      tenants = tenants.filter(t => t.id !== id)
      return res.status(200).json({ success: true, message: 'Tenant deleted' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })

  } catch (err) {
    console.error('Tenants API error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
