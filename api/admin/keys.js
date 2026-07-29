import { getKeyPoolStatus, addApiKeyToPool } from '../ai/ai-key-manager.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', keys: getKeyPoolStatus() })
  }

  if (req.method === 'POST') {
    const { provider, apiKey, priority } = req.body || {}
    if (!apiKey) return res.status(400).json({ error: 'apiKey is required' })

    const success = addApiKeyToPool({ provider: provider || 'gemini', apiKey, priority: priority || 1 })
    return res.status(200).json({ success, message: 'Key added to active Round-Robin pool', keys: getKeyPoolStatus() })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
