import express from 'express'
import path from 'path'
import { createServer as createViteServer } from 'vite'

import generateAiHandler from './api/ai/generate.js'
import parseMenuHandler from './api/ai/parse-menu.js'
import adminKeysHandler from './api/admin/keys.js'
import analyticsHandler from './api/analytics.js'
import contactHandler from './api/contact.js'
import locationsHandler from './api/locations.js'
import reelsHandler from './api/reels.js'
import tenantsHandler from './api/tenants.js'
import downloadZipHandler from './api/download-zip.js'

async function startServer() {
  const app = express()
  const PORT = Number(process.env.PORT) || 3000

  // Increased body limit for menu uploads and images
  app.use(express.json({ limit: '25mb' }))
  app.use(express.urlencoded({ extended: true, limit: '25mb' }))

  // Wrap Vercel/Node style handler for Express
  const adapt = (handler: any) => async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res)
    } catch (err: any) {
      console.error('API Error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'Internal Server Error' })
      }
    }
  }

  // API Routes
  app.all('/api/ai/generate', adapt(generateAiHandler))
  app.all('/api/ai/parse-menu', adapt(parseMenuHandler))
  app.all('/api/admin/keys', adapt(adminKeysHandler))
  app.all('/api/analytics', adapt(analyticsHandler))
  app.all('/api/contact', adapt(contactHandler))
  app.all('/api/locations', adapt(locationsHandler))
  app.all('/api/reels', adapt(reelsHandler))
  app.all('/api/tenants', adapt(tenantsHandler))
  app.all('/api/download-zip', adapt(downloadZipHandler))
  app.all('/api/export-zip', adapt(downloadZipHandler))
  app.all('/download.zip', adapt(downloadZipHandler))

  // Vite middleware for dev mode vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(process.cwd(), 'dist')
    app.use(express.static(distPath))
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Scenvy server running on http://0.0.0.0:${PORT}`)
  })
}

startServer()
