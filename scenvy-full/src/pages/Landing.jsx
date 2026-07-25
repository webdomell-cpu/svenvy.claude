import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, grad } from '@/tokens'
import { Check, Star, Play, Video, Zap, Sparkles, MapPin, BarChart2, QrCode, X, Send } from 'lucide-react'

// i18n inline
const T = {
  de: {
    nav:{ features:'Features', how:"So geht's", pricing:'Preise', demo:'Demo', login:'Einloggen', cta:'Kostenlos starten →' },
    kicker:'DIE ZUKUNFT DES VENUE-MARKETINGS',
    h1:'Verwandle jeden Ort in ein', scrollable:'scrollbares', h1b:'Erlebnis.',
    sub:'SCENVY verwandelt QR-Codes in TikTok-artige vertikale Reels. Echtzeit-Angebote, KI-Inhalte — kein App-Download nötig.',
    cta1:'Kostenlos starten →', cta2:'Demo ansehen',
    trust:'Vertrauen von 2.000+ Venues in 40 Ländern',
    stats:[{v:'3.4×',l:'Mehr Engagement'},{v:'80%',l:'Ø Watch-Rate'},{v:'5 Min',l:'Setup-Zeit'},{v:'€0',l:'Setup-Kosten'}],
    fKicker:'FEATURES', fTitle:'Alles was dein Venue braucht',
    fSub:'Eine Plattform. Alle Tools um passive Gäste in aktive Kunden zu verwandeln.',
    features:[
      {t:'Reel-Erlebnis',d:'TikTok-artige Stories die automatisch starten. Gäste swipen, entdecken, handeln.'},
      {t:'Live-Angebote',d:'Push Deals mit Countdown. Happy Hour? Event? In unter 60 Sekunden live.'},
      {t:'KI-Generator',d:'Beschreibe dein Angebot oder lade ein Foto hoch — Claude KI erstellt den Reel.'},
      {t:'Multi-Standort',d:'Alle Venues in einem Dashboard. Jeder Standort bekommt seinen eigenen QR-Code.'},
      {t:'Analytics',d:'Scans, Watch-Time und CTR. Wisse genau welcher Content Umsatz bringt.'},
      {t:'QR-Code-System',d:'app.scenvy.de/l/{id} — drucken, aufstellen, scannen. Fertig.'},
    ],
    howKicker:"SO GEHT'S", howTitle:'In 5 Minuten live', howSub:'Drei Schritte. Kein Entwickler nötig.',
    steps:[{n:'01',t:'QR-Code holen',d:'Registriere dich, erstelle einen Standort, SCENVY generiert deinen QR sofort.'},{n:'02',t:'Reels erstellen',d:'Lade Videos oder Fotos hoch oder lass die KI Reels aus Text erstellen.'},{n:'03',t:'Gäste scannen',d:'Gäste scannen und bekommen ein Vollbild-Erlebnis. Swipen, entdecken, handeln.'}],
    pKicker:'PREISE', pTitle:'Einfache, transparente Preise', pSub:'Keine Setup-Gebühren. Keine versteckten Kosten. Jederzeit kündbar.',
    plans:[
      {n:'Starter',p:'€0',per:'/ 30 Tage',d:'Perfekt um SCENVY risikofrei auszuprobieren.',cta:'Kostenlos starten',feat:['1 Standort','3 Reels','Basic Analytics','QR-Code-Generator','E-Mail-Support'],pop:false,color:C.muted},
      {n:'Pro',p:'€29',per:'/Monat',d:'Für wachsende Venues die mehr Engagement wollen.',cta:'Jetzt starten',feat:['5 Standorte','Unbegrenzte Reels','KI-Reel-Generator','Volle Analytics + CTR','Social Import','Prioritäts-Support'],pop:true,color:C.purple},
      {n:'Enterprise',p:'Individuell',per:'',d:'Für Gruppen und Ketten über mehrere Städte.',cta:'Kontaktieren',feat:['Unbegrenzte Standorte','Unbegrenzte Reels','KI + Scheduling','White Label Branding','API-Zugang','Dedicated Account Manager'],pop:false,color:C.pink,contact:true},
    ],
    tKicker:'KUNDENMEINUNGEN', tTitle:'Venues lieben SCENVY',
    testimonials:[
      {q:'Unsere Scan-to-Order-Rate hat sich verdreifacht. Gäste lieben das Reel-Format — es fühlt sich genau wie TikTok an.',n:'Khalid Al-Rashid',r:'GM, Marina Walk Restaurant Group'},
      {q:'Der KI-Generator ist unglaublich. Ich tippe "Happy Hour heute" und er erstellt einen kompletten Reel in Sekunden.',n:'Sophie Laurent',r:'Inhaberin, Rooftop Bar 21'},
      {q:'6 Venues in Dubai. Ein Dashboard, ein Login, volle Kontrolle. SCENVY ist das fehlende Stück in unserem Tech-Stack.',n:'Marcus Webb',r:'Director, The Palm Events Group'},
    ],
    ctaKicker:'LOSLEGEN', ctaT1:'Bereit scrollbar', ctaT2:'zu werden?',
    ctaSub:'Schließe dich 2.000+ Venues an die SCENVY nutzen.',
    ctaBtn:'Kostenlose Testphase starten →', ctaNote:'Keine Kreditkarte · Setup in 5 Minuten · Jederzeit kündbar',
    footerTag:'Verwandle jeden Ort in ein scrollbares Erlebnis.',
    footerCopy:'© 2026 SCENVY. Alle Rechte vorbehalten.',
    footerMade:'Gemacht mit ❤️ für Hospitality',
  },
  en:{
    nav:{features:'Features',how:'How it works',pricing:'Pricing',demo:'Demo',login:'Log in',cta:'Get Started Free →'},
    kicker:'THE FUTURE OF VENUE MARKETING',
    h1:'Turn every place into a',scrollable:'scrollable',h1b:'experience.',
    sub:"SCENVY transforms QR codes into TikTok-style vertical reels. Real-time offers, AI content — no app download needed.",
    cta1:'Start for free →',cta2:'See demo',
    trust:'Trusted by 2,000+ venues in 40 countries',
    stats:[{v:'3.4×',l:'More engagement'},{v:'80%',l:'Avg watch rate'},{v:'5 min',l:'Setup time'},{v:'€0',l:'Setup cost'}],
    fKicker:'FEATURES',fTitle:'Everything your venue needs',fSub:'One platform. All the tools to turn passive guests into active customers.',
    features:[
      {t:'Reel Experience',d:'TikTok-style stories that auto-play. Guests swipe, discover, and act.'},
      {t:'Live Offers',d:'Push deals with countdown timers. Happy hour? Event? Live in under 60 seconds.'},
      {t:'AI Generator',d:'Describe your offer or upload a photo — Claude AI creates a complete reel.'},
      {t:'Multi-Location',d:'All venues in one dashboard. Every location gets its own QR code.'},
      {t:'Analytics',d:'Scans, watch time, and CTR. Know exactly which content drives revenue.'},
      {t:'QR Code System',d:'app.scenvy.de/l/{id} — print it, display it, start scanning.'},
    ],
    howKicker:'HOW IT WORKS',howTitle:'Up and running in 5 minutes',howSub:'Three steps. No developer needed.',
    steps:[{n:'01',t:'Get your QR code',d:'Sign up, create a location, SCENVY generates your QR code instantly.'},{n:'02',t:'Create reels',d:'Upload videos or photos, or let AI generate reels from a text description.'},{n:'03',t:'Guests scan & engage',d:'Guests scan and get a full-screen experience. Swipe, discover, act.'}],
    pKicker:'PRICING',pTitle:'Simple, transparent pricing',pSub:'No setup fees. No hidden costs. Cancel anytime.',
    plans:[
      {n:'Starter',p:'€0',per:'/ 30 days',d:'Perfect to try SCENVY risk-free.',cta:'Start for free',feat:['1 location','3 reels','Basic analytics','QR code generator','Email support'],pop:false,color:C.muted},
      {n:'Pro',p:'€29',per:'/month',d:'For growing venues serious about engagement.',cta:'Get started',feat:['5 locations','Unlimited reels','AI Reel Generator','Full analytics + CTR','Social import','Priority support'],pop:true,color:C.purple},
      {n:'Enterprise',p:'Individual',per:'',d:'For groups and chains across multiple cities.',cta:'Contact us',feat:['Unlimited locations','Unlimited reels','AI + scheduling','White label branding','API access','Dedicated account manager'],pop:false,color:C.pink,contact:true},
    ],
    tKicker:'TESTIMONIALS',tTitle:'Venues love SCENVY',
    testimonials:[
      {q:'Our scan-to-order rate tripled in the first week. Guests love the reel format — it feels exactly like TikTok.',n:'Khalid Al-Rashid',r:'GM, Marina Walk Restaurant Group'},
      {q:"The AI generator is insane. I type 'happy hour tonight' and it creates a full reel in seconds.",n:'Sophie Laurent',r:'Owner, Rooftop Bar 21'},
      {q:'We run 6 venues in Dubai. One dashboard, one login, full control. SCENVY is the missing piece.',n:'Marcus Webb',r:'Director, The Palm Events Group'},
    ],
    ctaKicker:'GET STARTED',ctaT1:'Ready to go',ctaT2:'scrollable?',
    ctaSub:'Join 2,000+ venues already using SCENVY.',
    ctaBtn:'Start your free trial →',ctaNote:'No credit card · Setup in 5 minutes · Cancel anytime',
    footerTag:'Turn every place into a scrollable experience.',
    footerCopy:'© 2026 SCENVY. All rights reserved.',
    footerMade:'Made with ❤️ for hospitality',
  }
}

const IMGS=[
  {url:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80',accent:'#7C3AED',tag:'HAPPY HOUR',title:'50% Off Cocktails',cta:'Order Now'},
  {url:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',accent:'#FF2D8D',tag:'NEW MENU',title:"Chef's Special",cta:'View Menu'},
  {url:'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',accent:'#00D4FF',tag:'THIS WEEK',title:'Ladies Night ✨',cta:'RSVP Free'},
  {url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',accent:'#FF9500',tag:'FEATURED',title:'Sunset Terrace',cta:'Book Table'},
]

function Glow({color,x,y,size=600}){ return <div style={{position:'absolute',width:size,height:size,borderRadius:'50%',pointerEvents:'none',background:`radial-gradient(circle,${color}33 0%,transparent 70%)`,left:x,top:y,transform:'translate(-50%,-50%)'}}/>}
function Btn({children,onClick,variant='primary',style={}}){ return <button onClick={onClick} style={{padding:'13px 28px',borderRadius:12,border:'none',cursor:'pointer',fontWeight:700,fontSize:15,transition:'all .2s',fontFamily:'inherit',...(variant==='primary'?{background:grad(C.purple,C.pink),color:C.white,boxShadow:`0 4px 24px ${C.purple}55`}:{}),...(variant==='outline'?{background:'transparent',color:C.white,border:`1px solid ${C.border}`}:{}),...(variant==='ghost'?{background:'transparent',color:C.muted}:{}),...style}}>{children}</button>}

function Phone({size='large'}){
  const [idx,setIdx]=useState(0);const[prog,setProg]=useState(0);const[fade,setFade]=useState(true)
  useEffect(()=>{setProg(0);const iv=setInterval(()=>setProg(p=>{if(p>=100){setFade(false);setTimeout(()=>{setIdx(i=>(i+1)%IMGS.length);setFade(true)},300);return 0}return p+0.4}),40);return()=>clearInterval(iv)},[idx])
  const r=IMGS[idx];const L=size==='large';const w=L?300:160,h=L?560:320
  return(
    <div style={{width:w,height:h,borderRadius:L?38:26,overflow:'hidden',border:`2px solid ${C.border}`,position:'relative',boxShadow:`0 0 ${L?70:40}px ${r.accent}55,0 ${L?40:20}px ${L?80:40}px rgba(0,0,0,.7)`,flexShrink:0}}>
      <img src={r.url} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:fade?1:0,transition:'opacity .3s'}}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(0,0,0,.3) 0%,rgba(0,0,0,.1) 40%,rgba(0,0,0,.7) 100%)'}}/>
      <div style={{position:'absolute',top:12,left:10,right:10,display:'flex',gap:3,zIndex:5}}>
        {IMGS.map((_,i)=><div key={i} style={{flex:1,height:2.5,borderRadius:2,background:'rgba(255,255,255,.3)',overflow:'hidden'}}><div style={{height:'100%',background:C.white,borderRadius:2,width:i<idx?'100%':i===idx?`${prog}%`:'0%',transition:i===idx?'none':'width .2s'}}/></div>)}
      </div>
      <div style={{position:'absolute',top:22,left:10,right:10,display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:5}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:28,height:28,borderRadius:'50%',background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12}}>S</div><div style={{fontSize:L?11:9,fontWeight:700}}>Marina Group</div></div>
        <div style={{background:r.accent,borderRadius:5,padding:'2px 7px',fontSize:L?9:8,fontWeight:700,opacity:fade?1:0,transition:'opacity .3s'}}>{r.tag}</div>
      </div>
      <div style={{position:'absolute',bottom:L?90:60,left:12,right:L?56:44,opacity:fade?1:0,transition:'opacity .3s'}}>
        <div style={{fontSize:L?20:13,fontWeight:800,lineHeight:1.25,marginBottom:L?6:4,textShadow:'0 2px 8px rgba(0,0,0,.8)'}}>{r.title}</div>
        <div style={{fontSize:L?11:9,color:'rgba(255,255,255,.7)'}}>Dubai Marina · Tonight</div>
      </div>
      {L&&<div style={{position:'absolute',right:10,bottom:100,display:'flex',flexDirection:'column',gap:14,alignItems:'center'}}>{['❤️','💬','↗️','📲'].map((ic,i)=><div key={i} style={{width:38,height:38,borderRadius:'50%',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{ic}</div>)}</div>}
      <div style={{position:'absolute',bottom:L?20:12,left:10,right:10}}><div style={{padding:`${L?12:8}px 0`,borderRadius:L?14:10,textAlign:'center',background:grad(r.accent,C.pink),fontWeight:700,fontSize:L?14:11,opacity:fade?1:0,transition:'background .8s, opacity .3s'}}>{r.cta} →</div></div>
    </div>
  )
}

function ContactModal({onClose,lang}){
  const de=lang==='de'
  const[form,setForm]=useState({name:'',company:'',locations:'',contact:'',email:'',phone:'',message:''})
  const[sent,setSent]=useState(false);const[loading,setLoading]=useState(false)
  const submit=async()=>{
    if(!form.name||!form.email)return;setLoading(true)
    try{await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,type:'enterprise'})})}catch{}
    setSent(true);setLoading(false)
  }
  const fld=(label,key,ph,type='text')=>(
    <div style={{marginBottom:14}}><label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>{label}</label>
    <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph} type={type} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',fontFamily:'inherit'}}/></div>
  )
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',backdropFilter:'blur(14px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:24,width:'100%',maxWidth:560,maxHeight:'90vh',overflow:'auto'}}>
        <div style={{padding:'22px 28px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontWeight:800,fontSize:18}}>Enterprise {de?'anfragen':'Contact'}</div><div style={{fontSize:13,color:C.muted,marginTop:3}}>{de?'Wir melden uns innerhalb von 24 Stunden.':'We\'ll get back to you within 24 hours.'}</div></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer'}}><X size={20}/></button>
        </div>
        {sent?(
          <div style={{padding:40,textAlign:'center'}}>
            <div style={{fontSize:56,marginBottom:16}}>✅</div>
            <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>{de?'Anfrage gesendet!':'Request sent!'}</div>
            <div style={{fontSize:14,color:C.muted,marginBottom:24}}>{de?'Wir melden uns innerhalb von 24 Stunden.':'We\'ll be in touch within 24 hours.'}</div>
            <button onClick={onClose} style={{padding:'11px 28px',borderRadius:12,border:'none',background:grad(C.purple,C.pink),color:C.white,cursor:'pointer',fontWeight:700,fontSize:14,fontFamily:'inherit'}}>{de?'Schließen':'Close'}</button>
          </div>
        ):(
          <div style={{padding:28}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div>{fld(de?'NAME *':'NAME *','name',de?'Max Mustermann':'Your name')}</div><div>{fld(de?'UNTERNEHMEN *':'COMPANY *','company',de?'Mein Restaurant':'My Company')}</div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div>{fld(de?'ANZAHL STANDORTE':'LOCATIONS','locations',de?'z.B. 5':'e.g. 5')}</div><div>{fld(de?'ANSPRECHPARTNER':'CONTACT PERSON','contact',de?'Name':'Contact')}</div></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><div>{fld('E-MAIL *','email','deine@email.de','email')}</div><div>{fld(de?'TELEFON':'PHONE','phone','+49 123 456789','tel')}</div></div>
            <div style={{marginBottom:22}}><label style={{fontSize:11,color:C.muted,display:'block',marginBottom:6,fontWeight:600,letterSpacing:1}}>{de?'NACHRICHT':'MESSAGE'}</label><textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={3} placeholder={de?'Erzähl uns von deinen Anforderungen...':'Tell us about your requirements...'} style={{width:'100%',padding:'10px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.bg,color:C.white,fontSize:13,outline:'none',resize:'vertical',fontFamily:'inherit'}}/></div>
            <button onClick={submit} disabled={loading||!form.name||!form.email} style={{width:'100%',padding:'13px 0',borderRadius:12,border:'none',cursor:loading||!form.name||!form.email?'default':'pointer',background:loading||!form.name||!form.email?C.dim:grad(C.purple,C.pink),color:C.white,fontWeight:700,fontSize:15,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <Send size={16}/>{loading?(de?'Wird gesendet...':'Sending...'):(de?'Anfrage senden →':'Send Request →')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Landing(){
  const nav=useNavigate()
  const[lang,setLang]=useState(()=>localStorage.getItem('scenvy_lang')||(navigator.language?.startsWith('de')?'de':'en'))
  const[showContact,setShowContact]=useState(false)
  useEffect(()=>localStorage.setItem('scenvy_lang',lang),[lang])
  const t=T[lang]
  const icons=[<Video size={24} color={C.purple}/>,<Zap size={24} color={C.pink}/>,<Sparkles size={24} color={C.blue}/>,<MapPin size={24} color="#00E676"/>,<BarChart2 size={24} color="#FF9500"/>,<QrCode size={24} color={C.purple}/>]
  const fcolors=[C.purple,C.pink,C.blue,'#00E676','#FF9500',C.purple]
  const stepColors=[C.purple,C.pink,C.blue]

  return(
    <div style={{background:C.bg,color:C.white,fontFamily:"'Inter','Segoe UI',sans-serif",overflowX:'hidden'}}>
      <style>{`*{box-sizing:border-box} a{text-decoration:none} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,height:66,background:'rgba(13,13,20,.95)',backdropFilter:'blur(20px)',borderBottom:`1px solid ${C.border}`,padding:'0 5%',display:'flex',alignItems:'center',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:9,flex:1}}>
          <div style={{width:32,height:32,borderRadius:9,background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:16}}>S</div>
          <span style={{fontWeight:800,fontSize:16,letterSpacing:3}}>SCENVY</span>
        </div>
        <div style={{display:'flex',gap:28,position:'absolute',left:'50%',transform:'translateX(-50%)'}}>
          {[['features',t.nav.features],['how-it-works',t.nav.how],['pricing',t.nav.pricing],['demo',t.nav.demo]].map(([id,label])=>(
            <a key={id} href={`#${id}`} style={{color:C.muted,fontSize:14,fontWeight:500}} onMouseEnter={e=>e.target.style.color=C.white} onMouseLeave={e=>e.target.style.color=C.muted}>{label}</a>
          ))}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{display:'flex',background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:3}}>
            {[['de','🇩🇪'],['en','🇬🇧']].map(([l,f])=><button key={l} onClick={()=>setLang(l)} style={{padding:'4px 8px',borderRadius:6,border:'none',cursor:'pointer',background:lang===l?C.purple:'transparent',fontSize:16,fontFamily:'inherit'}}>{f}</button>)}
          </div>
          <Btn variant="ghost" onClick={()=>nav('/auth')} style={{fontSize:14,padding:'9px 16px'}}>{t.nav.login}</Btn>
          <Btn onClick={()=>nav('/auth?mode=register')} style={{fontSize:14,padding:'9px 18px'}}>{t.nav.cta}</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'120px 5% 80px',position:'relative',overflow:'hidden'}}>
        <Glow color={C.purple} x="-5%" y="30%" size={700}/><Glow color={C.pink} x="105%" y="60%" size={600}/>
        <div style={{display:'flex',alignItems:'center',gap:60,width:'100%',maxWidth:1200,margin:'0 auto'}}>
          <div style={{flex:1}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:`${C.purple}22`,border:`1px solid ${C.purple}44`,borderRadius:20,padding:'6px 14px',marginBottom:24}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:C.green}}/><span style={{fontSize:11,fontWeight:700,color:C.purple,letterSpacing:1}}>{t.kicker}</span>
            </div>
            <h1 style={{fontSize:'clamp(32px,4.5vw,58px)',fontWeight:900,lineHeight:1.1,marginBottom:22}}>
              {t.h1}{' '}<span style={{background:grad(C.purple,C.pink),WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t.scrollable}</span>{' '}{t.h1b}
            </h1>
            <p style={{fontSize:17,color:C.muted,lineHeight:1.7,marginBottom:36,maxWidth:480}}>{t.sub}</p>
            <div style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:48}}>
              <Btn onClick={()=>nav('/auth?mode=register')}>{t.cta1}</Btn>
              <Btn variant="outline" onClick={()=>nav('/l/demo')} style={{display:'flex',alignItems:'center',gap:8}}><Play size={14} fill={C.white}/>{t.cta2}</Btn>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              {[...Array(5)].map((_,i)=><Star key={i} size={14} fill="#FF9500" color="#FF9500"/>)}
              <span style={{fontSize:13,color:C.muted,marginLeft:8}}>{t.trust}</span>
            </div>
          </div>
          <div style={{animation:'float 4s ease-in-out infinite',flexShrink:0}}><Phone size="large"/></div>
        </div>
      </section>

      {/* STATS */}
      <section style={{padding:'0 5%'}}>
        <div style={{maxWidth:1200,margin:'0 auto',background:C.card,borderRadius:20,border:`1px solid ${C.border}`,display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
          {t.stats.map((s,i)=>(
            <div key={i} style={{padding:'32px 24px',textAlign:'center',borderRight:i<3?`1px solid ${C.border}`:'none'}}>
              <div style={{fontSize:38,fontWeight:900,background:grad(C.purple,C.pink),WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:6}}>{s.v}</div>
              <div style={{fontSize:13,color:C.muted}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'100px 5%',position:'relative'}}>
        <Glow color={C.purple} x="50%" y="50%" size={800}/>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:12}}>{t.fKicker}</div>
            <h2 style={{fontSize:42,fontWeight:900,marginBottom:16}}>{t.fTitle}</h2>
            <p style={{fontSize:17,color:C.muted,maxWidth:500,margin:'0 auto'}}>{t.fSub}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {t.features.map((f,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:28,transition:'border-color .2s,transform .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=fcolors[i];e.currentTarget.style.transform='translateY(-3px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform='none'}}>
                <div style={{width:48,height:48,borderRadius:14,background:`${fcolors[i]}22`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18}}>{icons[i]}</div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:10}}>{f.t}</div>
                <div style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{padding:'100px 5%',background:`${C.card}66`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:12}}>{t.howKicker}</div>
            <h2 style={{fontSize:42,fontWeight:900,marginBottom:16}}>{t.howTitle}</h2>
            <p style={{fontSize:17,color:C.muted}}>{t.howSub}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,position:'relative'}}>
            <div style={{position:'absolute',top:56,left:'16.67%',right:'16.67%',height:1,background:`linear-gradient(90deg,${C.purple},${C.blue})`,opacity:.3}}/>
            {t.steps.map((s,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:32}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:grad(stepColors[i],i===2?C.purple:C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,marginBottom:24,boxShadow:`0 4px 20px ${stepColors[i]}44`}}>{s.n}</div>
                <div style={{fontSize:20,fontWeight:700,marginBottom:12}}>{s.t}</div>
                <div style={{fontSize:14,color:C.muted,lineHeight:1.65}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" style={{padding:'100px 5%',position:'relative',overflow:'hidden'}}>
        <Glow color={C.pink} x="20%" y="50%" size={700}/>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',gap:80}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:12}}>LIVE DEMO</div>
            <h2 style={{fontSize:42,fontWeight:900,marginBottom:20,lineHeight:1.1}}>
              {lang==='de'?'Was deine Gäste':'What your guests'}<br/>
              <span style={{background:grad(C.purple,C.pink),WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{lang==='de'?'sehen werden.':'will see.'}</span>
            </h2>
            {(lang==='de'?['Kein App-Download nötig','Läuft auf jedem Smartphone','Lädt in unter 1 Sekunde','Vollständig gebrandet']:['No app download needed','Works on any smartphone','Loads in under 1 second','Fully branded']).map((f,i)=>(
              <div key={i} style={{display:'flex',gap:12,alignItems:'center',marginBottom:14}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:`${C.green}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Check size={12} color="#00E676"/></div>
                <span style={{fontSize:14,color:C.muted}}>{f}</span>
              </div>
            ))}
            <Btn onClick={()=>nav('/l/demo')} style={{marginTop:24}}>{lang==='de'?'Live-Demo ausprobieren →':'Try live demo →'}</Btn>
          </div>
          <div style={{display:'flex',gap:14,alignItems:'center',flexShrink:0}}>
            {[0,1,2].map(o=><div key={o} style={{transform:o===1?'scale(1.06)':'none',marginTop:o===1?0:24}}><Phone size="small"/></div>)}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'100px 5%',position:'relative'}}>
        <Glow color={C.blue} x="80%" y="40%" size={600}/>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:64}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:12}}>{t.pKicker}</div>
            <h2 style={{fontSize:42,fontWeight:900,marginBottom:16}}>{t.pTitle}</h2>
            <p style={{fontSize:17,color:C.muted}}>{t.pSub}</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {t.plans.map((p,i)=>(
              <div key={i} style={{background:C.card,border:`2px solid ${p.pop?p.color:C.border}`,borderRadius:24,padding:'36px 28px',position:'relative',transform:p.pop?'scale(1.03)':'none',boxShadow:p.pop?`0 0 40px ${p.color}33`:'none'}}>
                {p.pop&&<div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',background:grad(C.purple,C.pink),borderRadius:20,padding:'5px 16px',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>⭐ Most Popular</div>}
                <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>{p.n}</div>
                <div style={{marginBottom:8}}>
                  <span style={{fontSize:p.p==='Individuell'||p.p==='Individual'?28:42,fontWeight:900,color:p.color}}>{p.p}</span>
                  {p.per&&<span style={{fontSize:14,color:C.muted}}> {p.per}</span>}
                </div>
                <div style={{fontSize:13,color:C.muted,marginBottom:28,lineHeight:1.5}}>{p.d}</div>
                <button onClick={p.contact?()=>setShowContact(true):()=>nav('/auth?mode=register')}
                  style={{width:'100%',padding:'13px 0',borderRadius:12,border:'none',cursor:'pointer',background:p.pop?grad(C.purple,C.pink):`${p.color}22`,color:p.pop?C.white:p.color,fontWeight:700,fontSize:14,fontFamily:'inherit',marginBottom:28,boxShadow:p.pop?`0 4px 20px ${C.purple}44`:'none'}}>
                  {p.cta} →
                </button>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {p.feat.map((f,j)=>(
                    <div key={j} style={{display:'flex',gap:10,alignItems:'center'}}>
                      <div style={{width:18,height:18,borderRadius:'50%',background:`${p.color}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Check size={11} color={p.color}/></div>
                      <span style={{fontSize:13,color:C.muted}}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'80px 5%',background:`${C.card}44`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:12}}>{t.tKicker}</div>
            <h2 style={{fontSize:36,fontWeight:900}}>{t.tTitle}</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {t.testimonials.map((q,i)=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:28}}>
                <div style={{display:'flex',gap:2,marginBottom:18}}>{[...Array(5)].map((_,j)=><Star key={j} size={14} fill="#FF9500" color="#FF9500"/>)}</div>
                <p style={{fontSize:15,color:C.muted,lineHeight:1.7,marginBottom:24,fontStyle:'italic'}}>"{q.q}"</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16}}>{q.n[0]}</div>
                  <div><div style={{fontSize:14,fontWeight:700}}>{q.n}</div><div style={{fontSize:12,color:C.muted}}>{q.r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{padding:'100px 5%',position:'relative',overflow:'hidden'}}>
        <Glow color={C.purple} x="30%" y="50%" size={700}/><Glow color={C.pink} x="70%" y="50%" size={600}/>
        <div style={{maxWidth:700,margin:'0 auto',textAlign:'center',position:'relative'}}>
          <div style={{fontSize:11,color:C.pink,fontWeight:700,letterSpacing:2,marginBottom:16}}>{t.ctaKicker}</div>
          <h2 style={{fontSize:'clamp(30px,5vw,52px)',fontWeight:900,lineHeight:1.15,marginBottom:20}}>
            {t.ctaT1}{' '}<span style={{background:grad(C.purple,C.pink),WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{t.ctaT2}</span>
          </h2>
          <p style={{fontSize:17,color:C.muted,marginBottom:40}}>{t.ctaSub}</p>
          <Btn onClick={()=>nav('/auth?mode=register')} style={{fontSize:17,padding:'16px 40px'}}>{t.ctaBtn}</Btn>
          <div style={{marginTop:16,fontSize:13,color:C.dim}}>{t.ctaNote}</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:'60px 5% 32px',borderTop:`1px solid ${C.border}`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:48}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <div style={{width:30,height:30,borderRadius:8,background:grad(C.purple,C.pink),display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>S</div>
                <span style={{fontWeight:800,fontSize:15,letterSpacing:3}}>SCENVY</span>
              </div>
              <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:12}}>{t.footerTag}</p>
              <div style={{fontSize:12,color:C.dim}}>app.scenvy.de</div>
            </div>
            {[['Product',['Features','Pricing','Changelog','Demo']],['Company',['About','Blog','Careers','Press']],['Legal',['Privacy','Terms','GDPR','Imprint']]].map(([title,links])=>(
              <div key={title}>
                <div style={{fontSize:11,fontWeight:700,color:C.white,letterSpacing:1,marginBottom:14}}>{title.toUpperCase()}</div>
                {links.map(l=><div key={l} style={{fontSize:13,color:C.muted,marginBottom:10,cursor:'pointer'}} onMouseEnter={e=>e.target.style.color=C.white} onMouseLeave={e=>e.target.style.color=C.muted}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:24,display:'flex',justifyContent:'space-between'}}>
            <div style={{fontSize:13,color:C.dim}}>{t.footerCopy}</div>
            <div style={{fontSize:13,color:C.dim}}>{t.footerMade}</div>
          </div>
        </div>
      </footer>

      {showContact&&<ContactModal onClose={()=>setShowContact(false)} lang={lang}/>}
    </div>
  )
}
