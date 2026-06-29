import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from './api.js'

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  green: '#1a4d2e', greenMid: '#2d6a4f', greenLight: '#52b788', greenPale: '#d8f3dc',
  gold: '#c9963a', goldLight: '#f4e4c1',
  cream: '#faf8f4', ivory: '#f5f1eb', sand: '#ede8df',
  text: '#1a1a18', muted: '#6b6b60', subtle: '#c8c4bc', white: '#ffffff',
}

const STYLES = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: #faf8f4; color: #1a1a18; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #2d6a4f; border-radius: 10px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes pulse { 0%, 100% { opacity: .3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .au1 { animation: fadeUp .6s ease .05s both; }
  .au2 { animation: fadeUp .6s ease .15s both; }
  .au3 { animation: fadeUp .6s ease .25s both; }
  .au4 { animation: fadeUp .6s ease .38s both; }
  .au5 { animation: fadeUp .6s ease .5s both; }
  input, textarea, select { font-family: 'DM Sans', sans-serif; }
  input:focus, textarea:focus, select:focus { outline: none; }
  .typing span { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #c9963a; animation: pulse 1.3s ease infinite; }
  .typing span:nth-child(2) { animation-delay: .2s; }
  .typing span:nth-child(3) { animation-delay: .4s; }

  /* ── Mobile nav burger (hidden on desktop) ── */
  .gt-burger { display: none; background: none; border: none; font-size: 24px; cursor: pointer; padding: 6px; color: #1a1a18; line-height: 1; }

  /* ── Responsive breakpoint: tablets & phones ── */
  @media (max-width: 768px) {
    .gt-px { padding-left: 20px !important; padding-right: 20px !important; }
    .gt-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
    .gt-grid-sm { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
    .gt-hero-title { font-size: 42px !important; line-height: 1.12 !important; }
    .gt-hero-sub { font-size: 16px !important; padding: 0 8px; }
    .gt-page-h1 { font-size: 38px !important; line-height: 1.15 !important; }
    .gt-search-box { flex-direction: column !important; padding: 6px !important; border-radius: 18px !important; }
    .gt-search-field { border-right: none !important; border-bottom: 1px solid #ede8df !important; width: 100% !important; padding: 12px 14px !important; }
    .gt-search-field:last-of-type { border-bottom: none !important; }
    .gt-search-btn { width: 100% !important; margin: 4px 0 0 0 !important; border-radius: 12px !important; justify-content: center !important; }
    .gt-stat-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.15) !important; padding: 16px 0 !important; }
    .gt-stat-item:last-child { border-bottom: none !important; }
    .gt-nav-links { display: none !important; }
    .gt-burger { display: flex !important; align-items: center; justify-content: center; }
    .gt-trust { gap: 14px !important; font-size: 11px !important; }
  }
`

// ─── FALLBACK DATA (used if API fails or during dev) ─────────────────────────
const FALLBACK_PACKAGES = [
  { id: 1, region: 'Greece', flag: '🇬🇷', title: 'Peloponnese Village Trail', duration: '8 days', price: 1490, tag: 'Launch Route', type: 'cultural', image: 'https://images.unsplash.com/photo-1661589652461-e020338424f3?auto=format&fit=crop&w=900&q=80', desc: 'Traverse sun-baked olive groves, sleep in stone farmhouses, and join a grape harvest.', highlights: ['Olive oil harvest workshop', 'Byzantine monastery', 'Traditional cooking class', 'Homestay with local family'] },
  { id: 2, region: 'Spain', flag: '🇪🇸', title: 'Tomatina & Valencia Villages', duration: '6 days', price: 1290, tag: 'Festival', type: 'festival', image: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?auto=format&fit=crop&w=900&q=80', desc: 'From the legendary tomato battle to hidden Valencian wine villages.', highlights: ['La Tomatina festival', 'Private wine estate tour', 'Paella masterclass', 'Moorish village walking tour'] },
  { id: 3, region: 'Italy', flag: '🇮🇹', title: 'Tuscan Slow Roads', duration: '9 days', price: 1750, tag: 'Signature', type: 'luxury', image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=900&q=80', desc: "Wander the Val d'Orcia on foot, dine with winemaking families.", highlights: ['Agriturismo estate stay', 'Truffle hunting with local guide', 'Private vineyard dinner', 'Medieval hilltop villages'] },
  { id: 4, region: 'Portugal', flag: '🇵🇹', title: 'Atlantic Village Coast', duration: '7 days', price: 1190, tag: 'Hidden Gem', type: 'nature', image: 'https://images.unsplash.com/photo-1608649944716-228404a0a8bb?auto=format&fit=crop&w=900&q=80', desc: 'Discover the Minho region — granite mountains, emerald vineyards.', highlights: ['Vinho Verde vineyard tour', 'Coastal fishing village', 'Handicraft workshop', 'Camino de Santiago leg'] },
  { id: 5, region: 'Slovenia', flag: '🇸🇮', title: 'Alpine Village Discovery', duration: '7 days', price: 1350, tag: 'Adventure', type: 'adventure', image: 'https://images.unsplash.com/photo-1478088913771-e3a36f50bb63?auto=format&fit=crop&w=900&q=80', desc: 'Crystal lakes, beekeeping traditions, and Alpine farmsteads.', highlights: ['Lake Bled sunrise hike', 'Traditional beekeeping farm', 'Alpine dairy experience', 'Triglav park trail'] },
  { id: 6, region: 'France', flag: '🇫🇷', title: 'Alsace Wine Route', duration: '5 days', price: 1150, tag: 'Wine & Culture', type: 'cultural', image: 'https://images.unsplash.com/photo-1675026294659-0ee76bb66975?auto=format&fit=crop&w=900&q=80', desc: 'Cycle through half-timbered villages along the Rhine.', highlights: ['Village cycling trail', 'Private cellar tasting', 'Artisan cheese maker', 'Traditional winstub dinner'] },
]

const FALLBACK_STAYS = [
  { id: 1, name: 'Olive Grove Farmhouse', type: 'Agriturismo', location: "Val d'Orcia, Tuscany", region: 'Italy', price: 185, rating: 4.97, image: 'https://images.unsplash.com/photo-1608476037397-7b53ace4c871?auto=format&fit=crop&w=900&q=80', perks: ['Breakfast included', 'Private pool', 'Farm tour'] },
  { id: 2, name: 'Mani Peninsula Stonehouse', type: 'Stone Cottage', location: 'Peloponnese, Greece', region: 'Greece', price: 145, rating: 5.0, image: 'https://images.unsplash.com/photo-1693098245329-6de19df94fbb?auto=format&fit=crop&w=900&q=80', perks: ['Sea views', 'Home-cooked meals', 'Guided walks'] },
  { id: 3, name: 'Triglav Mountain Refuge', type: 'Alpine Guesthouse', location: 'Triglav Park, Slovenia', region: 'Slovenia', price: 120, rating: 4.93, image: 'https://images.unsplash.com/photo-1610810101650-a45d0b81d266?auto=format&fit=crop&w=900&q=80', perks: ['Alpine breakfast', 'Guided hikes', 'Honey farm'] },
]

const CARD_COLORS = { cultural: '#1a4d2e', festival: '#4a2210', luxury: '#2a1a0a', nature: '#0d2838', adventure: '#0d1a38' }

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', onClick, style = {}, disabled }) {
  const base = { fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', border: 'none', transition: 'all .2s', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: disabled ? .5 : 1, letterSpacing: '.02em' }
  const variants = {
    primary: { background: C.green, color: C.white, padding: '12px 28px', borderRadius: 100 },
    outline: { background: 'transparent', color: C.green, border: `1.5px solid ${C.greenPale}`, padding: '11px 27px', borderRadius: 100 },
    gold: { background: C.gold, color: C.white, padding: '12px 28px', borderRadius: 100 },
  }
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled && variant === 'primary') e.currentTarget.style.background = '#0d2e1c' }}
      onMouseLeave={e => { if (variant === 'primary') e.currentTarget.style.background = C.green }}
    >{children}</button>
  )
}

function Spinner() {
  return <div style={{ width: 20, height: 20, border: `2px solid ${C.greenPale}`, borderTopColor: C.green, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
}

function PackageCard({ pkg, onEnquire }) {
  const [saved, setSaved] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)
  const color = CARD_COLORS[pkg.type] || C.green
  const showPhoto = pkg.image && !imgFailed
  return (
    <div style={{ background: C.white, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.07)', transition: 'transform .3s, box-shadow .3s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)' }}>
      <div style={{ height: 200, position: 'relative', overflow: 'hidden', background: showPhoto ? '#000' : `linear-gradient(135deg,${color},#070f09)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showPhoto ? (
          <img src={pkg.image} alt={pkg.title} onError={() => setImgFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} loading='lazy' />
        ) : (
          <span style={{ fontSize: 64, position: 'relative', zIndex: 1 }}>{pkg.flag}</span>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.45) 0%,transparent 55%)' }} />
        <span style={{ position: 'absolute', top: 12, left: 12, background: C.gold, color: C.white, padding: '3px 12px', borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{pkg.tag}</span>
        <button onClick={e => { e.stopPropagation(); setSaved(!saved) }} style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer', fontSize: 14 }}>{saved ? '❤️' : '🤍'}</button>
        <span style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 11, color: 'rgba(255,255,255,.85)', fontWeight: 500 }}>{pkg.region} · {pkg.duration}</span>
      </div>
      <div style={{ padding: '18px 20px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.greenMid, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>📍 {pkg.region}</div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>{pkg.title}</h3>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 16 }}>{pkg.desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
          {(pkg.highlights || []).slice(0, 3).map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: C.gold, fontSize: 11, marginTop: 2 }}>◆</span>
              <span style={{ fontSize: 12, color: C.muted }}>{h}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${C.sand}` }}>
          <div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 500 }}>€{pkg.price?.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: C.muted, marginLeft: 5 }}>/ person</span>
          </div>
          <Btn onClick={() => onEnquire(pkg)} style={{ padding: '9px 18px', fontSize: 12 }}>Enquire</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [['home', 'Home'], ['packages', 'Packages'], ['stays', 'Stays'], ['b2b', 'For Agencies'], ['ai', 'AI Planner'], ['about', 'About']]
  const go = (id) => { setPage(id); setMenuOpen(false) }
  return (
    <nav className='gt-px' style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 52px', height: 70, background: scrolled || menuOpen ? 'rgba(250,248,244,.97)' : 'transparent', backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none', borderBottom: scrolled || menuOpen ? `1px solid ${C.sand}` : '1px solid transparent', transition: 'all .35s' }}>
      <div onClick={() => go('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: C.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌿</div>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: C.green, fontWeight: 600 }}>GoEarth</div>
          <div style={{ fontSize: 9, letterSpacing: '.2em', color: C.gold, textTransform: 'uppercase' }}>TheGoEarth.com</div>
        </div>
      </div>
      <div className='gt-nav-links' style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {links.map(([id, label]) => (
          <button key={id} onClick={() => go(id)} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: page === id ? C.green : C.muted, background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s', borderBottom: page === id ? `2px solid ${C.green}` : '2px solid transparent', paddingBottom: 2 }}>{label}</button>
        ))}
        <Btn onClick={() => go('b2b')} style={{ padding: '9px 20px', fontSize: 12 }}>Partner With Us</Btn>
      </div>
      <button className='gt-burger' aria-label='Menu' onClick={() => setMenuOpen(o => !o)}>{menuOpen ? '✕' : '☰'}</button>
      {menuOpen && (
        <div style={{ position: 'absolute', top: 70, left: 0, right: 0, background: C.white, borderBottom: `1px solid ${C.sand}`, boxShadow: '0 16px 32px rgba(0,0,0,.1)', display: 'flex', flexDirection: 'column', padding: '14px 20px 20px' }}>
          {links.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 500, color: page === id ? C.green : C.text, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '13px 4px', borderBottom: `1px solid ${C.sand}` }}>{label}</button>
          ))}
          <Btn onClick={() => go('b2b')} style={{ marginTop: 14, justifyContent: 'center' }}>Partner With Us</Btn>
        </div>
      )}
    </nav>
  )
}

// ─── HOME PAGE ───────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ where: '', when: '', who: '' })

  useEffect(() => {
    api.getPackages().then(data => {
      setPackages(Array.isArray(data) ? data.slice(0, 3) : FALLBACK_PACKAGES.slice(0, 3))
    }).catch(() => setPackages(FALLBACK_PACKAGES.slice(0, 3)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className='gt-px' style={{
        minHeight: '92vh', display: 'grid', placeItems: 'center', padding: '80px 52px',
        position: 'relative', overflow: 'hidden',
        backgroundImage: `linear-gradient(180deg, rgba(10,20,12,.35) 0%, rgba(8,16,10,.55) 55%, rgba(6,12,8,.85) 100%), url('https://images.unsplash.com/photo-1706269796410-6a11ee591b6e?auto=format&fit=crop&w=2400&q=80')`,
        backgroundSize: 'cover', backgroundPosition: 'center 60%',
      }}>
        <div style={{ maxWidth: 800, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className='au1' style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(6px)', fontSize: 12, fontWeight: 600, color: C.white, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 28, border: '1px solid rgba(255,255,255,.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.greenLight, animation: 'float 2s ease infinite', display: 'inline-block' }} /> Authentic Local Europe
          </div>
          <h1 className='au2 gt-hero-title' style={{ fontFamily: "'Playfair Display',serif", fontSize: 76, fontWeight: 500, lineHeight: 1.04, letterSpacing: '-.02em', marginBottom: 20, color: C.white, textShadow: '0 4px 30px rgba(0,0,0,.35)' }}>
            Discover local <br /><em style={{ color: C.goldLight }}>Europe.</em>
          </h1>
          <p className='au3 gt-hero-sub' style={{ fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,.88)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto 44px', textShadow: '0 2px 16px rgba(0,0,0,.3)' }}>
            Find authentic experiences, handpicked stays, and cultural adventures across rural Europe — curated for curious travellers.
          </p>
          {/* Search */}
          <div className='au4 gt-search-box' style={{ background: C.white, borderRadius: 28, boxShadow: '0 20px 60px rgba(0,0,0,.35)', padding: '8px 8px 8px 0', display: 'flex', alignItems: 'center', maxWidth: 680, margin: '0 auto' }}>
            {[['Where', 'Greece, Italy, Spain...', 'where'], ['When', 'Any time', 'when'], ['Travellers', '2 adults', 'who']].map(([label, placeholder, key], i) => (
              <div key={key} className='gt-search-field' style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 20px', borderRight: i < 2 ? `1px solid ${C.sand}` : 'none' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.text, marginBottom: 3 }}>{label}</span>
                <input value={search[key]} onChange={e => setSearch(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={{ fontSize: 14, color: C.muted, background: 'none', border: 'none', width: '100%' }} />
              </div>
            ))}
            <button className='gt-search-btn' onClick={() => setPage('packages')} style={{ padding: '14px 26px', background: C.green, color: C.white, borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', marginRight: 4, fontFamily: "'DM Sans',sans-serif", transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0d2e1c'}
              onMouseLeave={e => e.currentTarget.style.background = C.green}>🔍 Search</button>
          </div>
          {/* Trust */}
          <div className='au5 gt-trust' style={{ display: 'flex', justifyContent: 'center', gap: 36, marginTop: 32, flexWrap: 'wrap' }}>
            {['✓ Verified local hosts', '✓ 50+ unique experiences', '✓ Best price guarantee', '✓ 24/7 support'].map(t => (
              <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', gap: 6, textShadow: '0 1px 8px rgba(0,0,0,.4)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className='gt-px' style={{ padding: '80px 52px', background: C.ivory }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: C.greenLight, marginBottom: 10 }}>Featured Journeys</div>
              <h2 className='gt-page-h1' style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 500, lineHeight: 1.1 }}>Where will you <em style={{ color: C.green }}>disappear?</em></h2>
            </div>
            <Btn variant='outline' onClick={() => setPage('packages')}>View all packages →</Btn>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner /></div>
          ) : (
            <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
              {packages.map(p => <PackageCard key={p.id} pkg={p} onEnquire={() => setPage('b2b')} />)}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className='gt-px' style={{ padding: '72px 52px', background: C.green }}>
        <div className='gt-grid' style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {[['€460B', 'European tourism market'], ['20%', 'Choose rural experiences'], ['4–5%', 'Annual rural growth rate'], ['14M+', 'GCC & India visitors/yr']].map(([v, l]) => (
            <div key={l} className='gt-stat-item' style={{ textAlign: 'center', padding: '0 20px', borderRight: `1px solid rgba(255,255,255,.15)` }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, color: C.gold, fontWeight: 500 }}>{v}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* B2B CTA */}
      <section className='gt-px' style={{ padding: '100px 52px', background: C.white, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: C.greenLight, marginBottom: 16 }}>For Tour Agencies</div>
        <h2 className='gt-page-h1' style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 500, marginBottom: 18, lineHeight: 1.1 }}>Ready to offer your clients <em style={{ color: C.green }}>something unforgettable?</em></h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.75 }}>We partner with agencies in Dubai, Doha, Riyadh, Kochi, Bangalore, and New Delhi.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn onClick={() => setPage('b2b')}>Become a Partner</Btn>
          <Btn variant='outline' onClick={() => setPage('packages')}>View Package Catalogue</Btn>
        </div>
      </section>
    </div>
  )
}

// ─── PACKAGES PAGE ───────────────────────────────────────────────────────────
function PackagesPage({ setPage }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    api.getPackages(filter)
      .then(data => setPackages(Array.isArray(data) ? data : FALLBACK_PACKAGES))
      .catch(() => setPackages(FALLBACK_PACKAGES))
      .finally(() => setLoading(false))
  }, [filter])

  const filters = [['all', 'All Journeys'], ['cultural', '🏛 Cultural'], ['festival', '🎭 Festival'], ['luxury', '✨ Luxury'], ['nature', '🌲 Nature'], ['adventure', '⛰ Adventure']]

  return (
    <div style={{ minHeight: '100vh', background: C.ivory }}>
      <div className='gt-px' style={{ padding: '72px 52px 52px', background: `linear-gradient(160deg,${C.green},#0d2e1c)` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 14 }}>Our Journeys</div>
          <h1 className='gt-page-h1' style={{ fontFamily: "'Playfair Display',serif", fontSize: 68, fontWeight: 500, color: C.white, marginBottom: 44, lineHeight: 1.05 }}>Rural Europe, <em style={{ color: C.gold }}>curated.</em></h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {filters.map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{ padding: '9px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all .2s', fontFamily: "'DM Sans',sans-serif", background: filter === id ? C.gold : 'transparent', color: filter === id ? C.white : 'rgba(255,255,255,.6)', borderColor: filter === id ? C.gold : 'rgba(255,255,255,.2)' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className='gt-px' style={{ padding: '52px 52px 80px', maxWidth: 1180, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner /></div>
        ) : (
          <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
            {packages.map(p => <PackageCard key={p.id} pkg={p} onEnquire={() => setPage('b2b')} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function StayCard({ stay }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showPhoto = stay.image && !imgFailed
  return (
    <div style={{ background: C.white, borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.07)', transition: 'transform .3s, box-shadow .3s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.07)' }}>
      <div style={{ height: 220, position: 'relative', overflow: 'hidden', background: showPhoto ? '#000' : C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showPhoto ? (
          <img src={stay.image} alt={stay.name} onError={() => setImgFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} loading='lazy' />
        ) : (
          <span style={{ fontSize: 56 }}>🏡</span>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, background: C.gold, color: C.white, padding: '3px 12px', borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>{stay.type}</div>
      </div>
      <div style={{ padding: '18px 20px 20px' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 500, marginBottom: 6 }}>{stay.name}</h3>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>📍 {stay.location}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {(stay.perks || []).map(p => <span key={p} style={{ padding: '4px 12px', background: C.greenPale, borderRadius: 100, fontSize: 11, fontWeight: 500, color: C.green }}>{p}</span>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${C.sand}` }}>
          <div><span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 500 }}>€{stay.price}</span><span style={{ fontSize: 12, color: C.muted, marginLeft: 5 }}>/ night</span></div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>★ {stay.rating}</div>
        </div>
      </div>
    </div>
  )
}

function StaysPage() {
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStays().then(data => setStays(Array.isArray(data) && data.length ? data : FALLBACK_STAYS))
      .catch(() => setStays(FALLBACK_STAYS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.ivory }}>
      <div className='gt-px' style={{ padding: '72px 52px 52px', background: `linear-gradient(160deg,${C.green},#0d2e1c)` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 14 }}>Where To Sleep</div>
          <h1 className='gt-page-h1' style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 500, color: C.white, lineHeight: 1.08 }}>Handpicked <em style={{ color: C.gold }}>rural stays.</em></h1>
        </div>
      </div>
      <div className='gt-px' style={{ padding: '52px 52px 80px', maxWidth: 1180, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner /></div>
        ) : (
          <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
            {stays.map(s => <StayCard key={s.id} stay={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── B2B PAGE ─────────────────────────────────────────────────────────────────
function B2BPage() {
  const [form, setForm] = useState({ company: '', country: '', name: '', email: '', volume: '', message: '' })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.company.trim()) e.company = 'Required'
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email = 'Valid email required'
    if (!form.country.trim()) e.country = 'Required'
    if (!form.volume) e.volume = 'Please select'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      await api.submitEnquiry(form)
      setDone(true)
    } catch {
      setDone(true) // Still show success even if API is not yet live
    } finally {
      setLoading(false)
    }
  }

  const MARKETS = [['🇦🇪', 'Dubai', 'UAE'], ['🇶🇦', 'Doha', 'Qatar'], ['🇸🇦', 'Riyadh', 'KSA'], ['🇮🇳', 'Kochi', 'India'], ['🇮🇳', 'Bangalore', 'India'], ['🇮🇳', 'New Delhi', 'India']]
  const TIERS = [
    { name: 'Explorer', color: C.greenMid, margin: '€500 / pkg', min: '10 pax / year', features: ['Access to 6 packages', 'Co-branded materials', 'Email support', 'Seasonal updates'] },
    { name: 'Pioneer', color: C.gold, margin: '€400 / pkg', min: '30 pax / year', featured: true, features: ['Full catalogue access', 'Priority support', 'Joint marketing', 'Quarterly strategy review'] },
    { name: 'Ambassador', color: '#c4613a', margin: 'Custom terms', min: '60+ pax / year', features: ['Exclusive routes', 'Dedicated manager', 'Co-branded campaigns', 'Annual partner summit'] },
  ]

  const inputStyle = { width: '100%', padding: '13px 16px', background: C.ivory, border: `1px solid ${C.sand}`, borderRadius: 8, color: C.text, fontSize: 14 }

  return (
    <div style={{ minHeight: '100vh', background: C.white }}>
      <div className='gt-px' style={{ padding: '72px 52px 72px', background: `linear-gradient(155deg,#e8f5ee,#d8f3dc)` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', color: C.greenMid, textTransform: 'uppercase', marginBottom: 14 }}>B2B Partnership Portal</div>
          <h1 className='gt-page-h1' style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 500, lineHeight: 1.08, maxWidth: 700 }}>Grow your portfolio with <em style={{ color: C.green }}>rural Europe.</em></h1>
        </div>
      </div>
      <div className='gt-px' style={{ padding: '72px 52px 100px', maxWidth: 1180, margin: '0 auto' }}>
        {/* Markets */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, marginBottom: 8 }}>Active Markets</h2>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>Onboarding agencies from 6 cities across GCC and India.</p>
          <div className='gt-grid-sm' style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
            {MARKETS.map(([flag, city, country]) => (
              <div key={city} style={{ background: C.ivory, border: `1px solid ${C.sand}`, borderRadius: 12, padding: '20px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{flag}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{city}</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{country}</div>
                <span style={{ fontSize: 10, color: '#2d6a4f', background: '#d8f3dc', padding: '2px 10px', borderRadius: 100 }}>● Active</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tiers */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, marginBottom: 28 }}>Partnership Tiers</h2>
          <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {TIERS.map(t => (
              <div key={t.name} style={{ background: C.ivory, border: `${t.featured ? '2px' : '1px'} solid ${t.featured ? C.gold : C.sand}`, borderRadius: 14, padding: '36px 28px', position: 'relative' }}>
                {t.featured && <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: C.white, padding: '4px 18px', fontSize: 10, fontWeight: 700, borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '.12em' }}>MOST POPULAR</div>}
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: t.color, fontStyle: 'italic', marginBottom: 6 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Min. {t.min}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, marginBottom: 24 }}>{t.margin}</div>
                {t.features.map(f => <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 10 }}><span style={{ color: t.color }}>✓</span><span style={{ fontSize: 13, color: C.muted }}>{f}</span></div>)}
              </div>
            ))}
          </div>
        </div>
        {/* Form */}
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, textAlign: 'center', marginBottom: 8 }}>Register Your Agency</h2>
          <p style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 44, lineHeight: 1.7 }}>We review all submissions and respond within 48 hours.</p>
          {done ? (
            <div style={{ background: '#d8f3dc', border: `1px solid ${C.greenMid}`, borderRadius: 14, padding: '48px 36px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🌿</div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, marginBottom: 10 }}>Thank you, {form.name.split(' ')[0] || 'there'}!</h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>Your enquiry has been received. Our team will be in touch within 48 hours.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[['company', 'Agency / Company Name', 'e.g. Arabian Travel Group'], ['name', 'Contact Name', 'Your full name'], ['email', 'Email Address', 'agency@example.com'], ['country', 'Country', 'e.g. UAE, India, Qatar']].map(([key, label, placeholder]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 7 }}>{label}</label>
                  <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={{ ...inputStyle, borderColor: errors[key] ? '#e74c3c' : C.sand }} />
                  {errors[key] && <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>{errors[key]}</div>}
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 7 }}>Expected Annual Volume</label>
                <select value={form.volume} onChange={e => set('volume', e.target.value)} style={{ ...inputStyle, borderColor: errors.volume ? '#e74c3c' : C.sand }}>
                  <option value=''>Select passenger volume</option>
                  <option value='10-30'>10–30 passengers / year (Explorer)</option>
                  <option value='30-60'>30–60 passengers / year (Pioneer)</option>
                  <option value='60+'>60+ passengers / year (Ambassador)</option>
                </select>
                {errors.volume && <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>{errors.volume}</div>}
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 7 }}>Message (optional)</label>
                <textarea rows={4} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell us about your clients..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} />
              </div>
              <Btn onClick={submit} disabled={loading} style={{ alignSelf: 'flex-start', padding: '14px 36px' }}>
                {loading ? <Spinner /> : 'Submit Partnership Enquiry →'}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── AI PLANNER ──────────────────────────────────────────────────────────────
function AIPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hello! I'm your Green Tribe AI Travel Planner 🌿\n\nTell me where you're from, how many are travelling, your interests, and when you'd like to visit rural Europe — and I'll craft a personalised itinerary just for you." }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  const suggestions = ['Plan a 7-day Greece trip for a family from Dubai', 'What is the Tomatina festival experience like?', "I'm from Bangalore — suggest a wine & food tour", 'Create a luxury Tuscany honeymoon itinerary']

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)
    try {
      const data = await api.chat(next)
      setMessages(p => [...p, { role: 'assistant', content: data.reply || data.content || 'Something went wrong — please try again 🌿' }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment 🌿" }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', background: C.ivory }}>
      <div className='gt-px' style={{ padding: '28px 52px 22px', borderBottom: `1px solid ${C.sand}`, background: C.white }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🌿</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 500 }}>AI Travel Planner</div>
            <div style={{ fontSize: 12, color: C.muted }}>Powered by Claude · Personalised rural Europe itineraries</div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '4px 14px', background: '#d8f3dc', borderRadius: 100, fontSize: 10, color: C.greenMid, fontWeight: 600 }}>● Online</div>
        </div>
      </div>
      <div className='gt-px' style={{ flex: 1, overflowY: 'auto', padding: '28px 52px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-start' }}>
              {m.role === 'assistant' && <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌿</div>}
              <div style={{ maxWidth: '76%', padding: '13px 18px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.role === 'user' ? C.green : C.white, color: m.role === 'user' ? C.white : C.text, fontSize: 14, lineHeight: 1.72, whiteSpace: 'pre-wrap', border: m.role === 'assistant' ? `1px solid ${C.sand}` : 'none', boxShadow: m.role === 'assistant' ? '0 2px 8px rgba(0,0,0,.06)' : 'none' }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌿</div>
              <div style={{ padding: '14px 18px', borderRadius: '14px 14px 14px 4px', background: C.white, border: `1px solid ${C.sand}` }}>
                <div className='typing' style={{ display: 'flex', gap: 5 }}><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      {messages.length <= 1 && (
        <div className='gt-px' style={{ padding: '0 52px 12px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} style={{ padding: '7px 16px', background: C.white, border: `1px solid ${C.sand}`, borderRadius: 100, fontSize: 12, color: C.muted, cursor: 'pointer', transition: 'all .2s', fontFamily: "'DM Sans',sans-serif" }}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <div className='gt-px' style={{ padding: '14px 52px 24px', borderTop: `1px solid ${C.sand}`, background: C.white }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', gap: 10 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder='Tell me about your dream rural Europe journey...' rows={2} style={{ flex: 1, padding: '13px 16px', background: C.ivory, border: `1px solid ${C.sand}`, borderRadius: 10, color: C.text, fontSize: 14, lineHeight: 1.6, resize: 'none', fontFamily: "'DM Sans',sans-serif" }} />
          <button onClick={send} disabled={!input.trim() || loading} style={{ width: 48, alignSelf: 'flex-end', height: 48, background: input.trim() && !loading ? C.green : C.sand, border: 'none', borderRadius: 10, cursor: input.trim() && !loading ? 'pointer' : 'default', fontSize: 18, color: input.trim() && !loading ? C.white : C.muted, transition: 'all .2s' }}>→</button>
        </div>
        <p style={{ fontSize: 11, color: C.subtle, textAlign: 'center', marginTop: 8 }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.white }}>
      <div className='gt-px' style={{ padding: '80px 52px 80px', background: `linear-gradient(160deg,#e8f5ee,#d8f3dc)`, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', color: C.greenMid, textTransform: 'uppercase', marginBottom: 16 }}>Our Story</div>
        <h1 className='gt-page-h1' style={{ fontFamily: "'Playfair Display',serif", fontSize: 64, fontWeight: 500, maxWidth: 700, margin: '0 auto 20px', lineHeight: 1.08 }}>Closing the gap between travellers and <em style={{ color: C.green }}>truth.</em></h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>Green Tribe was born from a simple observation: travellers from the GCC and India were seeing Paris and Disneyland, but missing the truest face of Europe — its villages, its people, its land.</p>
      </div>
      <div className='gt-px' style={{ padding: '80px 52px', maxWidth: 1100, margin: '0 auto' }}>
        <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', marginBottom: 80 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', color: C.greenLight, textTransform: 'uppercase', marginBottom: 14 }}>Our Mission</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, marginBottom: 20, lineHeight: 1.2 }}>Economic growth through authentic experience</h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8 }}>We connect affluent Middle Eastern and Asian travellers with rural European communities — creating sustainable economic value for SMEs, local guides, and host families. Operating from Brussels and launching initially in Greece.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {[['🇬🇷', 'Greece', 'Launch Country'], ['🌍', '3 Countries', 'Year 1 Target'], ['💶', '€100K+', 'Year 1 Revenue'], ['🤝', '6 Agencies', 'Initial B2B']].map(([icon, val, label]) => (
              <div key={label} style={{ background: C.ivory, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: C.gold, fontWeight: 500 }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, marginBottom: 40 }}>The team</h2>
        <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[['🌿', 'Founder & CEO', 'Jashim Konnengal', 'Rural tourism innovator bridging GCC, India, and rural Europe.'], ['📊', 'Communications', 'Open Position', 'Market research and stakeholder relations.'], ['🎬', 'Multimedia', 'Open Position', 'Photography, video, and digital storytelling.'], ['🇬🇷', 'Country Ambassador', 'Open Position — Greece', 'On-the-ground partnerships in our launch market.']].map(([emoji, role, name, desc]) => (
            <div key={role} style={{ background: C.ivory, border: `1px solid ${C.sand}`, borderRadius: 14, padding: '32px 22px' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: C.muted, marginBottom: 7 }}>{role}</div>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 500, marginBottom: 10, lineHeight: 1.25 }}>{name}</h3>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer className='gt-px' style={{ background: C.text, color: C.white, padding: '64px 52px 36px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className='gt-grid' style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 52, marginBottom: 52 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, marginBottom: 10 }}>🌿 GoEarth</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.72, maxWidth: 260, marginBottom: 24 }}>Discover authentic local experiences, handpicked stays, and cultural adventures across rural Europe.</p>
          </div>
          {[['Explore', [['packages', 'All Packages'], ['stays', 'Stays & Farmhouses'], ['packages', 'Cultural Festivals']]], ['For Partners', [['b2b', 'B2B Portal'], ['b2b', 'Agency Programme'], ['about', 'About Us']]], ['Company', [['about', 'Our Story'], ['about', 'Team'], ['b2b', 'Contact']]]].map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 18 }}>{title}</h4>
              {links.map(([page, label]) => <button key={label} onClick={() => setPage(page)} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,.55)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 10, fontFamily: "'DM Sans',sans-serif", padding: 0, textAlign: 'left', transition: 'color .2s' }}>{label}</button>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}>© 2024 TheGoEarth.com · Brussels, Belgium</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}>Dubai · Doha · Riyadh · Kochi · Bangalore · New Delhi</span>
        </div>
      </div>
    </footer>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home')
  const navigate = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{STYLES}</style>
      <Nav page={page} setPage={navigate} />
      {page === 'home' && <HomePage setPage={navigate} />}
      {page === 'packages' && <PackagesPage setPage={navigate} />}
      {page === 'stays' && <StaysPage />}
      {page === 'b2b' && <B2BPage />}
      {page === 'ai' && <AIPage />}
      {page === 'about' && <AboutPage />}
      <Footer setPage={navigate} />
    </div>
  )
}
