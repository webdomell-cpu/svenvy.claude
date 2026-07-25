import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/api/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const email = session?.user?.email || ''

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      let activeTenantId = data?.tenant_id
      let targetRole = (email === 'admin@scenvy.de') ? 'admin' : (data?.role || 'tenant_owner')

      // Ensure tenant_id exists and is synced in profiles + tenants
      if (!activeTenantId) {
        activeTenantId = crypto.randomUUID()
        const tenantName = session?.user?.user_metadata?.venue_name || (email ? email.split('@')[0] : 'Mein Venue')

        // Step 1: Insert tenant record first so FK constraint on profiles.tenant_id passes
        const { error: tenantErr } = await supabase
          .from('tenants')
          .insert({ id: activeTenantId, name: tenantName, plan: 'starter', status: 'trial' })

        if (tenantErr) console.warn('Tenant insert notice:', tenantErr.message)

        // Step 2: Upsert profile with activeTenantId
        const { data: insertedProf, error: profErr } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: email,
            full_name: data?.full_name || session?.user?.user_metadata?.full_name || (email ? email.split('@')[0] : 'User'),
            role: targetRole,
            tenant_id: activeTenantId,
          })
          .select()
          .maybeSingle()

        if (insertedProf) data = insertedProf
        if (profErr) console.warn('Profile upsert notice:', profErr.message)
      }

      // Sync profile record in DB so Supabase RLS is_admin() and user_tenant_id() evaluate correctly
      if (!data || data.role !== targetRole || data.tenant_id !== activeTenantId || !data.email) {
        const profilePayload = {
          id: userId,
          email: email,
          full_name: data?.full_name || session?.user?.user_metadata?.full_name || (email ? email.split('@')[0] : 'User'),
          role: targetRole,
          tenant_id: activeTenantId,
        }
        const { data: updatedProf } = await supabase
          .from('profiles')
          .upsert(profilePayload)
          .select()
          .maybeSingle()
        if (updatedProf) data = updatedProf
      }

      let tenant = null
      if (activeTenantId) {
        const { data: td } = await supabase
          .from('tenants')
          .select('id, name, plan, status')
          .eq('id', activeTenantId)
          .maybeSingle()
        tenant = td
      }

      const effectiveRole = (email === 'admin@scenvy.de' || targetRole === 'admin' || targetRole === 'superadmin') ? 'admin' : targetRole

      setProfile({ ...data, role: effectiveRole, tenant_id: activeTenantId })
      setUser({
        id:        userId,
        email:     email,
        name:      data?.full_name || email.split('@')[0],
        role:      effectiveRole,
        tenant_id: activeTenantId,
        tenant:    tenant,
        avatar:    data?.avatar_url,
      })
    } catch (err) {
      console.error('loadProfile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkLocalUser = () => {
    try {
      const stored = localStorage.getItem('scenvy_user')
      if (stored) {
        const u = JSON.parse(stored)
        setUser({
          id: u.id || u.email,
          email: u.email,
          name: u.name || u.email.split('@')[0],
          role: u.role || 'tenant_owner',
          tenant_id: u.tenant_id || 'test-tenant',
          venue: u.venue || u.name,
        })
        setProfile({
          id: u.id || u.email,
          email: u.email,
          role: u.role || 'tenant_owner',
          tenant_id: u.tenant_id || 'test-tenant',
        })
        return true
      }
    } catch (err) {
      console.warn('Local user parse error:', err)
    }
    return false
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        if (!checkLocalUser()) {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        if (session?.user) {
          setLoading(true)
          await loadProfile(session.user.id)
        } else {
          if (!checkLocalUser()) {
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      })()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    localStorage.removeItem('scenvy_user')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
