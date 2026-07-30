// src/lib/db.js — Firebase Firestore Data Hooks (React Query)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from './firebase'

export const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

// ─── Helper: normalize DB reel → frontend reel ───────────
export const normalizeReel = (r) => ({
  ...r,
  locationId: r.location_id || r.locationId,
  ctaUrl:     r.cta_url    || r.ctaUrl || '',
  ctaAction:  r.cta_action || r.ctaAction || 'url',
  mediaUrl:   r.media_url  || r.mediaUrl || null,
  mediaType:  r.media_type || r.mediaType || 'image',
  loc:        r.locations?.name || r.loc || '',
  ago:        r.created_at || r.createdAt
    ? new Date(r.created_at || r.createdAt).toLocaleDateString('de-DE')
    : '',
})

// ─── Helper: normalize frontend reel → DB reel ───────────
export const denormalizeReel = (r, tenantId) => ({
  id:          r.id || crypto.randomUUID(),
  tenant_id:   tenantId,
  location_id: r.locationId || r.location_id || null,
  title:       r.title || 'Neues Reel',
  type:        r.type || 'offer',
  status:      r.status || 'draft',
  color:       r.color || '#8B5CF6',
  emoji:       r.emoji || '🎬',
  cta:         r.cta || 'Mehr erfahren',
  cta_url:     r.ctaUrl || r.cta_url || null,
  cta_action:  r.ctaAction || r.cta_action || 'url',
  media_url:   r.mediaUrl || r.media_url || null,
  media_type:  r.mediaType || r.media_type || 'image',
  loc:         r.loc || '',
  scheduled_at: r.scheduledAt || r.scheduled_at || null,
  updated_at:  new Date().toISOString()
})

export async function resolveTenantId(providedTenantId) {
  if (providedTenantId && providedTenantId !== 'ALL') return providedTenantId
  return 'tenant_default'
}

// ════════════════════════════════════════════════════════
// REELS
// ════════════════════════════════════════════════════════
export function useReels(tenantId) {
  return useQuery({
    queryKey: ['reels', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const reelsRef = collection(db, 'reels')
        let q = query(reelsRef)
        if (tenantId && tenantId !== 'ALL') {
          q = query(reelsRef, where('tenant_id', '==', tenantId))
        }
        const snap = await getDocs(q)
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (items.length > 0) return items.map(normalizeReel)
      } catch (e) {
        console.warn('Firestore reels query notice:', e)
      }

      // Fallback to demo local storage
      const stored = localStorage.getItem(`demo_reels_${tenantId}`)
      return stored ? JSON.parse(stored).map(normalizeReel) : []
    },
  })
}

export function useSaveReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ reel, tenantId }) => {
      const finalTenantId = await resolveTenantId(tenantId || reel?.tenant_id)
      const payload = denormalizeReel(reel, finalTenantId)

      try {
        const docRef = doc(db, 'reels', payload.id)
        await setDoc(docRef, payload, { merge: true })
      } catch (e) {
        console.warn('Firestore save reel fallback:', e)
      }

      // Always sync to localStorage so local queries find it instantly
      const stored = JSON.parse(localStorage.getItem(`demo_reels_${finalTenantId}`) || '[]')
      const index = stored.findIndex(l => l.id === payload.id)
      if (index >= 0) stored[index] = payload
      else stored.push(payload)
      localStorage.setItem(`demo_reels_${finalTenantId}`, JSON.stringify(stored))

      return normalizeReel(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reels'] })
    },
  })
}

export function useDeleteReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenantId }) => {
      try {
        await deleteDoc(doc(db, 'reels', id))
      } catch (e) {
        console.warn('Firestore delete reel fallback:', e)
      }
      const stored = JSON.parse(localStorage.getItem(`demo_reels_${tenantId}`) || '[]')
      localStorage.setItem(`demo_reels_${tenantId}`, JSON.stringify(stored.filter(x => x.id !== id)))
      return tenantId
    },
    onSuccess: (tenantId) =>
      qc.invalidateQueries({ queryKey: ['reels', tenantId] }),
  })
}

// ════════════════════════════════════════════════════════
// LOCATIONS
// ════════════════════════════════════════════════════════
export function useLocations(tenantId) {
  return useQuery({
    queryKey: ['locations', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const locRef = collection(db, 'locations')
        let q = query(locRef)
        if (tenantId && tenantId !== 'ALL') {
          q = query(locRef, where('tenant_id', '==', tenantId))
        }
        const snap = await getDocs(q)
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (items.length > 0) return items
      } catch (e) {
        console.warn('Firestore locations query notice:', e)
      }

      const stored = localStorage.getItem(`demo_locations_${tenantId}`)
      return stored ? JSON.parse(stored) : [
        { id: 'dt-demo', tenant_id: tenantId, name: 'DT-Demo', city: 'Berlin', country: 'DE', active: true },
        { id: 'loc1', tenant_id: tenantId, name: 'Main Venue', city: 'Berlin', country: 'DE', active: true }
      ]
    },
  })
}

export function useSaveLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ location, tenantId }) => {
      const finalTenantId = await resolveTenantId(tenantId || location?.tenant_id)
      const payload = {
        id: location.id || crypto.randomUUID(),
        tenant_id: finalTenantId,
        name: location.name || 'Neuer Standort',
        address: location.address || '',
        zip: location.zip || '',
        city: location.city || 'Berlin',
        country: location.country || 'DE',
        active: location.active !== false,
        updated_at: new Date().toISOString()
      }

      try {
        await setDoc(doc(db, 'locations', payload.id), payload, { merge: true })
      } catch (e) {
        console.warn('Firestore save location fallback:', e)
      }

      // Always sync to localStorage demo_locations
      const stored = JSON.parse(localStorage.getItem(`demo_locations_${finalTenantId}`) || '[]')
      const index = stored.findIndex(l => l.id === payload.id)
      if (index >= 0) stored[index] = payload
      else stored.push(payload)
      localStorage.setItem(`demo_locations_${finalTenantId}`, JSON.stringify(stored))

      return payload
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['locations'] }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenantId }) => {
      try {
        await deleteDoc(doc(db, 'locations', id))
      } catch (e) {
        console.warn('Firestore delete location fallback:', e)
      }
      const stored = JSON.parse(localStorage.getItem(`demo_locations_${tenantId}`) || '[]')
      localStorage.setItem(`demo_locations_${tenantId}`, JSON.stringify(stored.filter(x => x.id !== id)))
      return tenantId
    },
    onSuccess: (tenantId) =>
      qc.invalidateQueries({ queryKey: ['locations', tenantId] }),
  })
}

// ════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════
export function useAnalyticsSummary(tenantId) {
  return useQuery({
    queryKey: ['analytics', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const days = ['Mo','Di','Mi','Do','Fr','Sa','So']
      const chart = days.map(day => ({
        day,
        scans: Math.floor(Math.random() * 45 + 12),
        views: Math.floor(Math.random() * 120 + 35),
        ctr: Math.round(Math.random() * 20 + 15)
      }))

      return {
        totalScans: chart.reduce((acc, c) => acc + c.scans, 0),
        chart,
      }
    },
  })
}

// ════════════════════════════════════════════════════════
// TENANTS (Super Admin)
// ════════════════════════════════════════════════════════
export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'tenants'))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (items.length > 0) return items
      } catch (e) {
        console.warn('Firestore tenants query notice:', e)
      }
      return [
        { id: 'a0000000-0000-0000-0000-000000000001', name: 'SCENVY HQ', plan: 'enterprise', status: 'active', reel_count: 8, location_count: 3 },
        { id: 'b0000000-0000-0000-0000-000000000002', name: 'The Marina Group', plan: 'pro', status: 'active', reel_count: 5, location_count: 2 },
        { id: 'c0000000-0000-0000-0000-000000000003', name: 'Test Venue', plan: 'starter', status: 'trial', reel_count: 2, location_count: 1 },
      ]
    },
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      try {
        await setDoc(doc(db, 'tenants', id), updates, { merge: true })
      } catch (e) {
        console.warn('Firestore update tenant fallback:', e)
      }
      return { id, ...updates }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })
}

export function useDeleteTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      try {
        await deleteDoc(doc(db, 'tenants', id))
      } catch (e) {
        console.warn('Firestore delete tenant fallback:', e)
      }
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })
}

// ════════════════════════════════════════════════════════
// MEDIA UPLOAD & LIBRARY
// ════════════════════════════════════════════════════════
export async function uploadMedia(file, tenantId) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useMedia(tenantId) {
  return useQuery({
    queryKey: ['media', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const snap = await getDocs(query(collection(db, 'media'), where('tenant_id', '==', tenantId)))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (items.length > 0) return items
      } catch (e) {
        console.warn('Firestore media query notice:', e)
      }

      const stored = localStorage.getItem(`demo_media_${tenantId}`)
      return stored ? JSON.parse(stored) : []
    },
  })
}

export function useSaveMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ media, tenantId }) => {
      const finalTenantId = await resolveTenantId(tenantId)
      const payload = { ...media, tenant_id: finalTenantId, id: media.id || crypto.randomUUID() }

      try {
        await setDoc(doc(db, 'media', payload.id), payload, { merge: true })
      } catch (e) {
        console.warn('Firestore save media fallback:', e)
        const stored = JSON.parse(localStorage.getItem(`demo_media_${finalTenantId}`) || '[]')
        const index = stored.findIndex(m => m.id === payload.id)
        if (index >= 0) stored[index] = payload
        else stored.push(payload)
        localStorage.setItem(`demo_media_${finalTenantId}`, JSON.stringify(stored))
      }
      return payload
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenantId }) => {
      try {
        await deleteDoc(doc(db, 'media', id))
      } catch (e) {
        console.warn('Firestore delete media fallback:', e)
      }
      const stored = JSON.parse(localStorage.getItem(`demo_media_${tenantId}`) || '[]')
      localStorage.setItem(`demo_media_${tenantId}`, JSON.stringify(stored.filter(x => x.id !== id)))
      return tenantId
    },
    onSuccess: (tenantId) => qc.invalidateQueries({ queryKey: ['media', tenantId] }),
  })
}

// ════════════════════════════════════════════════════════
// TENANT PROFILE
// ════════════════════════════════════════════════════════
export function useTenant(tenantId) {
  return useQuery({
    queryKey: ['tenant', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const snap = await getDoc(doc(db, 'tenants', tenantId))
        if (snap.exists()) return snap.data()
      } catch (e) {
        console.warn('Firestore get tenant notice:', e)
      }

      const stored = localStorage.getItem(`demo_tenant_${tenantId}`)
      return stored ? JSON.parse(stored) : { id: tenantId, name: 'SCENVY Partner', plan: 'pro', status: 'active' }
    },
  })
}

export function useSaveTenantProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const finalTenantId = await resolveTenantId(id)
      const payload = { id: finalTenantId, ...updates }
      try {
        await setDoc(doc(db, 'tenants', finalTenantId), payload, { merge: true })
      } catch (e) {
        console.warn('Firestore save tenant profile fallback:', e)
        localStorage.setItem(`demo_tenant_${finalTenantId}`, JSON.stringify(payload))
      }
      return payload
    },
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ['tenant', id] })
      qc.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
}

// ════════════════════════════════════════════════════════
// PLATFORM CONFIG
// ════════════════════════════════════════════════════════
export function usePlatformConfig() {
  return useQuery({
    queryKey: ['platform_config'],
    queryFn: async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'platform'))
        if (snap.exists()) return snap.data()
      } catch (e) {
        console.warn('Firestore platform config notice:', e)
      }
      const stored = localStorage.getItem('scenvy_platform_config')
      return stored ? JSON.parse(stored) : {}
    },
  })
}

export function useSavePlatformConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (config) => {
      try {
        await setDoc(doc(db, 'config', 'platform'), config, { merge: true })
      } catch (e) {
        console.warn('Firestore save platform config fallback:', e)
        localStorage.setItem('scenvy_platform_config', JSON.stringify(config))
      }
      return config
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['platform_config'] }),
  })
}

// ════════════════════════════════════════════════════════
// GUEST VIEW & REELS HELPERS
// ════════════════════════════════════════════════════════
export async function fetchLocation(locationId) {
  if (!locationId) return null
  if (locationId === 'demo') {
    return { id: 'demo', name: 'Demo Venue', address: 'Dubai Marina', city: 'Dubai', country: 'UAE', active: true }
  }
  if (locationId === 'dt-demo' || locationId === 'DT-Demo') {
    return { id: 'dt-demo', name: 'DT-Demo', address: 'Demo Strasse 12', city: 'Berlin', country: 'DE', active: true }
  }
  if (locationId === 'loc1') {
    return { id: 'loc1', name: 'Main Venue', address: 'Gastro Mile 12', city: 'Berlin', country: 'DE', active: true }
  }
  try {
    const snap = await getDoc(doc(db, 'locations', locationId))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
  } catch (e) {
    console.warn('fetchLocation error:', e)
  }

  // Fallback search in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('demo_locations_')) {
      try {
        const locs = JSON.parse(localStorage.getItem(key) || '[]')
        const found = locs.find(l => l.id === locationId || l.name === locationId)
        if (found) return found
      } catch (err) {
        console.warn('LocalStorage loc parse error:', err)
      }
    }
  }

  return { id: locationId, name: 'SCENVY Partner Venue', address: 'Gastro Mile 12', city: 'Berlin', country: 'DE', active: true }
}

export async function fetchReelsByLocation(locationId) {
  if (!locationId) return []
  let results = []
  try {
    const snap = await getDocs(query(collection(db, 'reels')))
    const allReels = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const matching = allReels.filter(r => {
      const loc = r.location_id || r.locationId
      return !loc || loc === 'ALL' || loc === 'all' || loc === locationId
    })
    results.push(...matching)
  } catch (e) {
    console.warn('fetchReelsByLocation error:', e)
  }

  // Search local storage across all demo_reels_ keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('demo_reels_')) {
      try {
        const reels = JSON.parse(localStorage.getItem(key) || '[]')
        const matching = reels.filter(r => {
          const loc = r.location_id || r.locationId
          return !loc || loc === 'ALL' || loc === 'all' || loc === locationId
        })
        for (const m of matching) {
          if (!results.some(existing => existing.id === m.id)) {
            results.push(m)
          }
        }
      } catch (err) {
        console.warn('LocalStorage reel parse error:', err)
      }
    }
  }

  if (results.length > 0) return results

  // Demo fallback reels so guest view is never blank
  return [
    { id: 'demo-1', title: '50% Off Signature Cocktails', sub: 'Happy Hour', cta: 'Order at Bar', cta_url: '#', color: '#7C3AED', emoji: '🍹', type: 'offer', status: 'live', location_id: locationId },
    { id: 'demo-2', title: "Chef's Tasting Menu & Wine Pairing", sub: 'Dinner Special', cta: 'Reserve Table', cta_url: '#', color: '#FF2D8D', emoji: '🍽️', type: 'menu', status: 'live', location_id: locationId },
    { id: 'demo-3', title: 'Live Music & Rooftop Lounge', sub: 'Weekend Vibes', cta: 'Get Guestlist', cta_url: '#', color: '#00D4FF', emoji: '🎵', type: 'event', status: 'live', location_id: locationId }
  ]
}

export async function recordScan(locationId, reelId = null) {
  if (!locationId || locationId === 'demo') return
  try {
    await addDoc(collection(db, 'scan_events'), {
      location_id: locationId,
      reel_id: reelId,
      event_type: 'scan',
      created_at: new Date().toISOString()
    })
  } catch (err) {
    console.warn('recordScan error:', err)
  }
}

export async function recordClick(reelId) {
  if (!reelId) return
  try {
    await addDoc(collection(db, 'scan_events'), {
      reel_id: reelId,
      event_type: 'click',
      created_at: new Date().toISOString()
    })
  } catch (err) {
    console.warn('recordClick error:', err)
  }
}

// ════════════════════════════════════════════════════════
// MENU REELS (AI Menu Add-On)
// ════════════════════════════════════════════════════════
export function useMenuReels(tenantId) {
  return useQuery({
    queryKey: ['menu_reels', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const snap = await getDocs(query(collection(db, 'menus'), where('tenant_id', '==', tenantId)))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (items.length > 0) return items
      } catch (e) {
        console.warn('Firestore menu_reels notice:', e)
      }

      const stored = localStorage.getItem(`demo_menu_reels_${tenantId}`)
      return stored ? JSON.parse(stored) : []
    },
  })
}

export function useSaveMenuReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ menuReel, tenantId }) => {
      const finalTenantId = await resolveTenantId(tenantId || menuReel?.tenant_id)
      const id = menuReel.id || crypto.randomUUID()
      const payload = {
        id,
        tenant_id: finalTenantId,
        title: menuReel.title || menuReel.branding?.name || 'Digital Menu',
        data: menuReel.data || menuReel,
        updated_at: new Date().toISOString()
      }

      try {
        await setDoc(doc(db, 'menus', id), payload, { merge: true })
      } catch (e) {
        console.warn('Firestore save menu error, using fallback:', e)
        const stored = JSON.parse(localStorage.getItem(`demo_menu_reels_${finalTenantId}`) || '[]')
        const index = stored.findIndex(m => m.id === payload.id)
        if (index >= 0) stored[index] = payload
        else stored.push(payload)
        localStorage.setItem(`demo_menu_reels_${finalTenantId}`, JSON.stringify(stored))
      }
      return payload
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu_reels'] })
    }
  })
}

export function useDeleteMenuReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenantId }) => {
      try {
        await deleteDoc(doc(db, 'menus', id))
      } catch (err) {
        console.warn('Firestore delete menu error:', err)
      }

      const finalTenantId = await resolveTenantId(tenantId)
      const stored = JSON.parse(localStorage.getItem(`demo_menu_reels_${finalTenantId}`) || '[]')
      localStorage.setItem(`demo_menu_reels_${finalTenantId}`, JSON.stringify(stored.filter(x => x.id !== id)))
      return tenantId
    },
    onSuccess: (tenantId) => qc.invalidateQueries({ queryKey: ['menu_reels', tenantId] })
  })
}

export async function fetchMenuReel(menuId) {
  if (!menuId) return null
  try {
    const snap = await getDoc(doc(db, 'menus', menuId))
    if (snap.exists()) return snap.data()
  } catch (e) {
    console.warn('fetchMenuReel error:', e)
  }

  // Local storage fallback
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('demo_menu_reels_')) {
      const items = JSON.parse(localStorage.getItem(key) || '[]')
      const found = items.find(m => m.id === menuId)
      if (found) return found
    }
  }
  return null
}
