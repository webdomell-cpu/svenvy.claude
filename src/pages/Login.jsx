import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { C, grad } from '../tokens.js'
import { Eye, EyeOff } from 'lucide-react'

const DEMO_ACCOUNTS = [
  { id: 'fc999240-f01f-4054-8e82-6c4b0875e62c', email:'admin@scenvy.de', password:'admin123', role:'admin',  name:'Dominik',     venue:'SCENVY HQ',         tenant_id: 'a0000000-0000-0000-0000-000000000001' },
  { id: '98f577a6-7d9a-4b15-9e2c-c86b9648e9e8', email:'venue@scenvy.de', password:'venue123', role:'tenant_owner', name:'Marina Group', venue:'The Marina Group',  tenant_id: 'b0000000-0000-0000-0000-000000000002' },
]

function getUsers()        { try { return JSON.parse(localStorage.getItem('scenvy_users')||'[]') } catch { return [] } }
function saveUsers(users)  { localStorage.setItem('scenvy_users', JSON.stringify(users)) }

function Field({ label, value, onChange, placeholder, type='text', onEnter }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6, fontWeight:600, letterSpacing:1 }}>{label}</label>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
        onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
        style={{ width:'100%', padding:'11px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
    </div>
  )
}
function FieldPw({ label, value, onChange, show, setShow, onEnter, hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, color:C.muted, display:'block', marginBottom:6, fontWeight:600, letterSpacing:1 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder="••••••••" type={show?'text':'password'}
          onKeyDown={e=>e.key==='Enter'&&onEnter?.()}
          style={{ width:'100%', padding:'11px 44px 11px 14px', borderRadius:9, border:`1px solid ${C.border}`, background:C.bg, color:C.white, fontSize:13, outline:'none', fontFamily:'inherit' }}/>
        <button onClick={()=>setShow(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.muted, cursor:'pointer' }}>
          {show?<EyeOff size={16}/>:<Eye size={16}/>}
        </button>
      </div>
      {hint&&<div style={{ fontSize:11, color:C.dim, marginTop:4 }}>{hint}</div>}
    </div>
  )
}
function ErrBox({ msg }) {
  return <div style={{ fontSize:13, color:C.pink, marginBottom:14, padding:'10px 14px', background:`${C.pink}18`, borderRadius:8 }}>{msg}</div>
}
function SubmitBtn({ loading, onClick, label }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ width:'100%', padding:'13px 0', borderRadius:12, border:'none', cursor:loading?'wait':'pointer', background:loading?C.dim:grad(C.purple,C.pink), color:C.white, fontWeight:700, fontSize:15, fontFamily:'inherit', transition:'all .2s', marginTop:6 }}>
      {loading?'...':label}
    </button>
  )
}

export default function Login() {
  const nav = useNavigate()
  const { login, signup } = useAuth()
  const [params] = useSearchParams()
  const [mode,   setMode]   = useState(params.get('mode')==='register'?'register':'login')
  const [showPw, setShowPw] = useState(false)
  const [error,  setError]  = useState('')
  const [loading,setLoading]= useState(false)
  const [email,  setEmail]  = useState('')
  const [pw,     setPw]     = useState('')
  const [rName,  setRName]  = useState('')
  const [rVenue, setRVenue] = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPw,    setRPw]   = useState('')
  const [rPw2,   setRPw2]  = useState('')
  const isDE = navigator.language?.startsWith('de')

  const doLogin = async () => {
    setError(''); setLoading(true)
    const { user, error: e } = await login(email, pw)
    if (e || !user) {
      setError(isDE?'E-Mail oder Passwort falsch.':'Invalid email or password.')
      setLoading(false)
      return
    }
    nav('/dashboard')
  }

  const doRegister = async () => {
    setError(''); setLoading(true)
    if (!rName||!rEmail||!rPw) { setError(isDE?'Bitte alle Pflichtfelder ausfüllen.':'Please fill in all required fields.'); setLoading(false); return }
    if (rPw!==rPw2)            { setError(isDE?'Passwörter stimmen nicht überein.':'Passwords do not match.'); setLoading(false); return }
    if (rPw.length<6)          { setError(isDE?'Passwort mindestens 6 Zeichen.':'Password must be at least 6 characters.'); setLoading(false); return }

    const { user, error: e } = await signup(rEmail, rPw, rName, rVenue)
    if (e) {
      setError(e.message || (isDE ? 'Registrierung fehlgeschlagen.' : 'Registration failed.'))
      setLoading(false)
      return
    }
    nav('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif", position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle,${C.purple}33 0%,transparent 70%)`, top:'-10%', left:'-10%', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle,${C.pink}22 0%,transparent 70%)`, bottom:'-10%', right:'-10%', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:440, padding:'0 20px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:grad(C.purple,C.pink), display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:24, margin:'0 auto 12px' }}>S</div>
          <div style={{ fontSize:22, fontWeight:800, letterSpacing:2 }}>SCENVY</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>
            {mode==='login'?(isDE?'In deinen Account einloggen':'Sign in to your account'):(isDE?'Kostenlosen Account erstellen':'Create your free account')}
          </div>
        </div>

        {/* Tab */}
        <div style={{ display:'flex', background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:4, marginBottom:24 }}>
          {[['login',isDE?'Einloggen':'Sign In'],['register',isDE?'Registrieren':'Sign Up']].map(([m,label])=>(
            <button key={m} onClick={()=>{setMode(m);setError('')}} style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', cursor:'pointer', background:mode===m?C.purple:'transparent', color:mode===m?C.white:C.muted, fontWeight:mode===m?700:400, fontSize:14, fontFamily:'inherit', transition:'all .2s' }}>{label}</button>
          ))}
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:22, padding:28 }}>
          {mode==='login' ? (
            <>
              <Field label={isDE?'E-MAIL':'EMAIL'} value={email} onChange={setEmail} placeholder="deine@email.de" type="email" onEnter={doLogin}/>
              <FieldPw label={isDE?'PASSWORT':'PASSWORD'} value={pw} onChange={setPw} show={showPw} setShow={setShowPw} onEnter={doLogin}/>
              {error&&<ErrBox msg={error}/>}
              <SubmitBtn loading={loading} onClick={doLogin} label={isDE?'Einloggen →':'Sign In →'}/>
              <div style={{ textAlign:'center', marginTop:16 }}>
                <span style={{ fontSize:13, color:C.muted }}>{isDE?'Noch kein Account? ':'No account? '}</span>
                <span onClick={()=>{setMode('register');setError('')}} style={{ fontSize:13, color:C.purple, cursor:'pointer', fontWeight:600 }}>{isDE?'Kostenlos registrieren →':'Sign up free →'}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:0 }}>
                <Field label={isDE?'DEIN NAME *':'YOUR NAME *'} value={rName} onChange={setRName} placeholder={isDE?'Max Mustermann':'Your name'}/>
                <Field label={isDE?'VENUE / FIRMA':'VENUE / COMPANY'} value={rVenue} onChange={setRVenue} placeholder={isDE?'Mein Restaurant':'My Venue'}/>
              </div>
              <Field label="E-MAIL *" value={rEmail} onChange={setREmail} placeholder="deine@email.de" type="email"/>
              <FieldPw label={isDE?'PASSWORT *':'PASSWORD *'} value={rPw} onChange={setRPw} show={showPw} setShow={setShowPw} hint={isDE?'Mindestens 6 Zeichen':'Min. 6 characters'}/>
              <FieldPw label={isDE?'PASSWORT WIEDERHOLEN *':'CONFIRM PASSWORD *'} value={rPw2} onChange={setRPw2} show={showPw} setShow={setShowPw}/>
              {error&&<ErrBox msg={error}/>}
              <SubmitBtn loading={loading} onClick={doRegister} label={isDE?'Account erstellen →':'Create Account →'}/>
              <div style={{ textAlign:'center', marginTop:14 }}>
                <span style={{ fontSize:13, color:C.muted }}>{isDE?'Bereits registriert? ':'Already registered? '}</span>
                <span onClick={()=>{setMode('login');setError('')}} style={{ fontSize:13, color:C.purple, cursor:'pointer', fontWeight:600 }}>{isDE?'Einloggen →':'Sign in →'}</span>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <span onClick={()=>nav('/')} style={{ fontSize:13, color:C.muted, cursor:'pointer' }}>← {isDE?'Zurück zu app.scenvy.de':'Back to app.scenvy.de'}</span>
        </div>
      </div>
    </div>
  )
}
