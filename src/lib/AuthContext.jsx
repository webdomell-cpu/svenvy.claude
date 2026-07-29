import { createContext, useContext, useEffect, useState } from 'react'
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from './firebase'

const AuthContext = createContext(null)

const DEMO_ACCOUNTS = [
  { id: 'fc999240-f01f-4054-8e82-6c4b0875e62c', email: 'admin@scenvy.de', password: 'admin123', role: 'admin', name: 'Dominik (Platform Admin)', venue: 'SCENVY HQ', tenant_id: 'a0000000-0000-0000-0000-000000000001' },
  { id: '98f577a6-7d9a-4b15-9e2c-c86b9648e9e8', email: 'venue@scenvy.de', password: 'venue123', role: 'tenant_owner', name: 'Marina Group', venue: 'The Marina Group', tenant_id: 'b0000000-0000-0000-0000-000000000002' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadOrCreateProfile = async (fbUser) => {
    try {
      const uid = fbUser.uid
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)

      let userData = null

      if (userSnap.exists()) {
        userData = userSnap.data()
      } else {
        // Create new user & tenant profile in Firestore
        const isDefaultAdmin = fbUser.email === 'admin@scenvy.de'
        const role = isDefaultAdmin ? 'admin' : 'tenant_owner'
        const tenantId = 'tenant_' + uid

        userData = {
          uid: uid,
          email: fbUser.email || '',
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
          role: role,
          tenant_id: tenantId,
          createdAt: new Date().toISOString()
        }

        await setDoc(userRef, userData, { merge: true })

        // Create tenant entry
        const tenantRef = doc(db, 'tenants', tenantId)
        await setDoc(tenantRef, {
          id: tenantId,
          name: fbUser.displayName ? `${fbUser.displayName}'s Venue` : 'My Venue',
          plan: 'pro',
          status: 'active',
          createdAt: new Date().toISOString()
        }, { merge: true })
      }

      // Fetch tenant details
      let tenantData = null
      if (userData.tenant_id) {
        const tenantSnap = await getDoc(doc(db, 'tenants', userData.tenant_id))
        if (tenantSnap.exists()) {
          tenantData = tenantSnap.data()
        }
      }

      const activeUser = {
        id: uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        tenant_id: userData.tenant_id,
        tenant: tenantData || { id: userData.tenant_id, name: 'Main Venue', plan: 'pro', status: 'active' },
        avatar: fbUser.photoURL || null
      }

      setProfile(userData)
      setUser(activeUser)
    } catch (err) {
      console.error('Error loading/creating profile in Firebase:', err)
      // Fallback user gracefully
      const fallbackUser = {
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || 'User',
        role: fbUser.email === 'admin@scenvy.de' ? 'admin' : 'tenant_owner',
        tenant_id: 'tenant_' + fbUser.uid,
        tenant: { id: 'tenant_' + fbUser.uid, name: 'Default Venue', plan: 'pro', status: 'active' }
      }
      setUser(fallbackUser)
      setProfile(fallbackUser)
    }
  }

  const checkLocalFallbackUser = () => {
    try {
      const stored = localStorage.getItem('scenvy_user')
      if (stored) {
        const u = JSON.parse(stored)
        setUser({
          id: u.id || 'demo_user',
          email: u.email,
          name: u.name || u.email?.split('@')[0],
          role: u.role || 'admin',
          tenant_id: u.tenant_id || 'demo_tenant',
          venue: u.venue || u.name,
        })
        setProfile({
          id: u.id || 'demo_user',
          email: u.email,
          role: u.role || 'admin',
          tenant_id: u.tenant_id || 'demo_tenant',
        })
        return true
      }
    } catch (err) {
      console.warn('Local user parse error:', err)
    }
    return false
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await loadOrCreateProfile(fbUser)
      } else {
        if (!checkLocalFallbackUser()) {
          setUser(null)
          setProfile(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (emailInput, passwordInput) => {
    const email = (emailInput || '').trim().toLowerCase()
    const password = (passwordInput || '').trim()
    const normalizedPw = password.replace(/\s+/g, '')

    const demo = DEMO_ACCOUNTS.find(d => 
      d.email.toLowerCase() === email && 
      (d.password === password || d.password === normalizedPw || d.password.replace(/\s+/g, '') === normalizedPw)
    )

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, normalizedPw)
      return { user: userCred.user, error: null }
    } catch (err) {
      if (demo) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, email, demo.password)
          if (newCred?.user) {
            return { user: newCred.user, error: null }
          }
        } catch (regErr) {
          console.warn('Demo firebase auto-register fallback:', regErr)
        }
        // Always fallback to setting demo user session locally
        const demoUser = {
          id: demo.id,
          email: demo.email,
          name: demo.name,
          role: demo.role,
          tenant_id: demo.tenant_id,
          venue: demo.venue,
          tenant: { id: demo.tenant_id, name: demo.venue, plan: 'pro', status: 'active' }
        }
        localStorage.setItem('scenvy_user', JSON.stringify(demoUser))
        setUser(demoUser)
        setProfile(demoUser)
        return { user: demoUser, error: null }
      }
      return { user: null, error: err }
    }
  }

  const signup = async (email, password, name, venue) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      if (userCred.user) {
        // Save user details
        const uid = userCred.user.uid
        const tenantId = 'tenant_' + uid
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          name: name || email.split('@')[0],
          role: email === 'admin@scenvy.de' ? 'admin' : 'tenant_owner',
          tenant_id: tenantId,
          createdAt: new Date().toISOString()
        })
        await setDoc(doc(db, 'tenants', tenantId), {
          id: tenantId,
          name: venue || name || 'My Venue',
          plan: 'pro',
          status: 'active',
          createdAt: new Date().toISOString()
        })
      }
      return { user: userCred.user, error: null }
    } catch (err) {
      return { user: null, error: err }
    }
  }

  const [impersonatedTenant, setImpersonatedTenant] = useState(null)

  const impersonateTenant = (targetTenant) => {
    setImpersonatedTenant(targetTenant)
  }

  const stopImpersonation = () => {
    setImpersonatedTenant(null)
  }

  const logout = async () => {
    setImpersonatedTenant(null)
    localStorage.removeItem('scenvy_user')
    try {
      await firebaseSignOut(auth)
    } catch (e) {
      console.warn('Firebase logout error:', e)
    }
    setUser(null)
    setProfile(null)
  }

  const effectiveUser = user && impersonatedTenant ? {
    ...user,
    tenant_id: impersonatedTenant.id,
    tenant: impersonatedTenant,
    isImpersonating: true,
    realUser: user
  } : user

  return (
    <AuthContext.Provider value={{ user: effectiveUser, profile, loading, login, signup, logout, impersonateTenant, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
