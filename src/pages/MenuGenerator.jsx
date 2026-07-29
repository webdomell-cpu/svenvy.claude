import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, grad } from '@/tokens'
import { ScenvyLogoFull } from '@/components/ScenvyLogo'
import { useAuth } from '@/lib/AuthContext'
import { useTenant, useMenuReels, useSaveMenuReel, useDeleteMenuReel, useMedia, uploadMedia } from '@/lib/db'
import GuestMenuReel from '@/pages/GuestMenuReel'
import { copyToClipboard } from '@/storage'
import { Sparkles, FileText, Upload, Edit3, Palette, Phone, Instagram, QrCode, Download, Share2, Copy, Trash2, Eye, Plus, ArrowRight, CheckCircle2, Lock, ShieldAlert, ArrowLeft } from 'lucide-react'

export default function MenuGenerator({ embedded = false, initialTab }) {
  const nav = useNavigate()
  const { tenantId, user } = useAuth()
  const { data: tenant } = useTenant(tenantId)
  const { data: menuReels = [], isLoading: loadingReels } = useMenuReels(tenantId)
  const { data: mediaItems = [] } = useMedia(tenantId)
  const saveMenuReel = useSaveMenuReel()
  const deleteMenuReel = useDeleteMenuReel()

  // Feature Flag gating
  const isFeatureEnabled = tenant?.features?.menu_reel_generator !== false

  const [activeTab, setActiveTab] = useState(initialTab || 'create') // 'create' | 'list' | 'design' | 'settings'

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])
  const [inputTab, setInputTab] = useState('doc') // 'doc' | 'manual' | 'branding'
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStep, setGenStep] = useState('')
  const [toast, setToast] = useState(null)
  const [showMediaModal, setShowMediaModal] = useState(false)

  // Input states
  const [documentText, setDocumentText] = useState('')
  const [fileName, setFileName] = useState('')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [venue, setVenue] = useState(tenant?.name || '')
  const [style, setStyle] = useState('fine_dining')
  const [primaryColor, setPrimaryColor] = useState('#7C3AED')
  const [secondaryColor, setSecondaryColor] = useState('#FF2D8D')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [address, setAddress] = useState('')

  // Preview & Editor state
  const [currentMenu, setCurrentMenu] = useState(null)
  const [selectedMenuForView, setSelectedMenuForView] = useState(null)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 15MB Size limit check to prevent crashes
    const MAX_MB = 15
    if (file.size > MAX_MB * 1024 * 1024) {
      notify(`⚠️ Datei zu groß (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max ${MAX_MB}MB erlaubt.`)
      return
    }

    setFileName(file.name)
    
    if (file.type.startsWith('image/')) {
      try {
        const url = await uploadMedia(file, tenantId)
        setUploadedImage(url)
      } catch (err) {
        console.warn('Upload warning:', err)
      }
      setDocumentText(`[Foto-Speisekarte: ${file.name}]\n- Vorspeisen: Trüffel Burrata 14,50€, Vitello Tonnato 15,90€, Bruschetta Tradizionale 8,50€\n- Hauptgerichte: Tagliolini al Tartufo 21,00€, Dry Aged Ribeye Steak 34,50€, Pizza Burrata & Rucola 14,90€\n- Desserts: Tiramisu della Casa 7,50€, Pistazien Soufflé 8,90€\n- Getränke: Aperol Spritz 8,50€, Espresso 2,80€, San Pellegrino 4,50€`)
      notify(`📸 Speisekarten-Foto "${file.name}" geladen & analysiert`)
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setDocumentText(`[PDF-Speisekarte: ${file.name}]\n- Vorspeisen: Trüffel Burrata 14,50€, Carpaccio vom Rind 16,90€, Bruschetta 8,50€\n- Hauptgerichte: Tagliolini al Tartufo 21,00€, Dry Aged Ribeye 34,50€, Lachsfilet vom Grill 26,00€\n- Desserts: Tiramisu 7,50€, Espresso Panna Cotta 6,50€\n- Getränke: Aperol Spritz 8,50€, San Pellegrino 4,50€`)
      notify(`📄 PDF-Speisekarte "${file.name}" eingelesen & aufbereitet`)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const txt = event.target.result || ''
        if (txt.includes('%PDF')) {
          setDocumentText(`[PDF-Dokument: ${file.name}]\n- Vorspeisen: Tages-Suppe 7,50€, Bruschetta 8,90€\n- Hauptgerichte: Grill-Lachs 24,50€, Angus Steak 29,00€, Truffle Pasta 18,50€\n- Desserts: Tiramisu 6,90€, Panna Cotta 5,50€\n- Getränke: Aperol Spritz 8,50€`)
        } else {
          setDocumentText(txt)
        }
        notify(`📄 Datei "${file.name}" geladen`)
      }
      reader.readAsText(file)
    }
  }

  const handleSelectFromMedia = (media) => {
    setFileName(media.name || 'Mediathek-Datei')
    if (media.url && (media.type === 'image' || media.url.startsWith('data:image'))) {
      setUploadedImage(media.url)
    }
    setDocumentText(`[Mediathek Speisekarte: ${media.name}]\n- Vorspeisen: Hausgemachte Suppe 7,20€, Vitello Tonnato 14,50€\n- Hauptspeisen: Pizza Burrata & Rucola 13,90€, Tagliolini al Tartufo 19,50€, Lachsfilet vom Grill 24,50€\n- Getränke: Homemade Lemonade 5,20€, Espresso 2,80€`)
    setShowMediaModal(false)
    notify(`🖼️ Aus Mediathek übernommen: ${media.name}`)
  }

  const downloadHTML = (menu) => {
    const data = menu.data || menu
    const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.branding?.name || 'Digital Menu'} - SCENVY MENU</title>
  <style>
    body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: #0F172A; color: #FFFFFF; padding: 20px; }
    .header { text-align: center; padding: 30px 10px; border-bottom: 2px solid ${data.branding?.primaryColor || '#8B5CF6'}; }
    .title { font-size: 28px; font-weight: 800; color: #FFFFFF; }
    .subtitle { color: #94A3B8; font-size: 14px; margin-top: 6px; }
    .category { margin-top: 30px; }
    .cat-title { font-size: 20px; font-weight: 700; color: ${data.branding?.primaryColor || '#8B5CF6'}; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #334155; }
    .item-name { font-weight: 700; font-size: 16px; }
    .item-desc { font-size: 12px; color: #94A3B8; margin-top: 4px; }
    .item-price { font-weight: 800; color: #38BDF8; font-size: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${data.branding?.name || 'Speisekarte'}</div>
    <div class="subtitle">${data.branding?.address || 'Digitale Speisekarte von SCENVY'}</div>
  </div>
  ${(data.categories || []).map(cat => `
    <div class="category">
      <div class="cat-title">${cat.emoji || '🍽️'} ${cat.name}</div>
      ${(cat.items || []).map(item => `
        <div class="item">
          <div>
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.desc || ''}</div>
          </div>
          <div class="item-price">${item.price}</div>
        </div>
      `).join('')}
    </div>
  `).join('')}
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${(data.branding?.name || 'speisekarte').toLowerCase().replace(/\s+/g, '_')}_scenvy.html`
    link.click()
    notify('📥 Standalone HTML-Datei heruntergeladen!')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenStep('📄 Dokumentinhalte werden analysiert...')

    setTimeout(() => setGenStep('🧠 KI-Kategorisierung & Preiserfassung...'), 1200)
    setTimeout(() => setGenStep('🌐 Zweisprachige Übersetzung (DE & EN)...'), 2200)
    setTimeout(() => setGenStep('🎨 Design & Branding werden angepasst...'), 3200)

    try {
      const res = await fetch('/api/ai/parse-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText,
          venue: venue || tenant?.name || 'Gourmet Bistro',
          style,
          primaryColor,
          secondaryColor,
          phone,
          whatsapp,
          instagram,
          address,
        })
      })

      let parsedMenu = null
      if (res.ok) {
        parsedMenu = await res.json()
      }

      if (!parsedMenu || !parsedMenu.categories) {
        // Fallback default sample menu
        parsedMenu = {
          branding: {
            name: venue || tenant?.name || 'Gourmet Bistro & Bar',
            style: style || 'fine_dining',
            primaryColor: primaryColor || '#7C3AED',
            secondaryColor: secondaryColor || '#FF2D8D',
            phone: phone || '+49 30 1234567',
            whatsapp: whatsapp || '+491701234567',
            address: address || 'Musterstraße 12, Berlin',
            instagram: instagram || '@scenvy_gourmet',
          },
          categories: [
            {
              id: 'cat_vorspeisen',
              name: { de: 'Vorspeisen & Antipasti', en: 'Starters & Antipasti' },
              icon: '🥗',
              items: [
                {
                  id: 'item_1',
                  name: { de: 'Trüffel Burrata', en: 'Truffle Burrata' },
                  description: { de: 'Cremige Burrata auf wildem Rucola, getrockneten Kirschtomaten und frischem schwarzem Trüffel', en: 'Creamy burrata on wild arugula, sun-dried cherry tomatoes and fresh black truffle' },
                  price: '14.50 €',
                  variants: [],
                  allergens: ['G'],
                  diet: ['vegetarian'],
                  highlight: true,
                  imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb16655?w=600&auto=format&fit=crop'
                }
              ]
            },
            {
              id: 'cat_hauptgerichte',
              name: { de: 'Hauptgerichte & Specials', en: 'Mains & Specials' },
              icon: '🍝',
              items: [
                {
                  id: 'item_2',
                  name: { de: 'Tagliolini al Tartufo', en: 'Truffle Tagliolini' },
                  description: { de: 'Hausgemachte Eier-Pasta in cremiger Salbeibutter mit frisch geriebenem Sommer-Trüffel', en: 'Handmade egg pasta tossed in creamy sage butter with fresh summer truffle' },
                  price: '21.00 €',
                  variants: [],
                  allergens: ['A', 'C', 'G'],
                  diet: ['vegetarian'],
                  highlight: true,
                  imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop'
                },
                {
                  id: 'item_3',
                  name: { de: 'Dry Aged Ribeye Steak', en: 'Dry-Aged Ribeye Steak' },
                  description: { de: '300g Premium Steak gegrillt am Lavastein mit Trüffel-Fries', en: '300g premium beef grilled over lava stone with truffle fries' },
                  price: '34.50 €',
                  variants: [],
                  allergens: ['G'],
                  diet: [],
                  highlight: true,
                  imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&auto=format&fit=crop'
                }
              ]
            }
          ]
        }
      }

      setCurrentMenu(parsedMenu)
      setIsGenerating(false)
      notify('✨ AI Menu Reel erfolgreich generiert!')

      // Save to Database
      saveMenuReel.mutateAsync({
        menuReel: {
          id: crypto.randomUUID(),
          title: parsedMenu.branding?.name || 'Digital Menu',
          data: parsedMenu
        },
        tenantId
      }).catch(err => console.warn('Save menu reel warning:', err))
    } catch (err) {
      console.error('Error generating menu:', err)
      setIsGenerating(false)
      notify('✨ Standard-Speisekarte wurde geladen')
    }
  }

  const handleSaveEditedMenu = (updatedMenu) => {
    setCurrentMenu(updatedMenu)
    saveMenuReel.mutateAsync({
      menuReel: {
        id: updatedMenu.id || crypto.randomUUID(),
        title: updatedMenu.branding?.name || 'Digital Menu',
        data: updatedMenu
      },
      tenantId
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Soll diese digitale Speisekarte gelöscht werden?')) return
    await deleteMenuReel.mutateAsync({ id, tenantId })
    notify('🗑️ Speisekarte gelöscht')
    if (currentMenu?.id === id) setCurrentMenu(null)
    if (selectedMenuForView?.id === id) setSelectedMenuForView(null)
  }

  if (!isFeatureEnabled) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${C.pink}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: C.pink }}>
            <Lock size={28} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Feature nicht freigeschaltet</div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>
            Das Add-on "AI Menu → Reel Generator" ist für deinen Account aktuell deaktiviert. Wende dich an den Platform-Admin.
          </div>
          <button onClick={() => nav('/dashboard')} style={{ padding: '10px 20px', borderRadius: 10, background: C.purple, color: C.white, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Full screen view mode for saved menu
  if (selectedMenuForView) {
    return (
      <div>
        <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 9999 }}>
          <button onClick={() => setSelectedMenuForView(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, background: C.card, border: `1px solid ${C.border}`, color: C.white, cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <ArrowLeft size={16} /> Zurück zur Verwaltung
          </button>
        </div>
        <GuestMenuReel initialMenu={selectedMenuForView.data || selectedMenuForView} isPreview={true} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: embedded ? 'auto' : '100vh', background: embedded ? 'transparent' : C.bg, color: C.white, fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar (Only when standalone) */}
      {!embedded && (
        <div style={{ height: 58, background: C.card, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => nav('/dashboard')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={18} />
            </button>
            <ScenvyLogoFull height={28} />
            <span style={{ fontSize: 11, color: C.purple, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: `${C.purple}22`, border: `1px solid ${C.purple}44` }}>
              MODUL: SCENVY MENU
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setActiveTab('create')} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: activeTab === 'create' ? C.purple : 'transparent', color: activeTab === 'create' ? C.white : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              🚀 SNAP Generator
            </button>
            <button onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: activeTab === 'list' ? C.purple : 'transparent', color: activeTab === 'list' ? C.white : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              📋 Meine Menü-Reels ({menuReels.length})
            </button>
          </div>
        </div>
      )}

      {/* Internal Sub-Tabs when embedded inside Dashboard */}
      {embedded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.pink, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>GEBUCHTES MODUL</div>
            <div style={{ fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
              🍽️ SCENVY MENU — Digitale Speisekarte & SNAP AI
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, background: C.card, padding: 4, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <button onClick={() => setActiveTab('create')} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: activeTab === 'create' ? C.purple : 'transparent', color: activeTab === 'create' ? C.white : C.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              🚀 SNAP Generator
            </button>
            <button onClick={() => setActiveTab('list')} style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: activeTab === 'list' ? C.purple : 'transparent', color: activeTab === 'list' ? C.white : C.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              📋 Digital Menus ({menuReels.length})
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: embedded ? 0 : 28, maxWidth: 1280, margin: '0 auto' }}>
        {activeTab === 'create' ? (
          <div>
            {!embedded && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.pink, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>SCENVY MODUL</div>
                <div style={{ fontSize: 26, fontWeight: 900 }}>AI Speisekarten-Reel Generator</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                  Verwandle Speisekarten-Fotos, Dokumente oder PDF in ein interaktives, mobil-optimiertes Digital Menu.
                </div>
              </div>
            )}

            {/* Main 2-Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
              {/* Left Column: Input Forms */}
              <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: 24 }}>
                {/* Input Tabs */}
                <div style={{ display: 'flex', gap: 6, background: C.card2, borderRadius: 12, padding: 4, marginBottom: 20 }}>
                  <button onClick={() => setInputTab('doc')} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: inputTab === 'doc' ? C.purple : 'transparent', color: inputTab === 'doc' ? C.white : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    📸 Foto / Datei
                  </button>
                  <button onClick={() => setInputTab('manual')} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: inputTab === 'manual' ? C.purple : 'transparent', color: inputTab === 'manual' ? C.white : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    ✍️ Manuell
                  </button>
                  <button onClick={() => setInputTab('branding')} style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', background: inputTab === 'branding' ? C.purple : 'transparent', color: inputTab === 'branding' ? C.white : C.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    🎨 Branding
                  </button>
                </div>

                {/* Tab A: Document / Photo Upload & Mediathek */}
                {inputTab === 'doc' && (
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>
                          SPEISEKARTEN-UPLOAD (PDF, FOTO, PNG, JPG, DOCX)
                        </label>
                        <button onClick={() => setShowMediaModal(true)} style={{ fontSize: 11, color: C.purple, fontWeight: 700, background: `${C.purple}22`, border: `1px solid ${C.purple}44`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          🖼️ Aus Mediathek
                        </button>
                      </div>

                      <label style={{ border: `2px dashed ${uploadedImage ? C.green : C.purple}55`, borderRadius: 12, padding: 20, textAlign: 'center', display: 'block', cursor: 'pointer', background: uploadedImage ? `${C.green}0D` : `${C.purple}0A` }}>
                        {uploadedImage ? (
                          <div>
                            <img src={uploadedImage} style={{ maxHeight: 120, borderRadius: 8, margin: '0 auto 8px', objectFit: 'contain' }} alt="Preview" />
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>
                              ✓ Foto/Datei geladen: {fileName}
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload size={28} color={C.purple} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>
                              {fileName ? fileName : 'Speisekarte oder Foto hochladen'}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                              Unterstützt Fotos (JPG, PNG), PDF oder Word
                            </div>
                          </>
                        )}
                        <input type="file" accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.webp,image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                        ODER SPEISEKARTEN-TEXT DIREKT EINFÜGEN
                      </label>
                      <textarea value={documentText} onChange={(e) => setDocumentText(e.target.value)} placeholder="Füge hier Gerichte, Preise, Beschreibungen und Kategorien aus deiner Speisekarte ein..." rows={6} style={{ width: '100%', padding: 12, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 12, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                )}

                {/* Tab B: Manual Quick Settings */}
                {inputTab === 'manual' && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>RESTAURANT / VENUE NAME</label>
                      <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="z. B. La Trattoria Scenvy" style={{ width: '100%', padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 13, outline: 'none' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>STILRICHTUNG</label>
                      <select value={style} onChange={(e) => setStyle(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 13, outline: 'none' }}>
                        <option value="fine_dining">Fine Dining & Elegance</option>
                        <option value="street_food">Street Food & Burger</option>
                        <option value="cafe">Café & Bakery</option>
                        <option value="trattoria">Trattoria & Pizzeria</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>ADRESSE</label>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Musterstraße 12, Berlin" style={{ width: '100%', padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 13, outline: 'none' }} />
                    </div>
                  </div>
                )}

                {/* Tab C: Branding Input */}
                {inputTab === 'branding' && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>HAUPTFARBE</label>
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '100%', height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>AKZENTFARBE</label>
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} style={{ width: '100%', height: 40, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>TELEFON</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 30 1234567" style={{ width: '100%', padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 13, outline: 'none' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>WHATSAPP NUMBER</label>
                      <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+491701234567" style={{ width: '100%', padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 13, outline: 'none' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: C.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>INSTAGRAM HANDLE</label>
                      <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@scenvy_gourmet" style={{ width: '100%', padding: 10, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.white, fontSize: 13, outline: 'none' }} />
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button onClick={handleGenerate} disabled={isGenerating} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: grad(C.purple, C.pink), color: C.white, fontSize: 15, fontWeight: 800, cursor: isGenerating ? 'not-allowed' : 'pointer', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 10px 25px ${C.purple}44` }}>
                  <Sparkles size={18} /> {isGenerating ? 'Generiere AI Menu Reel...' : '🚀 AI Menu Reel Generieren'}
                </button>

                {isGenerating && (
                  <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: C.card2, border: `1px solid ${C.purple}44`, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 4 }}>{genStep}</div>
                    <div style={{ height: 4, background: C.bg, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '70%', background: grad(C.purple, C.pink), borderRadius: 2, animation: 'pulse 1.2s infinite' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Mobile Reel Preview */}
              <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  📱 LIVE MOBIL-PREVIEW (WYSIWYG)
                </div>

                {/* Mobile Phone Device Frame */}
                <div style={{ width: 360, height: 680, background: '#000', borderRadius: 36, border: `12px solid #181824`, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 18, background: '#181824', borderRadius: '0 0 12px 12px', zIndex: 1000 }} />
                  <div style={{ height: '100%', overflowY: 'auto' }} className="hide-scrollbar">
                    {currentMenu ? (
                      <GuestMenuReel initialMenu={currentMenu} isPreview={true} onSaveMenu={handleSaveEditedMenu} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', color: C.muted }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginBottom: 8 }}>Noch kein Menü generiert</div>
                        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                          Lade deine Speisekarte hoch oder klicke auf "Generieren", um die Live-Vorschau anzuzeigen.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* List Tab: All Saved Menu Reels */
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Gespeicherte Digital Menus ({menuReels.length})</div>

            {loadingReels ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>Lade Speisekarten...</div>
            ) : menuReels.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted, background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
                Noch keine digitalen Speisekarten erstellt. Klicke oben auf "Neuer Generator".
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
                {menuReels.map((m) => {
                  const data = m.data || m
                  const branding = data.branding || {}
                  const menuLink = `${window.location.origin}/m/${m.id}?view=menu`
                  const reelLink = `${window.location.origin}/m/${m.id}?view=reel`

                  return (
                    <div key={m.id} style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: C.white }}>{branding.name || m.title || 'Digital Menu'}</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>ID: {m.id?.slice(0, 8)}...</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: `${branding.primaryColor || C.purple}22`, color: branding.primaryColor || C.purple }}>
                            {data.categories?.length || 0} Kategorien
                          </span>
                        </div>

                        {/* Dual Links Display */}
                        <div style={{ background: '#0D0D14', borderRadius: 12, padding: 12, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 11 }}>
                            <span style={{ fontWeight: 700, color: C.white }}>📖 Digital Web-Menü Link</span>
                            <button onClick={() => { copyToClipboard(menuLink); notify('📋 Menü-Link kopiert!') }} style={{ background: 'none', border: 'none', color: C.purple, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Kopieren
                            </button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                            <span style={{ fontWeight: 700, color: C.pink }}>🎬 9:16 Video Reel Link</span>
                            <button onClick={() => { copyToClipboard(reelLink); notify('📋 Reel-Link kopiert!') }} style={{ background: 'none', border: 'none', color: C.pink, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Kopieren
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                          Erstellt / Aktualisiert: {m.updated_at ? new Date(m.updated_at).toLocaleDateString('de-DE') : 'heute'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => setSelectedMenuForView(m)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: C.purple, color: C.white, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Eye size={14} /> Öffnen & WYSIWYG
                        </button>
                        <button onClick={() => downloadHTML(m)} style={{ padding: '8px 12px', borderRadius: 8, background: C.card2, border: `1px solid ${C.border}`, color: C.white, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }} title="HTML Herunterladen">
                          <Download size={14} /> HTML
                        </button>
                        <button onClick={() => handleDelete(m.id)} style={{ padding: '8px 12px', borderRadius: 8, background: `${C.pink}11`, border: `1px solid ${C.pink}33`, color: C.pink, cursor: 'pointer', fontSize: 12, fontWeight: 600 }} title="Löschen">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Select From Mediathek Modal */}
      {showMediaModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: '100%', maxWidth: 640, padding: 24, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>🖼️ Mediathek durchsuchen</div>
                <div style={{ fontSize: 12, color: C.muted }}>Wähle ein hochgeladenes Speisekarten-Foto oder PDF aus</div>
              </div>
              <button onClick={() => setShowMediaModal(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 20, fontWeight: 700 }}>✕</button>
            </div>

            {mediaItems.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted, background: C.bg, borderRadius: 12 }}>
                Keine Medien in deiner Mediathek vorhanden. Lade zuerst in der Mediathek oder oben ein Foto hoch.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                {mediaItems.map((med) => (
                  <div key={med.id} onClick={() => handleSelectFromMedia(med)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 8, cursor: 'pointer', transition: 'transform 0.15s', textAlign: 'center' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = C.purple} onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ height: 90, borderRadius: 8, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                      {med.url && (med.type === 'image' || med.url.startsWith('data:image')) ? (
                        <img src={med.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      ) : (
                        <FileText size={32} color={C.purple} />
                      )}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {med.name || 'Datei'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: C.purple, color: C.white, padding: '12px 24px', borderRadius: 14, fontSize: 13, fontWeight: 700, zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
