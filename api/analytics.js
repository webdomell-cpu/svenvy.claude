// api/analytics.js — Vercel Serverless Function

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // 📊 In production: query your DB (Supabase, Postgres, etc.)
  // SELECT date, COUNT(*) as scans, AVG(watch_time) as watch_time FROM events GROUP BY date

  const { range = '7d', locationId } = req.query

  const weekly = [
    { day:"Mon", scans:142, views:310, ctr:18, watchTime:10.2 },
    { day:"Tue", scans:189, views:421, ctr:22, watchTime:11.4 },
    { day:"Wed", scans:201, views:498, ctr:19, watchTime:12.1 },
    { day:"Thu", scans:287, views:694, ctr:31, watchTime:13.8 },
    { day:"Fri", scans:412, views:988, ctr:38, watchTime:14.2 },
    { day:"Sat", scans:489, views:1203,ctr:41, watchTime:15.6 },
    { day:"Sun", scans:318, views:776, ctr:35, watchTime:13.0 },
  ]

  const summary = {
    totalScans:      weekly.reduce((s, d) => s + d.scans, 0),
    totalViews:      weekly.reduce((s, d) => s + d.views, 0),
    avgCtr:          Math.round(weekly.reduce((s, d) => s + d.ctr, 0) / weekly.length),
    avgWatchTime:    (weekly.reduce((s, d) => s + d.watchTime, 0) / weekly.length).toFixed(1),
    conversionRate:  41.5,
    topReel: { id: 'r5', title: 'Sunset Cocktails', views: 4156, ctr: 31.2 }
  }

  return res.status(200).json({
    success: true,
    range,
    locationId: locationId || 'all',
    summary,
    data: weekly
  })
}
