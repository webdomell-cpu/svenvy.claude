import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/api/supabaseClient'
import { C, grad } from '@/tokens'
import { Eye, EyeOff } from 'lucide-react'

const F = ({ label, value, onChange, placeholder, type='text', onEnter, id, name }) => (
  <div style={{ marginBottom:14 }}>
    <label htmlFor={id} style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6, fontWeight:600, letterSpacing:1 }}>{label}</label>
    <input 
      id={id}
      name={name || id}
      value={value} 
      onChange={e=>onChange(e.target.value)} 
      placeholder={placeholder} 
      type={type}
      onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
      style={{ width:'100%', padding:'11px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
  </div>
)

const FPw = ({ label, value, onChange, onEnter, hint, id, name }) => {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label htmlFor={id} style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6, fontWeight:600, letterSpacing:1 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input 
          id={id}
          name={name || id}
          value={value} 
          onChange={e=>onChange(e.target.value)} 
          placeholder="••••••••"
          type={show?'text':'password'} 
          onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
          style={{ width:'100%', padding:'11px 44px 11px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
        <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.muted, cursor:'pointer' }}>
          {show?<EyeOff size={16}/>:<Eye size={16}/>}
        </button>
      </div>
      {hint&&<div style={{ fontSize:11, color:C.dim, marginTop:4 }}>{hint}</div>}
    </div>
  )
}

export default function ScenvyAuth() {
  const nav = useNavigate()
  const p = new URLSearchParams(window.location.search)
  const [mode,    setMode]    = useState(p.get('mode')==='register'?'register':'login')
  const [email,   setEmail]   = useState('')
  const [pw,      setPw]      = useState('')
  const [pw2,     setPw2]     = useState('')
  const [name,    setName]    = useState('')
  const [venue,   setVenue]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const de = navigator.language?.startsWith('de')

  const doLogin = async (e) => {
    e?.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data, error: e } = await supabase.auth.signInWithPassword({ email, password:pw })
      
      if (e) {
        setError(de?'E-Mail oder Passwort falsch.':'Invalid email or password.')
        setLoading(false)
        return
      }
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Benutzerrolle aus DB abrufen
      const { data: userData, error: dbError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (dbError) {
        console.error('DB Error:', dbError)
        setError(de?'Benutzerrolle nicht gefunden.':'User role not found.')
        setLoading(false)
        return
      }
      
      if (!userData?.role) {
        setError(de?'Benutzerrolle nicht definiert.':'User role not defined.')
        setLoading(false)
        return
      }
      
      // Log for debugging
      console.log('Login success. User role:', userData.role)
      
      // Weiterleitung basierend auf Rolle
      if (userData.role === 'admin' || userData.role === 'superadmin') {
        console.log('Navigating to /admin')
        nav('/admin', { replace: true })
      } else {
        console.log('Navigating to /dashboard')
        nav('/dashboard', { replace: true })
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(de?'Ein Fehler ist aufgetreten.':'An error occurred.')
      setLoading(false)
    }
  }

  const doRegister = async (e) => {
    e?.preventDefault()
    setError(''); setLoading(true)
    try {
      if (!name||!email||!pw) { setError(de?'Pflichtfelder ausfüllen.':'Fill required fields.'); setLoading(false); return }
      if (pw!==pw2)           { setError(de?'Passwörter stimmen nicht überein.':'Passwords do not match.'); setLoading(false); return }
      if (pw.length<8)        { setError(de?'Mindestens 8 Zeichen.':'Min. 8 characters.'); setLoading(false); return }
      const { error:e } = await supabase.auth.signUp({
        email, password:pw,
        options:{ data:{ full_name:name, venue_name:venue||name }, emailRedirectTo:`${window.location.origin}/dashboard` }
      })
      if (e) setError(e.message); else setSent(true)
    } catch (err) {
      setError(de?'Ein Fehler ist aufgetreten.':'An error occurred.')
    }
    setLoading(false)
  }

  const doReset = async (e) => {
    e?.preventDefault()
    setError(''); setLoading(true)
    try {
      const { error:e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo:`${window.location.origin}/auth?mode=reset` })
      if (e) setError(e.message); else setSent(true)
    } catch (err) {
      setError(de?'Ein Fehler ist aufgetreten.':'An error occurred.')
    }
    setLoading(false)
  }

  const SubmitBtn = ({ onClick, label, type='submit' }) => (
    <button type={type} onClick={onClick} disabled={loading} style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', cursor:loading?'wait':'pointer', background:loading?C.dim:grad(C.purple,C.pink), color:C.white, fontSize:14, fontWeight:600, transition:'all 0.2s' }}>
      {loading?'...' : label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle,${C.purple}33 0%,transparent 70%)`, top:'-10%', left:'-10%', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle,${C.pink}22 0%,transparent 70%)`, bottom:'-10%', right:'-10%', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:440, padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:grad(C.purple,C.pink), display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, margin:'0 auto 12px' }}>S</div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:2 }}>SCENVY</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>app.scenvy.de</div>
        </div>

        {sent ? (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:22, padding:32, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{de?'E-Mail gesendet!':'Email sent!'}</div>
            <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>
              {mode==='register' ? (de?'Bestätige deine E-Mail-Adresse.':'Confirm your email address.') : (de?'Prüfe deinen Posteingang.':'Check your inbox.')}
            </div>
            <button onClick={()=>{setSent(false);setMode('login')}} style={{ padding:'11px 28px', borderRadius:12, border:'none', background:grad(C.purple,C.pink), color:C.white, cursor:'pointer', fontSize:13, fontWeight:600 }}>
              {de?'Zurück zum Login':'Back to Login'}
            </button>
          </div>
        ) : (
          <>
            {mode!=='forgot' && (
              <div style={{ display:'flex', background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:4, marginBottom:20 }}>
                {[['login',de?'Einloggen':'Sign In'],['register',de?'Registrieren':'Sign Up']].map(([m,label])=>(
                  <button key={m} type="button" onClick={()=>{setMode(m);setError('')}} style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', cursor:'pointer', background:mode===m?C.purple:'transparent', color:C.white, fontSize:12, fontWeight:600, transition:'all 0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault()
              if (mode === 'login') doLogin(e)
              else if (mode === 'register') doRegister(e)
              else doReset(e)
            }} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:22, padding:28 }}>
              {mode==='forgot' && <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>{de?'Passwort zurücksetzen':'Reset Password'}</div>}

              {mode==='register' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F id="full-name" name="full_name" label={de?'NAME *':'NAME *'} value={name} onChange={setName} placeholder="Max Mustermann"/>
                  <F id="venue-name" name="venue_name" label={de?'VENUE':'VENUE'} value={venue} onChange={setVenue} placeholder="Mein Restaurant"/>
                </div>
              )}

              <F id="email" name="email" label="E-MAIL *" value={email} onChange={setEmail} placeholder="deine@email.de" type="email"/>

              {mode!=='forgot' && <FPw id="password" name="password" label={de?'PASSWORT *':'PASSWORD *'} value={pw} onChange={setPw} hint={mode==='register'?(de?'Mindestens 8 Zeichen.':'Min. 8 characters.'):undefined}/>}
              {mode==='register' && <FPw id="password-confirm" name="password_confirm" label={de?'PASSWORT WIEDERHOLEN *':'CONFIRM PASSWORD *'} value={pw2} onChange={setPw2}/>}

              {error && <div style={{ fontSize:13, color:C.pink, marginBottom:14, padding:'10px 14px', background:`${C.pink}18`, borderRadius:8 }}>{error}</div>}

              <SubmitBtn 
                label={mode==='login'?(de?'Einloggen →':'Sign In →'):mode==='register'?(de?'Account erstellen →':'Create Account →'):(de?'Link senden →':'Send Link →')}/>

              <div style={{ textAlign:'center', marginTop:14 }}>
                {mode==='login' && <span onClick={()=>{setMode('forgot');setError('')}} style={{ fontSize:12, color:C.muted, cursor:'pointer' }}>{de?'Passwort vergessen?':'Forgot password?'}</span>}
                {mode==='forgot' && <span onClick={()=>{setMode('login');setError('')}} style={{ fontSize:13, color:C.purple, cursor:'pointer', fontWeight:600 }}>← {de?'Zurück':'Back'}</span>}
              </div>
            </form>
          </>
        )}

        <div style={{ textAlign:'center', marginTop:20 }}>
          <span onClick={()=>nav('/')} style={{ fontSize:13, color:C.muted, cursor:'pointer' }}>← {de?'Zur Startseite':'Homepage'}</span>
        </div>
      </div>
    </div>
  )
}
