import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/api/supabaseClient'
import { C, grad } from '@/tokens'
import { ScenvyLogoFull } from '@/components/ScenvyLogo'
import { Eye, EyeOff } from 'lucide-react'

const F = ({ label, value, onChange, placeholder, type='text', onEnter }) => (
  <div style={{ marginBottom:14 }}>
    <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6, fontWeight:600, letterSpacing:1 }}>{label}</label>
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
      onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
      style={{ width:'100%', padding:'11px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
  </div>
)

const FPw = ({ label, value, onChange, onEnter, hint }) => {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6, fontWeight:600, letterSpacing:1 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder="••••••••"
          type={show?'text':'password'} onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
          style={{ width:'100%', padding:'11px 44px 11px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
        <button onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.muted, cursor:'pointer' }}>
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

  const DEMO_ACCOUNTS = [
    { email:'admin@scenvy.de', password:'admin123', role:'admin',  name:'Dominik',     venue:'SCENVY HQ'        },
    { email:'venue@scenvy.de', password:'venue123', role:'tenant', name:'Marina Group', venue:'The Marina Group' },
    { email:'test@scenvy.de',  password:'test123', role:'tenant', name:'Test User',   venue:'Test Venue'       },
  ]

  const doLogin = async () => {
    setError(''); setLoading(true)
    const { error:e } = await supabase.auth.signInWithPassword({ email, password:pw })
    if (e) {
      const demoUser = DEMO_ACCOUNTS.find(u => u.email === email && u.password === pw)
      if (demoUser) {
        localStorage.setItem('scenvy_user', JSON.stringify(demoUser))
        window.location.href = demoUser.role === 'admin' ? '/admin' : '/dashboard'
        return
      }
      setError(de?'E-Mail oder Passwort falsch.':'Invalid email or password.')
      setLoading(false)
    }
    // onAuthStateChange fires → loadProfile → PublicOnly redirects by role
  }

  const doRegister = async () => {
    setError(''); setLoading(true)
    if (!name||!email||!pw) { setError(de?'Pflichtfelder ausfüllen.':'Fill required fields.'); setLoading(false); return }
    if (pw!==pw2)           { setError(de?'Passwörter stimmen nicht überein.':'Passwords do not match.'); setLoading(false); return }
    if (pw.length<8)        { setError(de?'Mindestens 8 Zeichen.':'Min. 8 characters.'); setLoading(false); return }
    const { data, error:e } = await supabase.auth.signUp({
      email, password:pw,
      options:{ data:{ full_name:name, venue_name:venue||name }, emailRedirectTo:`${window.location.origin}/dashboard` }
    })
    if (e) { setError(e.message); setLoading(false); return }
    // Trigger auto-confirms email, so try signing in immediately
    const { error:signInErr } = await supabase.auth.signInWithPassword({ email, password:pw })
    if (signInErr) { setError(signInErr.message); setLoading(false) }
    // onAuthStateChange fires → loadProfile → PublicOnly redirects by role
  }

  const doReset = async () => {
    setError(''); setLoading(true)
    const { error:e } = await supabase.auth.resetPasswordForEmail(email, { redirectTo:`${window.location.origin}/auth?mode=reset` })
    if (e) setError(e.message); else setSent(true)
    setLoading(false)
  }

  const SubmitBtn = ({ onClick, label }) => (
    <button onClick={onClick} disabled={loading} style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', cursor:loading?'wait':'pointer', background:loading?C.dim:grad(C.purple,C.pink), color:C.white, fontWeight:700, fontSize:15, fontFamily:'inherit', marginTop:6 }}>
      {loading?'...' : label}
    </button>
  )

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle,${C.purple}33 0%,transparent 70%)`, top:'-10%', left:'-10%', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle,${C.pink}22 0%,transparent 70%)`, bottom:'-10%', right:'-10%', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:440, padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <ScenvyLogoFull height={46} style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>app.scenvy.de</div>
        </div>

        {sent ? (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:22, padding:32, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{de?'E-Mail gesendet!':'Email sent!'}</div>
            <div style={{ fontSize:14, color:C.muted, marginBottom:24 }}>
              {mode==='register' ? (de?'Bestätige deine E-Mail-Adresse.':'Confirm your email address.') : (de?'Prüfe deinen Posteingang.':'Check your inbox.')}
            </div>
            <button onClick={()=>{setSent(false);setMode('login')}} style={{ padding:'11px 28px', borderRadius:12, border:'none', background:grad(C.purple,C.pink), color:C.white, cursor:'pointer', fontWeight:700, fontSize:14, fontFamily:'inherit' }}>
              {de?'Zurück zum Login':'Back to Login'}
            </button>
          </div>
        ) : (
          <>
            {mode!=='forgot' && (
              <div style={{ display:'flex', background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:4, marginBottom:20 }}>
                {[['login',de?'Einloggen':'Sign In'],['register',de?'Registrieren':'Sign Up']].map(([m,label])=>(
                  <button key={m} onClick={()=>{setMode(m);setError('')}} style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', cursor:'pointer', background:mode===m?C.purple:'transparent', color:mode===m?C.white:C.muted, fontWeight:mode===m?700:400, fontSize:14, fontFamily:'inherit', transition:'all .2s' }}>{label}</button>
                ))}
              </div>
            )}

            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:22, padding:28 }}>
              {mode==='forgot' && <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>{de?'Passwort zurücksetzen':'Reset Password'}</div>}

              {mode==='register' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <F label={de?'NAME *':'NAME *'} value={name} onChange={setName} placeholder="Max Mustermann"/>
                  <F label={de?'VENUE':'VENUE'} value={venue} onChange={setVenue} placeholder="Mein Restaurant"/>
                </div>
              )}

              <F label="E-MAIL *" value={email} onChange={setEmail} placeholder="deine@email.de" type="email" onEnter={mode==='login'?doLogin:mode==='forgot'?doReset:undefined}/>

              {mode!=='forgot' && <FPw label={de?'PASSWORT *':'PASSWORD *'} value={pw} onChange={setPw} onEnter={mode==='login'?doLogin:undefined} hint={mode==='register'?(de?'Mindestens 8 Zeichen':'Min. 8 characters'):undefined}/>}
              {mode==='register' && <FPw label={de?'PASSWORT WIEDERHOLEN *':'CONFIRM PASSWORD *'} value={pw2} onChange={setPw2}/>}

              {error && <div style={{ fontSize:13, color:C.pink, marginBottom:14, padding:'10px 14px', background:`${C.pink}18`, borderRadius:8 }}>{error}</div>}

              <SubmitBtn onClick={mode==='login'?doLogin:mode==='register'?doRegister:doReset}
                label={mode==='login'?(de?'Einloggen →':'Sign In →'):mode==='register'?(de?'Account erstellen →':'Create Account →'):(de?'Link senden →':'Send Link →')}/>

              <div style={{ textAlign:'center', marginTop:14 }}>
                {mode==='login' && <span onClick={()=>{setMode('forgot');setError('')}} style={{ fontSize:12, color:C.muted, cursor:'pointer' }}>{de?'Passwort vergessen?':'Forgot password?'}</span>}
                {mode==='forgot' && <span onClick={()=>{setMode('login');setError('')}} style={{ fontSize:13, color:C.purple, cursor:'pointer', fontWeight:600 }}>← {de?'Zurück':'Back'}</span>}
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign:'center', marginTop:20 }}>
          <span onClick={()=>nav('/')} style={{ fontSize:13, color:C.muted, cursor:'pointer' }}>← {de?'Zur Startseite':'Homepage'}</span>
        </div>
      </div>
    </div>
  )
}
