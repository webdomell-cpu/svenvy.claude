import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, grad } from '@/tokens'
import { useTenants, useUpdateTenant } from '@/lib/db'
import { useAuth } from '@/lib/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, MapPin, Film, Activity, LogOut, RefreshCw, Save, Mail, Shield } from 'lucide-react'

const MRR_TREND = [
  {month:'Jan',mrr:0},{month:'Feb',mrr:0},{month:'Mar',mrr:29},
  {month:'Apr',mrr:58},{month:'May',mrr:87},{month:'Jun',mrr:116},
]

const PLAN_C   = { enterprise:C.purple, pro:C.blue, starter:C.muted }
const PLAN_MRR = { enterprise:299, pro:29, starter:0 }

export default function Admin() {
  const nav = useNavigate()
  const { user, logout } = useAuth()
  const { data: tenants=[], isLoading } = useTenants()
  const updateTenant = useUpdateTenant()

  const [toast,        setToast]        = useState(null)
  const [emailOpen,    setEmailOpen]    = useState(false)
  const [contactEmail, setContactEmail] = useState(() => localStorage.getItem('scenvy_contact_email')||'')
  const [supportEmail, setSupportEmail] = useState(() => localStorage.getItem('scenvy_support_email')||'')
  const [flags, setFlags] = useState([
    {n:'AI Generator',on:true,c:C.purple},{n:'Social Import',on:true,c:C.blue},
    {n:'Geo Targeting',on:false,c:C.pink},{n:'Gamification',on:false,c:C.orange},
    {n:'White Label',on:true,c:C.purple},{n:'API Access',on:false,c:C.blue},
    {n:'Analytics Pro',on:true,c:C.green},{n:'Scheduling AI',on:false,c:C.pink},
  ])

  const notify = msg => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const mrr   = tenants.reduce((s,t)=>s+(PLAN_MRR[t.plan]||0),0)
  const locs  = tenants.reduce((s,t)=>s+(t.locations_count||0),0)
  const reels = tenants.reduce((s,t)=>s+(t.reels_count||0),0)

  const setPlan = async (id, plan) => {
    try { await updateTenant.mutateAsync({ id, updates:{ plan } }); notify(`Plan → ${plan}`) }
    catch(e) { notify('❌ ' + e.message) }
  }

  const saveEmails = () => {
    localStorage.setItem('scenvy_contact_email', contactEmail)
    localStorage.setItem('scenvy_support_email', supportEmail)
    notify('✅ E-Mail-Einstellungen gespeichert')
  }

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Inter',sans-serif",color:C.white}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{height:58,background:C.card,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 28px',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
          <div style={{width:30,height:30,borderRadius:8,background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14}}>S</div>
          <span style={{fontWeight:800,fontSize:14,letterSpacing:2}}>SCENVY</span>
          <span style={{fontSize:11,color:C.muted,marginLeft:4}}>/ Super Admin</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:12,color:C.muted}}>{user?.email}</span>
          <button onClick={logout} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>

      <div style={{padding:28,maxWidth:1300,margin:'0 auto'}}>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>SUPER ADMIN</div>
          <div style={{fontSize:28,fontWeight:800}}>Global Overview 🛠️</div>
        </div>

        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:28}}>
          {[
            {l:'Tenants',  v:isLoading?'…':tenants.length, c:C.purple, i:<Users size={17} color={C.purple}/>},
            {l:'MRR',      v:isLoading?'…':`€${mrr}`,      c:C.green,  i:<TrendingUp size={17} color={C.green}/>},
            {l:'Locations',v:isLoading?'…':locs,            c:C.blue,   i:<MapPin size={17} color={C.blue}/>},
            {l:'Reels',    v:isLoading?'…':reels,           c:C.pink,   i:<Film size={17} color={C.pink}/>},
            {l:'Uptime',   v:'99.9%',                        c:C.green,  i:<Activity size={17} color={C.green}/>},
          ].map((s,i)=>(
            <div key={i} style={{background:C.card,borderRadius:14,padding:18,border:`1px solid ${C.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><span style={{fontSize:11,color:C.muted}}>{s.l}</span>{s.i}</div>
              <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* MRR Chart + Plan Breakdown */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:24}}>
          <div style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>MRR Growth</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={MRR_TREND}>
                <XAxis dataKey="month" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.white}} formatter={v=>[`€${v}`,'MRR']}/>
                <Line dataKey="mrr" stroke={C.green} strokeWidth={2.5} dot={{fill:C.green,r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:18}}>Plan Breakdown</div>
            {['enterprise','pro','starter'].map(key=>{
              const count = tenants.filter(t=>t.plan===key).length
              const rowMrr = count * (PLAN_MRR[key]||0)
              return (
                <div key={key} style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:13,fontWeight:600,color:PLAN_C[key],textTransform:'capitalize'}}>{key}</span>
                    <span style={{fontSize:11,color:C.muted}}>{count} · €{rowMrr}/mo</span>
                  </div>
                  <div style={{height:6,background:C.card2,borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:tenants.length?`${(count/tenants.length)*100}%`:'0%',background:PLAN_C[key],borderRadius:3,transition:'width .5s'}}/>
                  </div>
                </div>
              )
            })}
            <div style={{marginTop:24,padding:14,background:C.card2,borderRadius:10}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:5,letterSpacing:1}}>MONTHLY RECURRING REVENUE</div>
              <div style={{fontSize:28,fontWeight:800,color:C.green}}>€{mrr}</div>
            </div>
          </div>
        </div>

        {/* Tenant Table */}
        <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700}}>All Tenants</div>
            <button onClick={()=>notify('Invite via Supabase Auth → invite user')} style={{padding:'8px 16px',borderRadius:8,border:'none',background:C.purple,color:C.white,cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit'}}>+ Invite Tenant</button>
          </div>
          {isLoading ? (
            <div style={{padding:40,textAlign:'center',color:C.muted}}>Lade Tenants...</div>
          ) : tenants.length === 0 ? (
            <div style={{padding:40,textAlign:'center',color:C.muted}}>Noch keine Tenants. Führe seed.sql in Supabase aus.</div>
          ) : (
            <>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 0.7fr 0.7fr 0.8fr 0.8fr',gap:0,paddingBottom:10,borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
                {['Tenant','Plan','Locs','Reels','MRR','Status'].map(h=>(
                  <div key={h} style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>{h}</div>
                ))}
              </div>
              {tenants.map(t=>(
                <div key={t.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 0.7fr 0.7fr 0.8fr 0.8fr',gap:0,padding:'13px 0',borderBottom:`1px solid ${C.border}`,alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{t.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{t.id?.slice(0,8)}...</div>
                  </div>
                  <select value={t.plan||'starter'} onChange={e=>setPlan(t.id,e.target.value)} style={{fontSize:10,fontWeight:700,padding:'4px 8px',borderRadius:7,border:'none',cursor:'pointer',background:`${PLAN_C[t.plan||'starter']}28`,color:PLAN_C[t.plan||'starter'],outline:'none',fontFamily:'inherit'}}>
                    <option value="starter">STARTER</option>
                    <option value="pro">PRO</option>
                    <option value="enterprise">ENT.</option>
                  </select>
                  <div style={{fontSize:13,fontWeight:700,color:C.blue}}>{t.locations_count||0}</div>
                  <div style={{fontSize:13,fontWeight:700}}>{t.reels_count||0}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.green}}>€{PLAN_MRR[t.plan||'starter']||0}</div>
                  <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:t.status==='active'?`${C.green}22`:`${C.orange}22`,color:t.status==='active'?C.green:C.orange,border:`1px solid ${t.status==='active'?C.green:C.orange}44`}}>
                    {t.status==='active'?'● Active':'⏳ Trial'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Email Settings */}
        <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:emailOpen?20:0,cursor:'pointer'}} onClick={()=>setEmailOpen(o=>!o)}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${C.purple}22`,display:'flex',alignItems:'center',justifyContent:'center'}}><Mail size={18} color={C.purple}/></div>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>E-Mail-Einstellungen</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Empfänger für Kontaktformulare und Support</div>
              </div>
            </div>
            <div style={{fontSize:20,color:C.muted,transform:emailOpen?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</div>
          </div>
          {emailOpen&&(
            <div style={{animation:'fadeUp .2s ease'}}>
              <div style={{background:`${C.purple}0A`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:14,marginBottom:18,fontSize:13,color:C.muted}}>
                💡 Füge <code style={{background:C.card2,padding:'2px 6px',borderRadius:4,color:C.blue}}>RESEND_API_KEY</code> + <code style={{background:C.card2,padding:'2px 6px',borderRadius:4,color:C.blue}}>CONTACT_EMAIL</code> in den Vercel Environment Variables hinzu, damit echte E-Mails versendet werden.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:18}}>
                <div>
                  <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:8,fontWeight:600,letterSpacing:1}}>📬 KONTAKT / ENTERPRISE-ANFRAGEN</label>
                  <div style={{position:'relative'}}>
                    <Mail size={14} color={C.muted} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
                    <input value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="kontakt@scenvy.de" type="email"
                      style={{width:'100%',padding:'11px 14px 11px 34px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                  </div>
                  <div style={{fontSize:11,color:C.dim,marginTop:5}}>Empfängt Enterprise-Anfragen vom Preise-Kontaktformular</div>
                </div>
                <div>
                  <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:8,fontWeight:600,letterSpacing:1}}>🛠️ SUPPORT-E-MAIL</label>
                  <div style={{position:'relative'}}>
                    <Shield size={14} color={C.muted} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}}/>
                    <input value={supportEmail} onChange={e=>setSupportEmail(e.target.value)} placeholder="support@scenvy.de" type="email"
                      style={{width:'100%',padding:'11px 14px 11px 34px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                  </div>
                  <div style={{fontSize:11,color:C.dim,marginTop:5}}>Empfängt Support-Anfragen</div>
                </div>
              </div>
              <button onClick={saveEmails} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 22px',borderRadius:10,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit'}}>
                <Save size={15}/>E-Mail-Einstellungen speichern
              </button>
            </div>
          )}
        </div>

        {/* Feature Flags */}
        <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:18}}>Feature Flags</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
            {flags.map((f,i)=>(
              <div key={i} onClick={()=>{setFlags(fs=>fs.map((x,j)=>i===j?{...x,on:!x.on}:x));notify(`${f.n} ${!f.on?'aktiviert':'deaktiviert'}`)}} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:C.card2,borderRadius:10,cursor:'pointer',border:`1px solid ${f.on?f.c+'44':C.border}`,transition:'border .2s'}}>
                <span style={{fontSize:12,fontWeight:600,color:f.on?C.white:C.muted}}>{f.n}</span>
                <div style={{width:36,height:20,borderRadius:10,background:f.on?f.c:C.dim,position:'relative',transition:'background .2s',flexShrink:0}}>
                  <div style={{width:14,height:14,borderRadius:'50%',background:C.white,position:'absolute',top:3,left:f.on?18:4,transition:'left .2s'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast&&<div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',background:C.purple,color:C.white,padding:'12px 24px',borderRadius:14,fontSize:13,fontWeight:600,zIndex:9999,animation:'fadeUp .25s ease'}}>{toast}</div>}
    </div>
  )
}
