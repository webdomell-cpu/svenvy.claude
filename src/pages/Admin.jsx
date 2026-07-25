import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, grad } from '@/tokens'
import { ScenvyLogoFull } from '@/components/ScenvyLogo'
import { useTenants, useUpdateTenant, useDeleteTenant } from '@/lib/db'
import { useAuth } from '@/lib/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, TrendingUp, MapPin, Film, Activity, LogOut, RefreshCw, Save, Mail, Shield, Building2, CreditCard, X, ChevronRight, Trash2, Power, CheckCircle, AlertCircle } from 'lucide-react'

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
  const deleteTenant = useDeleteTenant()

  const [toast, setToast]       = useState(null)
  const [tab, setTab]           = useState('tenants')
  const [editTenant, setEditTenant] = useState(null)
  const [config, setConfig]     = useState(() => {
    const saved = localStorage.getItem('scenvy_platform_config')
    return saved ? JSON.parse(saved) : {
      contact_email: '', support_email: '',
      stripe_pk: '', stripe_secret: '', stripe_webhook: '',
      resend_key: '', from_email: 'noreply@scenvy.de',
    }
  })

  const notify = msg => { setToast(msg); setTimeout(()=>setToast(null),3000) }

  const mrr   = tenants.reduce((s,t)=>s+(PLAN_MRR[t.plan]||0),0)
  const locs  = tenants.reduce((s,t)=>s+(t.locations_count||0),0)
  const reels = tenants.reduce((s,t)=>s+(t.reels_count||0),0)

  const setPlan = async (id, plan) => {
    try { await updateTenant.mutateAsync({ id, updates:{ plan } }); notify(`Plan → ${plan}`) }
    catch(e) { notify('❌ ' + e.message) }
  }

  const toggleTenantStatus = async (t) => {
    const newStatus = t.status === 'active' ? 'suspended' : 'active'
    try {
      await updateTenant.mutateAsync({ id: t.id, updates: { status: newStatus } })
      notify(newStatus === 'active' ? '✅ Tenant aktiviert' : '⛔ Tenant deaktiviert')
    } catch (e) {
      notify('❌ ' + e.message)
    }
  }

  const handleDeleteTenant = async (t) => {
    if (!window.confirm(`Soll der Tenant "${t.name}" wirklich gelöscht werden? Alle Standorte & Reels werden dabei gelöscht!`)) return
    try {
      await deleteTenant.mutateAsync(t.id)
      notify('🗑️ Tenant gelöscht')
      if (editTenant?.id === t.id) setEditTenant(null)
    } catch (e) {
      notify('❌ ' + e.message)
    }
  }

  const saveConfig = () => {
    localStorage.setItem('scenvy_platform_config', JSON.stringify(config))
    notify('✅ Platform-Konfiguration gespeichert')
  }

  const tabs = [
    {id:'tenants', label:'Mandanten', icon:<Users size={15}/>},
    {id:'stripe',  label:'Stripe & Billing', icon:<CreditCard size={15}/>},
    {id:'email',   label:'E-Mail & Forwarding', icon:<Mail size={15}/>},
    {id:'features',label:'Feature Flags', icon:<Shield size={15}/>},
  ]

  const [flags, setFlags] = useState([
    {n:'AI Generator',on:true,c:C.purple},{n:'Social Import',on:true,c:C.blue},
    {n:'Geo Targeting',on:false,c:C.pink},{n:'Gamification',on:false,c:C.orange},
    {n:'White Label',on:true,c:C.purple},{n:'API Access',on:false,c:C.blue},
    {n:'Analytics Pro',on:true,c:C.green},{n:'Scheduling AI',on:false,c:C.pink},
  ])

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Inter',sans-serif",color:C.white}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top bar */}
      <div style={{height:58,background:C.card,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 28px',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
          <ScenvyLogoFull height={28} />
          <span style={{fontSize:11,color:C.muted,marginLeft:8}}>/ Platform Admin</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:12,color:C.muted}}>{user?.email}</span>
          <button onClick={logout} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>

      <div style={{padding:28,maxWidth:1300,margin:'0 auto'}}>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>PLATFORM ADMIN</div>
          <div style={{fontSize:28,fontWeight:800}}>Global Overview</div>
        </div>

        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:24}}>
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

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:20,background:C.card,borderRadius:12,padding:4,border:`1px solid ${C.border}`,width:'fit-content'}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',borderRadius:9,border:'none',cursor:'pointer',background:tab===t.id?C.purple:'transparent',color:tab===t.id?C.white:C.muted,fontWeight:tab===t.id?700:500,fontSize:13,fontFamily:'inherit',transition:'all .2s'}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tenants Tab */}
        {tab==='tenants' && (
          <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontSize:14,fontWeight:700}}>All Tenants ({tenants.length})</div>
              <button onClick={()=>notify('Invite via Supabase Auth → invite user')} style={{padding:'8px 16px',borderRadius:8,border:'none',background:C.purple,color:C.white,cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit'}}>+ Invite Tenant</button>
            </div>
            {isLoading ? (
              <div style={{padding:40,textAlign:'center',color:C.muted}}>Lade Tenants...</div>
            ) : tenants.length === 0 ? (
              <div style={{padding:40,textAlign:'center',color:C.muted}}>Noch keine Tenants.</div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 0.6fr 0.6fr 0.7fr 1.1fr 1.5fr',gap:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
                  {['Tenant','Plan','Locs','Reels','MRR','Status','Aktionen'].map((h,i)=>(
                    <div key={i} style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:1}}>{h}</div>
                  ))}
                </div>
                {tenants.map(t=>(
                  <div key={t.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 0.6fr 0.6fr 0.7fr 1.1fr 1.5fr',gap:10,padding:'13px 0',borderBottom:`1px solid ${C.border}`,alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{t.name}</div>
                      <div style={{fontSize:10,color:C.muted}}>{t.company_city?t.company_city+' · ':''}{t.id?.slice(0,8)}...</div>
                    </div>
                    <select value={t.plan||'starter'} onChange={e=>setPlan(t.id,e.target.value)} style={{fontSize:10,fontWeight:700,padding:'4px 8px',borderRadius:7,border:'none',cursor:'pointer',background:`${PLAN_C[t.plan||'starter']}28`,color:PLAN_C[t.plan||'starter'],outline:'none',fontFamily:'inherit'}}>
                      <option value="starter">STARTER</option>
                      <option value="pro">PRO</option>
                      <option value="enterprise">ENT.</option>
                    </select>
                    <div style={{fontSize:13,fontWeight:700,color:C.blue}}>{t.locations_count||0}</div>
                    <div style={{fontSize:13,fontWeight:700}}>{t.reels_count||0}</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.green}}>€{PLAN_MRR[t.plan||'starter']||0}</div>
                    <div>
                      <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:t.status==='active'?`${C.green}22`:t.status==='suspended'?`${C.pink}22`:`${C.orange}22`,color:t.status==='active'?C.green:t.status==='suspended'?C.pink:C.orange,border:`1px solid ${t.status==='active'?C.green:t.status==='suspended'?C.pink:C.orange}44`}}>
                        {t.status==='active'?'● Active':t.status==='suspended'?'⛔ Deaktiviert':'⏳ Trial'}
                      </span>
                    </div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <button onClick={()=>toggleTenantStatus(t)}
                        style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${t.status==='active'?C.orange:C.green}`,background:t.status==='active'?`${C.orange}15`:`${C.green}15`,color:t.status==='active'?C.orange:C.green,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4}}>
                        <Power size={11}/> {t.status==='active'?'Deaktivieren':'Aktivieren'}
                      </button>
                      <button onClick={()=>setEditTenant(t)} style={{padding:'5px 8px',borderRadius:6,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',display:'flex',alignItems:'center'}} title="Bearbeiten">
                        <ChevronRight size={14}/>
                      </button>
                      <button onClick={()=>handleDeleteTenant(t)} style={{padding:'5px 8px',borderRadius:6,border:`1px solid ${C.pink}44`,background:`${C.pink}11`,color:C.pink,cursor:'pointer',display:'flex',alignItems:'center'}} title="Löschen">
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Tenant Edit Drawer */}
            {editTenant && (
              <TenantEditDrawer tenant={editTenant} onClose={()=>setEditTenant(null)} onDelete={()=>handleDeleteTenant(editTenant)} onSave={async (updates)=>{
                try { await updateTenant.mutateAsync({ id:editTenant.id, updates }); notify('✅ Tenant aktualisiert'); setEditTenant(null) }
                catch(e) { notify('❌ ' + e.message) }
              }} />
            )}
          </div>
        )}

        {/* Stripe Tab */}
        {tab==='stripe' && (
          <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,maxWidth:700}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${C.purple}22`,display:'flex',alignItems:'center',justifyContent:'center'}}><CreditCard size={18} color={C.purple}/></div>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>Stripe Konfiguration</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Payment-Keys für Abonnements und Billing</div>
              </div>
            </div>
            <div style={{background:`${C.purple}0A`,border:`1px solid ${C.purple}33`,borderRadius:12,padding:14,marginBottom:18,fontSize:13,color:C.muted}}>
              Trage deine Stripe-Keys ein, um Zahlungen zu aktivieren. Die Keys werden sicher in den Vercel Environment Variables gespeichert.
            </div>
            <div style={{display:'grid',gap:16}}>
              <ConfigField label="STRIPE PUBLISHABLE KEY" value={config.stripe_pk} onChange={v=>setConfig(c=>({...c,stripe_pk:v}))} placeholder="pk_live_..." />
              <ConfigField label="STRIPE SECRET KEY" value={config.stripe_secret} onChange={v=>setConfig(c=>({...c,stripe_secret:v}))} placeholder="sk_live_..." type="password" />
              <ConfigField label="STRIPE WEBHOOK SECRET" value={config.stripe_webhook} onChange={v=>setConfig(c=>({...c,stripe_webhook:v}))} placeholder="whsec_..." type="password" />
            </div>
            <button onClick={saveConfig} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:10,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit',marginTop:20}}>
              <Save size={15}/> Konfiguration speichern
            </button>
          </div>
        )}

        {/* Email Tab */}
        {tab==='email' && (
          <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`,maxWidth:700}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${C.blue}22`,display:'flex',alignItems:'center',justifyContent:'center'}}><Mail size={18} color={C.blue}/></div>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>E-Mail & Forwarding</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Empfänger für Kontaktformulare und Support-Anfragen</div>
              </div>
            </div>
            <div style={{background:`${C.blue}0A`,border:`1px solid ${C.blue}33`,borderRadius:12,padding:14,marginBottom:18,fontSize:13,color:C.muted}}>
              Füge <code style={{background:C.card2,padding:'2px 6px',borderRadius:4,color:C.blue}}>RESEND_API_KEY</code> in Vercel env vars hinzu, damit echte E-Mails versendet werden.
            </div>
            <div style={{display:'grid',gap:16}}>
              <ConfigField label="KONTAKT / ENTERPRISE-ANFRAGEN" value={config.contact_email} onChange={v=>setConfig(c=>({...c,contact_email:v}))} placeholder="kontakt@scenvy.de" icon={<Mail size={14} color={C.muted}/>} />
              <ConfigField label="SUPPORT-E-MAIL" value={config.support_email} onChange={v=>setConfig(c=>({...c,support_email:v}))} placeholder="support@scenvy.de" icon={<Shield size={14} color={C.muted}/>} />
              <ConfigField label="RESEND API KEY" value={config.resend_key} onChange={v=>setConfig(c=>({...c,resend_key:v}))} placeholder="re_..." type="password" />
              <ConfigField label="ABSENDER-ADRESSE" value={config.from_email} onChange={v=>setConfig(c=>({...c,from_email:v}))} placeholder="noreply@scenvy.de" />
            </div>
            <button onClick={saveConfig} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 24px',borderRadius:10,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit',marginTop:20}}>
              <Save size={15}/> E-Mail-Einstellungen speichern
            </button>
          </div>
        )}

        {/* Feature Flags Tab */}
        {tab==='features' && (
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
        )}
      </div>

      {toast&&<div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',background:C.purple,color:C.white,padding:'12px 24px',borderRadius:14,fontSize:13,fontWeight:600,zIndex:9999,animation:'fadeUp .25s ease'}}>{toast}</div>}
    </div>
  )
}

function ConfigField({ label, value, onChange, placeholder, type='text', icon }) {
  return (
    <div>
      <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>{label}</label>
      <div style={{position:'relative'}}>
        {icon&&<span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',display:'flex'}}>{icon}</span>}
        <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{width:'100%',padding:`11px 14px ${icon?'11px 34px':'11px 14px'}`,borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
      </div>
    </div>
  )
}

function TenantEditDrawer({ tenant, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: tenant.name||'', plan: tenant.plan||'starter', status: tenant.status||'trial',
    company_name: tenant.company_name||'', company_address: tenant.company_address||'',
    company_zip: tenant.company_zip||'', company_city: tenant.company_city||'',
    contact_name: tenant.contact_name||'', contact_email: tenant.contact_email||'',
    contact_phone: tenant.contact_phone||'', website: tenant.website||'',
    stripe_customer_id: tenant.stripe_customer_id||'',
  })
  const setF = (k,v) => setForm(f=>({...f,[k]:v}))

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:200,display:'flex',justifyContent:'flex-end',animation:'fadeUp .2s ease'}} onClick={onClose}>
      <div style={{width:480,background:C.card,height:'100vh',overflowY:'auto',borderLeft:`1px solid ${C.border}`,padding:28}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <Building2 size={20} color={C.purple}/>
            <div style={{fontSize:18,fontWeight:800}}>{tenant.name}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',padding:4}}><X size={20}/></button>
        </div>

        <div style={{display:'grid',gap:14}}>
          <Field label="TENANT NAME" value={form.name} onChange={v=>setF('name',v)} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>PLAN</label>
              <select value={form.plan} onChange={e=>setF('plan',e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>STATUS</label>
              <select value={form.status} onChange={e=>setF('status',e.target.value)} style={{width:'100%',padding:'11px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <Field label="FIRMENNAME" value={form.company_name} onChange={v=>setF('company_name',v)} />
          <Field label="ADRESSE" value={form.company_address} onChange={v=>setF('company_address',v)} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="PLZ" value={form.company_zip} onChange={v=>setF('company_zip',v)} />
            <Field label="STADT" value={form.company_city} onChange={v=>setF('company_city',v)} />
          </div>
          <Field label="KONTAKTNAME" value={form.contact_name} onChange={v=>setF('contact_name',v)} />
          <Field label="KONTAKT-E-MAIL" value={form.contact_email} onChange={v=>setF('contact_email',v)} type="email" />
          <Field label="TELEFON" value={form.contact_phone} onChange={v=>setF('contact_phone',v)} type="tel" />
          <Field label="WEBSITE" value={form.website} onChange={v=>setF('website',v)} />
          <Field label="STRIPE CUSTOMER ID" value={form.stripe_customer_id} onChange={v=>setF('stripe_customer_id',v)} />
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:24}}>
          <button onClick={()=>onSave(form)} style={{width:'100%',padding:'13px 0',borderRadius:12,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:15,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Save size={16}/> Änderungen speichern
          </button>
          
          {onDelete && (
            <button onClick={onDelete} style={{width:'100%',padding:'11px 0',borderRadius:12,border:`1px solid ${C.pink}55`,background:`${C.pink}11`,color:C.pink,cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <Trash2 size={14}/> Tenant löschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type='text' }) {
  return (
    <div>
      <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>{label}</label>
      <input value={value||''} onChange={e=>onChange(e.target.value)} type={type}
        style={{width:'100%',padding:'11px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
    </div>
  )
}
