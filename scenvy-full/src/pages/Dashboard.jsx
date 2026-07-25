import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, grad } from '@/tokens'
import { copyToClipboard, downloadQR, qrImageUrl } from '@/storage'
import { useAuth } from '@/lib/AuthContext'
import {
  useReels, useSaveReel, useDeleteReel,
  useLocations, useSaveLocation, useDeleteLocation,
  useAnalyticsSummary, uploadMedia
} from '@/lib/db'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Home, Film, MapPin, BarChart2, Sparkles, Settings, Menu,
  QrCode, Eye, MousePointer, Video, Plus, Trash2, RefreshCw,
  Copy, LogOut, Upload, Link, X, Image, ExternalLink, Edit2,
  Download, Globe, Save, Mail, Shield
} from 'lucide-react'

// ── i18n ─────────────────────────────────────────────────
const T = {
  de:{ nav:{overview:'Übersicht',reels:'Reels',locations:'Standorte',analytics:'Analytics',ai:'KI-Generator',qr:'QR-Codes',settings:'Einstellungen'}, logout:'Abmelden', thisWeek:'diese Woche', active:'Aktiv', inactive:'Inaktiv', scans:'Scans', watchRate:'Watch Rate', deactivate:'Deaktivieren', activate:'Aktivieren', save:'Speichern', cancel:'Abbrechen', edit:'Bearbeiten', delete:'Löschen' },
  en:{ nav:{overview:'Overview',reels:'Reels',locations:'Locations',analytics:'Analytics',ai:'AI Generator',qr:'QR Codes',settings:'Settings'}, logout:'Log out', thisWeek:'this week', active:'Active', inactive:'Inactive', scans:'Scans', watchRate:'Watch Rate', deactivate:'Deactivate', activate:'Activate', save:'Save', cancel:'Cancel', edit:'Edit', delete:'Delete' },
}

const pill=(label,color)=>(<span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:`${color}28`,color,border:`1px solid ${color}44`}}>{label}</span>)

// ── Reel Modal ────────────────────────────────────────────
function ReelModal({ reel, locs, tenantId, onClose, onSave, notify }) {
  const isEdit = !!reel?.id
  const [title,      setTitle]      = useState(reel?.title      || '')
  const [type,       setType]       = useState(reel?.type       || 'offer')
  const [locationId, setLocationId] = useState(reel?.location_id|| locs[0]?.id || '')
  const [ctaText,    setCtaText]    = useState(reel?.cta        || 'Order Now')
  const [ctaUrl,     setCtaUrl]     = useState(reel?.cta_url    || '')
  const [ctaAction,  setCtaAction]  = useState(reel?.cta_action || 'url')
  const [emoji,      setEmoji]      = useState(reel?.emoji      || '🍹')
  const [preview,    setPreview]    = useState(reel?.media_url  || null)
  const [uploading,  setUploading]  = useState(false)
  const fileRef = useRef()

  const colorMap = { offer:C.purple, event:C.pink, menu:C.blue, promo:C.orange }

  const handleFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    setUploading(true)
    try {
      const url = await uploadMedia(f, tenantId)
      setPreview(url)
      notify('✅ Datei hochgeladen')
    } catch { notify('❌ Upload fehlgeschlagen') }
    setUploading(false)
  }

  const handleDrop = (e) => { e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f){const inp=fileRef.current;inp.files=e.dataTransfer.files;handleFile({target:inp})} }

  const save = () => {
    if (!title.trim()) { notify('Bitte Titel eingeben'); return }
    const loc = locs.find(l=>l.id===locationId)
    onSave({
      ...(reel?.id ? {id:reel.id} : {}),
      tenant_id:   tenantId,
      location_id: locationId,
      title, type,
      cta:        ctaText,
      cta_url:    ctaUrl,
      cta_action: ctaAction,
      emoji,
      color:      colorMap[type]||C.purple,
      status:     reel?.status || 'draft',
      media_url:  preview,
      media_type: preview?.includes('.mp4')||preview?.includes('.mov') ? 'video' : 'image',
      // for UI display
      loc:        loc?.name || '',
      locationId, ctaUrl, ctaAction, mediaUrl:preview,
    })
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',backdropFilter:'blur(12px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:22,width:'100%',maxWidth:800,maxHeight:'90vh',overflow:'auto'}}>
        <div style={{padding:'20px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:C.card,zIndex:10}}>
          <div style={{fontWeight:700,fontSize:17}}>{isEdit?'✏️ Reel bearbeiten':'➕ Reel erstellen'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer'}}><X size={20}/></button>
        </div>
        <div style={{padding:24,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          {/* Left */}
          <div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:7,fontWeight:600,letterSpacing:1}}>FOTO / VIDEO</label>
              <div onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={()=>!uploading&&fileRef.current?.click()}
                style={{border:`2px dashed ${preview?C.purple:C.border}`,borderRadius:12,overflow:'hidden',cursor:'pointer',minHeight:110,display:'flex',alignItems:'center',justifyContent:'center',background:`${C.purple}08`,position:'relative'}}>
                {uploading ? <div style={{textAlign:'center'}}><RefreshCw size={24} color={C.purple} style={{animation:'spin 1s linear infinite'}}/><div style={{fontSize:12,color:C.muted,marginTop:8}}>Wird hochgeladen...</div></div>
                  : preview ? <><img src={preview} style={{width:'100%',maxHeight:160,objectFit:'cover'}} alt=""/><button onClick={e=>{e.stopPropagation();setPreview(null)}} style={{position:'absolute',top:6,right:6,background:C.pink,border:'none',borderRadius:'50%',width:24,height:24,color:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={11}/></button></>
                  : <div style={{textAlign:'center',padding:20}}><Upload size={26} color={C.purple} style={{marginBottom:8}}/><div style={{fontSize:13,color:C.muted}}>Hier klicken oder reinziehen</div><div style={{fontSize:11,color:C.dim,marginTop:3}}>MP4, MOV, JPG, PNG</div></div>
                }
                <input ref={fileRef} type="file" accept="video/*,image/*" onChange={handleFile} style={{display:'none'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginBottom:14}}>
              <div>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>TITEL *</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. Happy Hour Special" style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>EMOJI</label>
                <input value={emoji} onChange={e=>setEmoji(e.target.value)} style={{width:54,padding:'10px 0',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:22,outline:'none',textAlign:'center',fontFamily:'inherit'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>TYP</label>
                <select value={type} onChange={e=>setType(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.card2,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}>
                  <option value="offer">🏷️ Angebot</option><option value="event">🎉 Event</option><option value="menu">🍽️ Menü</option><option value="promo">⚡ Promo</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>STANDORT</label>
                <select value={locationId} onChange={e=>setLocationId(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.card2,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}>
                  {locs.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          {/* Right: CTA */}
          <div>
            <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,borderRadius:14,padding:18,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:14,display:'flex',alignItems:'center',gap:8}}><Link size={15} color={C.purple}/>CTA-Button</div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>BUTTON-TEXT</label>
                <input value={ctaText} onChange={e=>setCtaText(e.target.value)} placeholder="z.B. Jetzt bestellen" style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>AKTION</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {[['url','🔗 Link'],['phone','📞 Anruf'],['menu','🍽️ Menü'],['reserve','📅 Reservieren'],['order','🛒 Bestellen']].map(([v,l])=>(
                    <button key={v} onClick={()=>setCtaAction(v)} style={{padding:'7px 10px',borderRadius:8,border:`1px solid ${ctaAction===v?C.purple:C.border}`,background:ctaAction===v?`${C.purple}22`:'transparent',color:ctaAction===v?C.white:C.muted,fontSize:11,cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>ZIEL-URL / TELEFON</label>
                <input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)} placeholder={ctaAction==='phone'?'+49 123 456789':'https://...'} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              </div>
            </div>
            {/* Preview */}
            <div style={{background:C.card2,borderRadius:12,padding:14,border:`1px solid ${C.border}`}}>
              <div style={{fontSize:10,color:C.muted,marginBottom:8,letterSpacing:1}}>VORSCHAU</div>
              <div style={{background:`linear-gradient(160deg,${colorMap[type]||C.purple}44,${C.bg})`,borderRadius:10,padding:14,textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>{emoji}</div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{title||'Reel-Titel'}</div>
                {ctaUrl&&<div style={{fontSize:10,color:C.blue,marginBottom:6,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><ExternalLink size={9}/>{ctaUrl.replace('https://','')}</div>}
                <div style={{padding:'8px 0',borderRadius:8,background:grad(colorMap[type]||C.purple,C.pink),fontSize:12,fontWeight:700}}>{ctaText||'Button'} →</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{padding:'14px 24px',borderTop:`1px solid ${C.border}`,display:'flex',gap:12,justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{padding:'10px 22px',borderRadius:10,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>Abbrechen</button>
          <button onClick={save} disabled={uploading} style={{padding:'10px 28px',borderRadius:10,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit'}}>
            {isEdit?'✓ Speichern':'Reel speichern →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Location Modal ────────────────────────────────────────
function LocationModal({ loc, tenantId, onClose, onSave }) {
  const [name, setName] = useState(loc?.name||'')
  const [city, setCity] = useState(loc?.city||'')
  const save = () => {
    if (!name.trim()) return
    onSave({ ...(loc?.id?{id:loc.id}:{}), tenant_id:tenantId, name, city:city||'Dubai', active:loc?.active??true, scans:loc?.scans||0, wr:loc?.wr||0 })
    onClose()
  }
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(10px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:C.card,border:`1px solid ${C.purple}`,borderRadius:20,padding:28,width:460}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700}}>{loc?.id?'✏️ Standort bearbeiten':'📍 Neuer Standort'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>STANDORT-NAME *</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="z.B. Marina Walk"
            style={{width:'100%',padding:'11px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:14,outline:'none',fontFamily:'inherit'}}/>
        </div>
        <div style={{marginBottom:22}}>
          <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>STADT / BEREICH</label>
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="z.B. Dubai Marina"
            style={{width:'100%',padding:'11px 14px',borderRadius:9,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:14,outline:'none',fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:'11px 0',borderRadius:10,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>Abbrechen</button>
          <button onClick={save} style={{flex:2,padding:'11px 0',borderRadius:10,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit'}}>
            {loc?.id?'Speichern':'Erstellen & QR generieren'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────
function Sidebar({ page, setPage, open, setOpen, t, user, logout }) {
  const items = [
    {id:'overview',icon:<Home size={17}/>},{id:'reels',icon:<Film size={17}/>},{id:'locations',icon:<MapPin size={17}/>},
    {id:'analytics',icon:<BarChart2 size={17}/>},{id:'ai',icon:<Sparkles size={17}/>,badge:'✨'},{id:'qr',icon:<QrCode size={17}/>},{id:'settings',icon:<Settings size={17}/>},
  ]
  return (
    <div style={{width:open?220:58,background:C.card,borderRight:`1px solid ${C.border}`,flexShrink:0,display:'flex',flexDirection:'column',transition:'width .3s',overflow:'hidden'}}>
      {open&&(
        <div style={{padding:'14px 14px 12px',borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,marginBottom:8,letterSpacing:1}}>TENANT</div>
          <div style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',background:C.card2,borderRadius:9}}>
            <div style={{width:28,height:28,borderRadius:6,background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0}}>{(user?.name||'?')[0]}</div>
            <div><div style={{fontSize:12,fontWeight:700}}>{user?.tenant?.name||user?.name||'–'}</div><div style={{fontSize:10,color:C.purple}}>{user?.tenant?.plan||'starter'} ✓</div></div>
          </div>
        </div>
      )}
      <nav style={{padding:'10px 10px',flex:1}}>
        {items.map(item=>(
          <button key={item.id} onClick={()=>setPage(item.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 10px',borderRadius:9,border:'none',cursor:'pointer',background:page===item.id?`${C.purple}22`:'transparent',color:page===item.id?C.white:C.muted,marginBottom:2,justifyContent:open?'flex-start':'center',fontFamily:'inherit'}}>
            <span style={{color:page===item.id?C.purple:C.muted,flexShrink:0}}>{item.icon}</span>
            {open&&<><span style={{fontSize:13,fontWeight:page===item.id?600:400,flex:1,textAlign:'left'}}>{t.nav[item.id]}</span>{item.badge&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:10,background:`${C.pink}33`,color:C.pink}}>{item.badge}</span>}</>}
          </button>
        ))}
      </nav>
      <div style={{padding:'0 10px 12px'}}>
        <button onClick={logout} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 10px',borderRadius:9,border:'none',cursor:'pointer',background:'transparent',color:C.muted,justifyContent:open?'flex-start':'center',fontFamily:'inherit'}}>
          <LogOut size={17}/>{open&&<span style={{fontSize:13}}>{t.logout}</span>}
        </button>
        <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',padding:10,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',display:'flex',justifyContent:'center',marginTop:8,fontFamily:'inherit'}}><Menu size={16}/></button>
      </div>
    </div>
  )
}

// ── Overview ─────────────────────────────────────────────
function Overview({ setPage, reels, locs, t }) {
  const liveCount = reels.filter(r=>r.status==='live').length
  const totalScans = locs.reduce((s,l)=>s+(l.scans||0),0)
  return (
    <div>
      <div style={{marginBottom:26}}>
        <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>DASHBOARD</div>
        <div style={{fontSize:26,fontWeight:800}}>Willkommen zurück 👋</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>Deine Performance heute auf einen Blick.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
        {[
          {label:t.nav.locations, value:locs.length,    delta:`${locs.filter(l=>l.active).length} aktiv`,   icon:<MapPin size={18} color={C.purple}/>,      color:C.purple},
          {label:'Live Reels',    value:liveCount,       delta:`von ${reels.length} Reels`,                  icon:<Video size={18} color={C.green}/>,        color:C.green},
          {label:t.scans,         value:totalScans.toLocaleString(), delta:`${t.thisWeek}`,                  icon:<QrCode size={18} color={C.blue}/>,        color:C.blue},
          {label:'Content',       value:reels.length,    delta:`${reels.filter(r=>r.status==='draft').length} Entwürfe`, icon:<Film size={18} color={C.pink}/>, color:C.pink},
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
              <span style={{fontSize:12,color:C.muted}}>{s.label}</span>
              <div style={{width:36,height:36,borderRadius:10,background:`${s.color}22`,display:'flex',alignItems:'center',justifyContent:'center'}}>{s.icon}</div>
            </div>
            <div style={{fontSize:28,fontWeight:800,marginBottom:4}}>{s.value}</div>
            <div style={{fontSize:12,color:C.green}}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
            <span style={{fontSize:14,fontWeight:700}}>Aktuelle Reels</span>
            <button onClick={()=>setPage('reels')} style={{fontSize:12,color:C.purple,background:'none',border:'none',cursor:'pointer'}}>Alle →</button>
          </div>
          {reels.length===0 && <div style={{fontSize:13,color:C.muted,padding:'20px 0',textAlign:'center'}}>Noch keine Reels. Erstelle deinen ersten!</div>}
          {reels.slice(0,5).map(r=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:34,height:34,borderRadius:8,background:`${r.color||C.purple}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,overflow:'hidden',flexShrink:0}}>
                {r.media_url?<img src={r.media_url} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} alt=""/>:r.emoji||'🎬'}
              </div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{r.title}</div><div style={{fontSize:11,color:C.muted}}>{r.locations?.name||r.loc||'–'}</div></div>
              {pill(r.status==='live'?'● LIVE':r.status?.toUpperCase()||'DRAFT', r.status==='live'?C.green:r.status==='scheduled'?C.orange:C.muted)}
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
            <span style={{fontSize:14,fontWeight:700}}>Standorte</span>
            <button onClick={()=>setPage('locations')} style={{fontSize:12,color:C.purple,background:'none',border:'none',cursor:'pointer'}}>Verwalten →</button>
          </div>
          {locs.length===0 && <div style={{fontSize:13,color:C.muted,padding:'20px 0',textAlign:'center'}}>Noch keine Standorte. Füge deinen ersten hinzu!</div>}
          {locs.map(l=>(
            <div key={l.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:l.active?C.green:C.dim,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{l.name}</div><div style={{fontSize:11,color:C.muted}}>{l.city}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:700}}>{(l.scans||0).toLocaleString()}</div><div style={{fontSize:10,color:C.blue}}>{l.wr||0}% watch</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Reels Page ────────────────────────────────────────────
function ReelsPage({ reels, locs, tenantId, notify, t }) {
  const [filter,   setFilter]   = useState('all')
  const [editReel, setEditReel] = useState(null)
  const saveReel   = useSaveReel()
  const deleteReel = useDeleteReel()

  const shown = filter==='all' ? reels : reels.filter(r=>r.status===filter)

  const handleSave = async (data) => {
    try { await saveReel.mutateAsync({ reel:data, tenantId }); notify('✅ Reel gespeichert') }
    catch { notify('❌ Fehler beim Speichern') }
    setEditReel(null)
  }

  const handleDelete = async (id) => {
    try { await deleteReel.mutateAsync({ id, tenantId }); notify('Reel gelöscht') }
    catch { notify('❌ Fehler beim Löschen') }
  }

  const handleToggle = async (r) => {
    try { await saveReel.mutateAsync({ reel:{...r, status:r.status==='live'?'draft':'live'}, tenantId }); notify('Status aktualisiert') }
    catch { notify('❌ Fehler') }
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
        <div><div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>CONTENT</div><div style={{fontSize:24,fontWeight:800}}>Reels</div></div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setEditReel({})} style={{padding:'9px 16px',borderRadius:9,border:`1px solid ${C.purple}`,background:`${C.purple}22`,color:C.purple,cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:7,fontFamily:'inherit'}}><Sparkles size={14}/>KI generieren</button>
          <button onClick={()=>setEditReel({})} style={{padding:'9px 16px',borderRadius:9,border:'none',background:C.purple,color:C.white,cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:7,fontFamily:'inherit'}}><Plus size={14}/>Reel erstellen</button>
        </div>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['all','live','scheduled','draft'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 15px',borderRadius:8,border:'none',cursor:'pointer',background:filter===f?C.purple:C.card,color:filter===f?C.white:C.muted,fontSize:13,fontWeight:filter===f?600:400,textTransform:'capitalize',fontFamily:'inherit'}}>
            {f==='all'?'Alle':f==='live'?'Live':f==='scheduled'?'Geplant':'Entwurf'} ({f==='all'?reels.length:reels.filter(r=>r.status===f).length})
          </button>
        ))}
      </div>
      {shown.length===0 && <div style={{background:C.card,borderRadius:16,padding:40,textAlign:'center',border:`2px dashed ${C.border}`}}><Film size={40} color={C.dim} style={{marginBottom:12}}/><div style={{fontSize:16,color:C.muted}}>Noch keine Reels hier.</div></div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {shown.map(r=>(
          <div key={r.id} style={{background:C.card,borderRadius:16,overflow:'hidden',border:`1px solid ${C.border}`}}>
            <div style={{height:140,background:r.media_url?'transparent':`linear-gradient(135deg,${r.color||C.purple}44,${C.bg})`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
              {r.media_url?<img src={r.media_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>:<div style={{fontSize:42}}>{r.emoji||'🎬'}</div>}
              <div style={{position:'absolute',top:8,left:8}}>{pill(r.status==='live'?'● LIVE':(r.status||'DRAFT').toUpperCase(),r.status==='live'?C.green:r.status==='scheduled'?C.orange:C.muted)}</div>
              <div style={{position:'absolute',top:8,right:8}}>{pill(r.type||'offer',r.color||C.purple)}</div>
              {r.media_url&&<div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,transparent 50%,rgba(0,0,0,.5))'}}/>}
            </div>
            <div style={{padding:14}}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{r.title}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:4}}>📍 {r.locations?.name||r.loc||'–'}</div>
              {r.cta_url&&<div style={{fontSize:10,color:C.blue,marginBottom:8,display:'flex',alignItems:'center',gap:3}}><ExternalLink size={9}/><span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160}}>{r.cta_url}</span></div>}
              {r.status==='live'&&(
                <div style={{display:'flex',gap:14,marginBottom:12}}>
                  <div><div style={{fontSize:16,fontWeight:800}}>{(r.views||0).toLocaleString()}</div><div style={{fontSize:10,color:C.muted}}>Views</div></div>
                  <div><div style={{fontSize:16,fontWeight:800,color:C.pink}}>{r.ctr||0}%</div><div style={{fontSize:10,color:C.muted}}>CTR</div></div>
                  <div><div style={{fontSize:12,fontWeight:700,color:C.blue}}>{r.cta}</div><div style={{fontSize:10,color:C.muted}}>CTA</div></div>
                </div>
              )}
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>handleToggle(r)} style={{flex:1,padding:'7px 0',borderRadius:8,border:'none',cursor:'pointer',background:r.status==='live'?`${C.orange}22`:`${C.green}22`,color:r.status==='live'?C.orange:C.green,fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
                  {r.status==='live'?'Pausieren':'Veröffentlichen'}
                </button>
                <button onClick={()=>setEditReel(r)} style={{width:34,height:34,borderRadius:8,border:'none',cursor:'pointer',background:`${C.blue}22`,color:C.blue,display:'flex',alignItems:'center',justifyContent:'center'}}><Edit2 size={13}/></button>
                <button onClick={()=>handleDelete(r.id)} style={{width:34,height:34,borderRadius:8,border:'none',cursor:'pointer',background:`${C.pink}22`,color:C.pink,display:'flex',alignItems:'center',justifyContent:'center'}}><Trash2 size={13}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editReel!==null&&<ReelModal reel={Object.keys(editReel).length?editReel:null} locs={locs} tenantId={tenantId} onClose={()=>setEditReel(null)} onSave={handleSave} notify={notify}/>}
    </div>
  )
}

// ── Locations Page ────────────────────────────────────────
function LocationsPage({ locs, tenantId, notify }) {
  const [editLoc, setEditLoc] = useState(null)
  const saveLoc   = useSaveLocation()
  const deleteLoc = useDeleteLocation()

  const handleSave = async (data) => {
    try { await saveLoc.mutateAsync({ location:data, tenantId }); notify(data.id?'✅ Standort aktualisiert':'📍 Standort erstellt — QR generiert!') }
    catch(e) { notify('❌ ' + e.message) }
    setEditLoc(null)
  }

  const handleToggle = async (l) => {
    try { await saveLoc.mutateAsync({ location:{...l,active:!l.active}, tenantId }); notify('Status aktualisiert') }
    catch { notify('❌ Fehler') }
  }

  const handleDelete = async (id) => {
    try { await deleteLoc.mutateAsync({ id, tenantId }); notify('Standort gelöscht') }
    catch(e) { notify('❌ ' + e.message) }
  }

  const copy = async (id) => { await copyToClipboard(`https://app.scenvy.de/l/${id}`); notify('✅ URL kopiert!') }
  const dl   = async (l)  => { notify('⏳ Wird heruntergeladen...'); await downloadQR(l.id,l.name); notify('✅ QR gespeichert!') }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
        <div><div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>VERWALTUNG</div><div style={{fontSize:24,fontWeight:800}}>Standorte</div></div>
        <button onClick={()=>setEditLoc({})} style={{padding:'9px 16px',borderRadius:9,border:'none',background:C.purple,color:C.white,cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:7,fontFamily:'inherit'}}><Plus size={14}/>Standort hinzufügen</button>
      </div>
      {locs.length===0&&<div style={{background:C.card,borderRadius:16,padding:40,textAlign:'center',border:`2px dashed ${C.border}`}}><MapPin size={40} color={C.dim} style={{marginBottom:12}}/><div style={{fontSize:16,color:C.muted}}>Noch keine Standorte. Füge deinen ersten hinzu!</div></div>}
      <div style={{display:'grid',gap:14}}>
        {locs.map(l=>(
          <div key={l.id} style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:20}}>
            <div style={{width:80,height:80,borderRadius:12,background:C.white,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden',cursor:'pointer'}} onClick={()=>dl(l)}>
              <img src={qrImageUrl(l.id,80)} alt="QR" style={{width:70,height:70}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                <span style={{fontSize:15,fontWeight:700}}>{l.name}</span>
                <div style={{width:8,height:8,borderRadius:'50%',background:l.active?C.green:C.dim}}/>
                <span style={{fontSize:11,color:l.active?C.green:C.muted}}>{l.active?'Aktiv':'Inaktiv'}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:9}}>📍 {l.city}</div>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 10px',background:C.card2,borderRadius:7,fontSize:11,color:C.muted,cursor:'pointer'}} onClick={()=>copy(l.id)}>
                🔗 app.scenvy.de/l/{l.id.slice(0,8)}...
                <Copy size={11} color={C.purple}/>
              </div>
            </div>
            <div style={{display:'flex',gap:20,textAlign:'center'}}>
              <div><div style={{fontSize:20,fontWeight:800}}>{(l.scans||0).toLocaleString()}</div><div style={{fontSize:11,color:C.muted}}>Scans</div></div>
              <div><div style={{fontSize:20,fontWeight:800,color:l.wr>0?C.pink:C.dim}}>{l.wr>0?`${l.wr}%`:'—'}</div><div style={{fontSize:11,color:C.muted}}>Watch Rate</div></div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              <button onClick={()=>setEditLoc(l)} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.blue}`,background:`${C.blue}11`,color:C.blue,cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}><Edit2 size={11}/>Bearbeiten</button>
              <button onClick={()=>handleToggle(l)} style={{padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',background:l.active?`${C.orange}22`:`${C.green}22`,color:l.active?C.orange:C.green,fontSize:12,fontWeight:600,fontFamily:'inherit'}}>
                {l.active?'Deaktivieren':'Aktivieren'}
              </button>
              <button onClick={()=>dl(l)} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:12,fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}><Download size={11}/>QR Download</button>
            </div>
          </div>
        ))}
      </div>
      {editLoc!==null&&<LocationModal loc={Object.keys(editLoc).length?editLoc:null} tenantId={tenantId} onClose={()=>setEditLoc(null)} onSave={handleSave}/>}
    </div>
  )
}

// ── QR Page ───────────────────────────────────────────────
function QRPage({ locs, notify }) {
  const copy = async (id) => { await copyToClipboard(`https://app.scenvy.de/l/${id}`); notify('✅ URL kopiert!') }
  const dl   = async (l)  => { notify('⏳ Wird heruntergeladen...'); await downloadQR(l.id,l.name); notify('✅ QR gespeichert!') }
  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>QR-CODES</div>
        <div style={{fontSize:24,fontWeight:800}}>QR-Code Verwaltung</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>Jeder Standort hat eine eigene URL und einen eigenen QR-Code.</div>
      </div>
      {locs.length===0&&<div style={{background:C.card,borderRadius:16,padding:40,textAlign:'center',border:`2px dashed ${C.border}`}}><QrCode size={40} color={C.dim} style={{marginBottom:12}}/><div style={{fontSize:16,color:C.muted}}>Füge zuerst Standorte hinzu.</div></div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20}}>
        {locs.map(l=>(
          <div key={l.id} style={{background:C.card,borderRadius:20,padding:28,border:`1px solid ${C.border}`,display:'flex',gap:24,alignItems:'center'}}>
            <div style={{background:C.white,borderRadius:14,padding:10,flexShrink:0}}>
              <img src={qrImageUrl(l.id,160)} alt="QR" style={{width:160,height:160,display:'block'}}/>
              <div style={{textAlign:'center',fontSize:10,fontWeight:800,color:C.bg,marginTop:6,letterSpacing:2}}>SCENVY</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:800,marginBottom:4}}>{l.name}</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:12}}>📍 {l.city}</div>
              <div style={{fontSize:11,color:C.blue,marginBottom:16,display:'flex',alignItems:'center',gap:5}}><Globe size={11}/>app.scenvy.de/l/{l.id.slice(0,8)}...</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>dl(l)} style={{flex:1,padding:'9px 0',borderRadius:9,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:600,fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Download size={14}/>Download</button>
                <button onClick={()=>copy(l.id)} style={{flex:1,padding:'9px 0',borderRadius:9,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Copy size={13}/>URL kopieren</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Analytics ─────────────────────────────────────────────
function Analytics({ tenantId }) {
  const { data: analytics, isLoading } = useAnalyticsSummary(tenantId)
  const chartData = analytics?.chart || []
  return (
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>INSIGHTS</div><div style={{fontSize:24,fontWeight:800}}>Analytics</div></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        {[['Scans (7 Tage)',analytics?.totalScans||0,'+18%',C.purple],['Ø Watch-Time','—','',C.pink],['Conversion','—','',C.green]].map(([l,v,d,c],i)=>(
          <div key={i} style={{background:C.card,borderRadius:14,padding:18,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{l}</div>
            <div style={{fontSize:26,fontWeight:800}}>{isLoading?'...' : v}</div>
            {d&&<div style={{fontSize:12,color:C.green,marginTop:4}}>{d} vs. Vorwoche</div>}
          </div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:16,padding:20,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>Scans pro Woche</div>
        {isLoading ? <div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:C.muted}}>Lade Daten...</div> :
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.white}}/>
            <Bar dataKey="scans" fill={C.purple} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  )
}

// ── AI Generator ──────────────────────────────────────────
function AIGenerator({ tenantId, locs, notify }) {
  const [inputMode,   setInputMode]   = useState('text')
  const [form,        setForm]        = useState({ venue:'', offer:'', type:'offer', tone:'exciting', ctaUrl:'' })
  const [locationId,  setLocationId]  = useState(locs[0]?.id||'')
  const [imgPreview,  setImgPreview]  = useState(null)
  const [imgDesc,     setImgDesc]     = useState('')
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const fileRef = useRef()
  const saveReel = useSaveReel()

  const handleImgFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    setUploading(true)
    try { const url = await uploadMedia(f, tenantId); setImgPreview(url) }
    catch { notify('❌ Upload fehlgeschlagen') }
    setUploading(false)
  }

  const generate = async () => {
    const offerText = inputMode==='image' ? imgDesc : form.offer
    if (!offerText.trim()) { notify('Bitte Beschreibung eingeben'); return }
    const loc = locs.find(l=>l.id===locationId)
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/ai/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...form, venue:loc?.name||form.venue, offer:offerText }) })
      setResult(await res.json())
    } catch {
      const moodMap={offer:'purple',event:'pink',menu:'blue',promo:'orange'}
      setResult({ hook:'TONIGHT ONLY 🔥', headline:offerText.length>40?offerText.slice(0,40)+'…':offerText, subtext:'Exklusiv für dich — jetzt sichern!', cta:'Jetzt sichern', hashtags:['dubai',form.type,'scenvy'], emoji:'🍹', urgency:'Nur für begrenzte Zeit', colorMood:moodMap[form.type]||'purple' })
    }
    setLoading(false)
  }

  const save = async () => {
    const cm={purple:C.purple,pink:C.pink,blue:C.blue,orange:C.orange,green:C.green}
    const loc = locs.find(l=>l.id===locationId)
    try {
      await saveReel.mutateAsync({ reel:{ tenant_id:tenantId, location_id:locationId, title:result.headline, type:form.type, status:'draft', color:cm[result.colorMood]||C.purple, emoji:result.emoji, cta:result.cta, cta_url:form.ctaUrl, cta_action:'url', media_url:imgPreview, media_type:'image', loc:loc?.name||'' }, tenantId })
      notify('✨ KI-Reel gespeichert!')
      setResult(null); setImgPreview(null); setImgDesc(''); setForm(f=>({...f,offer:'',ctaUrl:''}))
    } catch(e) { notify('❌ ' + e.message) }
  }

  const accent = result ? ({purple:C.purple,pink:C.pink,blue:C.blue,orange:C.orange,green:C.green}[result.colorMood]||C.purple) : C.purple

  return (
    <div>
      <div style={{marginBottom:20}}><div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:6}}>KI-GESTÜTZT</div><div style={{fontSize:24,fontWeight:800}}>Reel Generator ✨</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Beschreibe dein Angebot oder lade ein Bild hoch → Claude KI erstellt den fertigen Reel.</div></div>
      <div style={{display:'flex',background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:20,width:'fit-content'}}>
        {[['text','✏️ Text'],['image','📸 Bild + Text']].map(([m,label])=>(
          <button key={m} onClick={()=>setInputMode(m)} style={{padding:'8px 18px',borderRadius:9,border:'none',cursor:'pointer',background:inputMode===m?C.purple:'transparent',color:inputMode===m?C.white:C.muted,fontWeight:inputMode===m?700:400,fontSize:13,fontFamily:'inherit'}}>{label}</button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:14,fontWeight:700,marginBottom:18}}>Eingabe</div>
          {inputMode==='image'&&(
            <>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>BILD HOCHLADEN</label>
                <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${imgPreview?C.purple:C.border}`,borderRadius:12,overflow:'hidden',cursor:'pointer',minHeight:100,display:'flex',alignItems:'center',justifyContent:'center',background:`${C.purple}08`,position:'relative'}}>
                  {uploading ? <div style={{textAlign:'center'}}><RefreshCw size={22} color={C.purple} style={{animation:'spin 1s linear infinite'}}/></div>
                    : imgPreview ? <img src={imgPreview} style={{width:'100%',maxHeight:140,objectFit:'cover'}} alt=""/>
                    : <div style={{textAlign:'center',padding:16}}><Image size={24} color={C.purple} style={{marginBottom:6}}/><div style={{fontSize:12,color:C.muted}}>Foto hochladen (wird in Supabase gespeichert)</div></div>}
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImgFile} style={{display:'none'}}/>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>BILD BESCHREIBEN / ANGEBOT *</label>
                <textarea value={imgDesc} onChange={e=>setImgDesc(e.target.value)} rows={3} placeholder="z.B. Zeigt unsere Rooftop-Bar beim Sonnenuntergang — erstelle einen Happy-Hour-Reel" style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
              </div>
            </>
          )}
          {inputMode==='text'&&(
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>ANGEBOT / NACHRICHT *</label>
              <textarea value={form.offer} onChange={e=>setForm(p=>({...p,offer:e.target.value}))} rows={3} placeholder="z.B. Happy Hour: 50% auf alle Cocktails bis 20 Uhr" style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>STANDORT</label>
              <select value={locationId} onChange={e=>setLocationId(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.card2,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}>
                {locs.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>TYP</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.card2,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}>
                <option value="offer">🏷️ Angebot</option><option value="event">🎉 Event</option><option value="menu">🍽️ Menü</option><option value="promo">⚡ Promo</option>
              </select>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,letterSpacing:1,fontWeight:600}}>CTA-ZIEL (URL)</label>
            <input value={form.ctaUrl} onChange={e=>setForm(p=>({...p,ctaUrl:e.target.value}))} placeholder="https://..." style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none'}}/>
          </div>
          <button onClick={generate} disabled={loading} style={{width:'100%',padding:'14px 0',borderRadius:12,border:'none',cursor:loading?'wait':'pointer',background:loading?C.dim:grad(C.purple,C.pink),color:C.white,fontWeight:700,fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:10,fontFamily:'inherit'}}>
            {loading?<><RefreshCw size={18} style={{animation:'spin 1s linear infinite'}}/>Generiert...</>:<><Sparkles size={18}/>Reel generieren</>}
          </button>
        </div>
        <div>
          {!result
            ?<div style={{background:C.card,borderRadius:16,padding:24,border:`2px dashed ${C.border}`,height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
               <Sparkles size={44} color={C.dim} style={{marginBottom:16}}/><div style={{fontSize:16,fontWeight:600,color:C.muted}}>Vorschau erscheint hier</div>
             </div>
            :<div>
               <div style={{background:`linear-gradient(160deg,${accent}28,${C.bg} 70%)`,border:`2px solid ${accent}44`,borderRadius:22,padding:24,marginBottom:14}}>
                 {imgPreview&&<img src={imgPreview} style={{width:'100%',borderRadius:14,maxHeight:140,objectFit:'cover',marginBottom:14}} alt=""/>}
                 <div style={{background:`linear-gradient(180deg,${accent}33,${C.bg})`,borderRadius:16,padding:'24px 20px',textAlign:'center',marginBottom:14,display:'flex',flexDirection:'column',justifyContent:'space-between',minHeight:200}}>
                   <div style={{fontSize:40}}>{result.emoji}</div>
                   <div>
                     <div style={{fontSize:12,fontWeight:800,color:accent,letterSpacing:2,marginBottom:7}}>{result.hook}</div>
                     <div style={{fontSize:18,fontWeight:800,lineHeight:1.28,marginBottom:9}}>{result.headline}</div>
                     <div style={{fontSize:13,color:'rgba(255,255,255,.6)',marginBottom:10}}>{result.subtext}</div>
                     {result.urgency&&<div style={{fontSize:12,color:accent,fontWeight:600}}>⏱ {result.urgency}</div>}
                     {form.ctaUrl&&<div style={{fontSize:10,color:C.blue,marginTop:6,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><ExternalLink size={9}/>{form.ctaUrl}</div>}
                   </div>
                   <button style={{padding:'11px 28px',borderRadius:13,border:'none',background:accent,color:C.white,fontWeight:700,fontSize:15}}>{result.cta} →</button>
                 </div>
                 <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{result.hashtags?.map(h=><span key={h} style={{fontSize:11,color:accent,background:`${accent}22`,padding:'3px 9px',borderRadius:7}}>#{h}</span>)}</div>
               </div>
               <div style={{display:'flex',gap:10}}>
                 <button onClick={save} style={{flex:1,padding:'12px 0',borderRadius:10,border:'none',cursor:'pointer',background:accent,color:C.white,fontWeight:700,fontSize:14,fontFamily:'inherit'}}>✓ In Library speichern</button>
                 <button onClick={()=>setResult(null)} style={{padding:'12px 18px',borderRadius:10,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:13,fontFamily:'inherit'}}>Nochmal</button>
               </div>
             </div>
          }
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth()
  const tenantId = user?.tenant_id

  const { data: reels=[], isLoading: reelsLoading } = useReels(tenantId)
  const { data: locs=[],  isLoading: locsLoading  } = useLocations(tenantId)

  const [page,  setPage]  = useState('overview')
  const [open,  setOpen]  = useState(true)
  const [lang,  setLang]  = useState(() => localStorage.getItem('scenvy_lang')||'de')
  const [toast, setToast] = useState(null)

  const t = T[lang]
  const notify = msg => { setToast(msg); setTimeout(()=>setToast(null), 3000) }

  if (reelsLoading || locsLoading) return (
    <div style={{height:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:40,height:40,borderRadius:'50%',border:`3px solid ${C.purple}`,borderTopColor:'transparent',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{display:'flex',height:'100vh',background:C.bg,fontFamily:"'Inter',sans-serif",color:C.white}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      <Sidebar page={page} setPage={setPage} open={open} setOpen={setOpen} t={t} user={user} logout={logout}/>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Top bar */}
        <div style={{height:58,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 28px',justifyContent:'space-between',flexShrink:0}}>
          <div style={{fontWeight:700,fontSize:14}}>{user?.tenant?.name||'Dashboard'}</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:3}}>
              {[['de','🇩🇪'],['en','🇬🇧']].map(([l,f])=>(
                <button key={l} onClick={()=>{setLang(l);localStorage.setItem('scenvy_lang',l)}} style={{padding:'3px 8px',borderRadius:5,border:'none',cursor:'pointer',background:lang===l?C.purple:'transparent',fontSize:15,fontFamily:'inherit'}}>{f}</button>
              ))}
            </div>
            <div style={{fontSize:12,color:C.muted}}>app.scenvy.de</div>
            <div style={{width:30,height:30,borderRadius:'50%',background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13}}>
              {(user?.name||user?.email||'?')[0].toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:28}}>
          {page==='overview'  && <Overview   setPage={setPage} reels={reels} locs={locs} t={t}/>}
          {page==='reels'     && <ReelsPage  reels={reels} locs={locs} tenantId={tenantId} notify={notify} t={t}/>}
          {page==='locations' && <LocationsPage locs={locs} tenantId={tenantId} notify={notify}/>}
          {page==='analytics' && <Analytics  tenantId={tenantId}/>}
          {page==='ai'        && <AIGenerator tenantId={tenantId} locs={locs} notify={notify}/>}
          {page==='qr'        && <QRPage     locs={locs} notify={notify}/>}
          {page==='settings'  && (
            <div>
              <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:16}}>ACCOUNT</div>
              <div style={{fontSize:24,fontWeight:800,marginBottom:24}}>Einstellungen</div>
              <div style={{background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`,marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Aktueller Plan</div>
                <div style={{display:'flex',gap:14,alignItems:'center'}}>
                  <span style={{padding:'6px 14px',background:`${C.purple}33`,color:C.purple,borderRadius:8,fontWeight:700,fontSize:13}}>{(user?.tenant?.plan||'STARTER').toUpperCase()}</span>
                  <span style={{fontSize:13,color:C.muted}}>{locs.length} Standorte · {reels.length} Reels</span>
                </div>
              </div>
              <div style={{background:C.card,borderRadius:14,padding:20,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Dein Account</div>
                <div style={{fontSize:13,color:C.muted,marginBottom:6}}>E-Mail: <span style={{color:C.white}}>{user?.email}</span></div>
                <div style={{fontSize:13,color:C.muted}}>Tenant-ID: <span style={{color:C.dim,fontSize:11}}>{tenantId}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast&&<div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',background:C.purple,color:C.white,padding:'12px 24px',borderRadius:14,fontSize:13,fontWeight:600,zIndex:9999,animation:'fadeUp .25s ease'}}>{toast}</div>}
    </div>
  )
}
