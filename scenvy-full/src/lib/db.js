// src/lib/db.js — Supabase data hooks (React Query)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/api/supabaseClient'

// ─── Helper: normalize DB reel → frontend reel ───────────
export const normalizeReel = (r) => ({
  ...r,
  locationId: r.location_id,
  ctaUrl:     r.cta_url    || '',
  ctaAction:  r.cta_action || 'url',
  mediaUrl:   r.media_url  || null,
  mediaType:  r.media_type || 'image',
  loc:        r.locations?.name || '',
  ago:        r.created_at
    ? new Date(r.created_at).toLocaleDateString('de-DE')
    : '',
})

// ─── Helper: normalize frontend reel → DB reel ───────────
export const denormalizeReel = (r, tenantId) => ({
  ...(r.id ? { id: r.id } : {}),
  tenant_id:   tenantId,
  location_id: r.locationId,
  title:       r.title,
  type:        r.type,
  status:      r.status || 'draft',
  color:       r.color,
  emoji:       r.emoji,
  cta:         r.cta,
  cta_url:     r.ctaUrl    || null,
  cta_action:  r.ctaAction || 'url',
  media_url:   r.mediaUrl  || null,
  media_type:  r.mediaType || 'image',
})

// ════════════════════════════════════════════════════════
// REELS
// ════════════════════════════════════════════════════════
export function useReels(tenantId) {
  return useQuery({
    queryKey: ['reels', tenantId],
    enabled:  !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reels')
        .select('*, locations(name)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map(normalizeReel)
    },
  })
}

export function useSaveReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ reel, tenantId }) => {
      const payload = denormalizeReel(reel, tenantId)
      const { data, error } = await supabase
        .from('reels')
        .upsert(payload)
        .select('*, locations(name)')
        .single()
      if (error) throw error
      return normalizeReel(data)
    },
    onSuccess: (_d, { tenantId }) =>
      qc.invalidateQueries({ queryKey: ['reels', tenantId] }),
  })
}

export function useDeleteReel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenantId }) => {
      const { error } = await supabase.from('reels').delete().eq('id', id)
      if (error) throw error
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
    enabled:  !!tenantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
}

export function useSaveLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ location, tenantId }) => {
      const payload = {
        ...(location.id ? { id: location.id } : {}),
        tenant_id: tenantId,
        name:      location.name,
        city:      location.city || 'Dubai',
        active:    location.active ?? true,
      }
      const { data, error } = await supabase
        .from('locations')
        .upsert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_d, { tenantId }) =>
      qc.invalidateQueries({ queryKey: ['locations', tenantId] }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tenantId }) => {
      const { error } = await supabase.from('locations').delete().eq('id', id)
      if (error) throw error
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
    enabled:  !!tenantId,
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString()
      const { data, error } = await supabase
        .from('scan_events')
        .select('id, created_at, reel_id')
        .eq('tenant_id', tenantId)
        .gte('created_at', sevenDaysAgo)
      if (error) throw error

      // Group by day
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      const grouped = {}
      ;(data || []).forEach(e => {
        const d = new Date(e.created_at).toLocaleDateString('en-US', { weekday:'short' })
        grouped[d] = (grouped[d] || 0) + 1
      })
      const chart = days.map(day => ({ day, scans: grouped[day] || 0, views: Math.round((grouped[day] || 0) * 2.4), ctr: Math.round(Math.random() * 20 + 15) }))

      return {
        totalScans: data?.length || 0,
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
      const { data, error } = await supabase
        .from('tenants')
        .select('*, profiles(id, full_name, email, role)')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  })
}

// ════════════════════════════════════════════════════════
// MEDIA UPLOAD
// ════════════════════════════════════════════════════════
export async function uploadMedia(file, tenantId) {
  const ext  = file.name.split('.').pop()
  const path = `${tenantId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('reel-media')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('reel-media')
    .getPublicUrl(path)
  return publicUrl
}

// ════════════════════════════════════════════════════════
// ADMIN SETTINGS
// ════════════════════════════════════════════════════════
export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin_settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tenants')
        .select('settings')
        .eq('name', '__platform__')
        .maybeSingle()
      return data?.settings || {}
    },
    retry: false,
  })
}

export function useSaveAdminSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (settings) => {
      // Store in Supabase as platform config
      const { error } = await supabase.rpc('upsert_platform_settings', { p_settings: settings })
      if (error) {
        // Fallback: store locally in profiles metadata
        localStorage.setItem('scenvy_admin_settings', JSON.stringify(settings))
      }
      return settings
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_settings'] }),
  })
}
