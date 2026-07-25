import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import aiGenerateHandler from './api/ai/generate.js'
import analyticsHandler from './api/analytics.js'
import contactHandler from './api/contact.js'
import locationsHandler from './api/locations.js'
import reelsHandler from './api/reels.js'
import tenantsHandler from './api/tenants.js'

function apiPlugin() {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) return next()

        // Helper to parse JSON body for POST/PUT requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const buffers = []
          for await (const chunk of req) buffers.push(chunk)
          const bodyStr = Buffer.concat(buffers).toString()
          try { req.body = JSON.parse(bodyStr) } catch { req.body = {} }
        } else {
          req.body = req.body || {}
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
        req.query = Object.fromEntries(url.searchParams.entries())

        // Polyfill res.status and res.json for Express/Vercel compatibility
        if (!res.status) {
          res.status = (code) => {
            res.statusCode = code
            return res
          }
        }
        if (!res.json) {
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }
        }

        const pathname = url.pathname
        try {
          if (pathname === '/api/ai/generate') return await aiGenerateHandler(req, res)
          if (pathname === '/api/analytics') return await analyticsHandler(req, res)
          if (pathname === '/api/contact') return await contactHandler(req, res)
          if (pathname === '/api/locations') return await locationsHandler(req, res)
          if (pathname === '/api/reels') return await reelsHandler(req, res)
          if (pathname === '/api/tenants') return await tenantsHandler(req, res)
        } catch (err) {
          console.error(`Error in ${pathname}:`, err)
          return res.status(500).json({ error: err.message || 'Internal Server Error' })
        }

        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
})
