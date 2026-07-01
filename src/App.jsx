import { useState, useEffect, useRef } from 'react'
import { api } from './api.js'

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
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #2d6a4f; border-radius: 10px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes pulse { 0%, 100% { opacity: .3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .au1{animation:fadeUp .6s ease .05s both} .au2{animation:fadeUp .6s ease .15s both}
  .au3{animation:fadeUp .6s ease .25s both} .au4{animation:fadeUp .6s ease .38s both}
  .au5{animation:fadeUp .6s ease .5s both}
  input, textarea, select { font-family: 'DM Sans', sans-serif; }
  input:focus, textarea:focus, select:focus { outline: none; }
  .typing span { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #c9963a; animation: pulse 1.3s ease infinite; }
  .typing span:nth-child(2) { animation-delay: .2s; } .typing span:nth-child(3) { animation-delay: .4s; }
  .gt-burger { display: none; background: none; border: none; font-size: 24px; cursor: pointer; padding: 6px; color: #1a1a18; line-height: 1; }
  @media (max-width: 768px) {
    .gt-px { padding-left: 20px !important; padding-right: 20px !important; }
    .gt-grid { grid-template-columns: 1fr !important; gap: 18px !important; }
    .gt-grid-sm { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
    .gt-hero-title { font-size: 42px !important; line-height: 1.12 !important; }
    .gt-hero-sub { font-size: 16px !important; }
    .gt-page-h1 { font-size: 34px !important; line-height: 1.15 !important; }
    .gt-search-box { flex-direction: column !important; padding: 10px !important; border-radius: 18px !important; }
    .gt-search-field { border-right: none !important; border-bottom: 1px solid #ede8df !important; width: 100% !important; padding: 12px 14px !important; }
    .gt-search-btn { width: 100% !important; margin: 6px 0 0 0 !important; border-radius: 12px !important; justify-content: center; padding: 14px !important; }
    .gt-nav-links { display: none !important; }
    .gt-burger { display: flex !important; align-items: center; justify-content: center; }
    .gt-trust { gap: 14px !important; font-size: 11px !important; }
    .gt-stat-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,.15) !important; padding: 16px 0 !important; }
    .gt-stat-item:last-child { border-bottom: none !important; }
  }
`

// ── FALLBACK DATA ──────────────────────────────────────────────────────────────
const FALLBACK_PACKAGES = [
  { id:1, region:'Italy', flag:'🇮🇹', title:'Tuscan Slow Roads', duration:'9 days', price:1750, tag:'Launch Route', type:'luxury', image:'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?auto=format&fit=crop&w=900&q=80', desc:"Wander the Val d'Orcia on foot, dine with winemaking families.", highlights:['Agriturismo estate stay','Truffle hunting with local guide','Private vineyard dinner','Medieval hilltop villages'] },
  { id:2, region:'Spain', flag:'🇪🇸', title:'Tomatina & Valencia Villages', duration:'6 days', price:1290, tag:'Festival', type:'festival', image:'https://images.unsplash.com/photo-1543418219-44e30b057fea?auto=format&fit=crop&w=900&q=80', desc:'From the legendary tomato battle to hidden Valencian wine villages.', highlights:['La Tomatina festival','Private wine estate tour','Paella masterclass','Moorish village walking tour'] },
  { id:3, region:'Greece', flag:'🇬🇷', title:'Peloponnese Village Trail', duration:'8 days', price:1490, tag:'Coming Soon', type:'cultural', image:'https://images.unsplash.com/photo-1661589652461-e020338424f3?auto=format&fit=crop&w=900&q=80', desc:'Traverse sun-baked olive groves, sleep in stone farmhouses.', highlights:['Olive oil harvest workshop','Byzantine monastery','Traditional cooking class','Homestay with local family'] },
  { id:4, region:'Portugal', flag:'🇵🇹', title:'Atlantic Village Coast', duration:'7 days', price:1190, tag:'Hidden Gem', type:'nature', image:'https://images.unsplash.com/photo-1608649944716-228404a0a8bb?auto=format&fit=crop&w=900&q=80', desc:'Discover the Minho region — granite mountains, emerald vineyards.', highlights:['Vinho Verde vineyard tour','Coastal fishing village','Handicraft workshop','Camino de Santiago leg'] },
  { id:5, region:'Slovenia', flag:'🇸🇮', title:'Alpine Village Discovery', duration:'7 days', price:1350, tag:'Adventure', type:'adventure', image:'https://images.unsplash.com/photo-1478088913771-e3a36f50bb63?auto=format&fit=crop&w=900&q=80', desc:'Crystal lakes, beekeeping traditions, and Alpine farmsteads.', highlights:['Lake Bled sunrise hike','Traditional beekeeping farm','Alpine dairy experience','Triglav park trail'] },
  { id:6, region:'France', flag:'🇫🇷', title:'Alsace Wine Route', duration:'5 days', price:1150, tag:'Wine & Culture', type:'cultural', image:'https://images.unsplash.com/photo-1675026294659-0ee76bb66975?auto=format&fit=crop&w=900&q=80', desc:'Cycle through half-timbered villages along the Rhine.', highlights:['Village cycling trail','Private cellar tasting','Artisan cheese maker','Traditional winstub dinner'] },
]

const FALLBACK_STAYS = [
  { id:1, name:'Olive Grove Farmhouse', type:'Agriturismo', location:"Val d'Orcia, Tuscany", region:'Italy', price:185, rating:4.97, image:'https://images.unsplash.com/photo-1608476037397-7b53ace4c871?auto=format&fit=crop&w=900&q=80', perks:['Breakfast included','Private pool','Farm tour'] },
  { id:2, name:'Mani Peninsula Stonehouse', type:'Stone Cottage', location:'Peloponnese, Greece', region:'Greece', price:145, rating:5.0, image:'https://images.unsplash.com/photo-1693098245329-6de19df94fbb?auto=format&fit=crop&w=900&q=80', perks:['Sea views','Home-cooked meals','Guided walks'] },
  { id:3, name:'Triglav Mountain Refuge', type:'Alpine Guesthouse', location:'Triglav Park, Slovenia', region:'Slovenia', price:120, rating:4.93, image:'https://images.unsplash.com/photo-1610810101650-a45d0b81d266?auto=format&fit=crop&w=900&q=80', perks:['Alpine breakfast','Guided hikes','Honey farm'] },
]

const DESTINATIONS = [
  { flag:'🇮🇹', name:'Italy', sub:'Tuscany · Umbria · Puglia', region:'Italy' },
  { flag:'🇬🇷', name:'Greece', sub:'Peloponnese · Crete', region:'Greece' },
  { flag:'🇪🇸', name:'Spain', sub:'Andalusia · Valencia', region:'Spain' },
  { flag:'🇵🇹', name:'Portugal', sub:'Minho · Alentejo', region:'Portugal' },
  { flag:'🇫🇷', name:'France', sub:'Alsace · Dordogne', region:'France' },
  { flag:'🇸🇮', name:'Slovenia', sub:'Alpine Villages', region:'Slovenia' },
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const CARD_COLORS = { cultural:'#1a4d2e', festival:'#4a2210', luxury:'#2a1a0a', nature:'#0d2838', adventure:'#0d1a38' }

// ── SHARED UI ──────────────────────────────────────────────────────────────────
function Btn({ children, variant='primary', onClick, style={}, disabled }) {
  const base = { fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:disabled?'default':'pointer', border:'none', transition:'all .2s', display:'inline-flex', alignItems:'center', gap:8, opacity:disabled?.5:1, letterSpacing:'.02em' }
  const variants = {
    primary:{ background:C.green, color:C.white, padding:'12px 28px', borderRadius:100 },
    outline:{ background:'transparent', color:C.green, border:`1.5px solid ${C.greenPale}`, padding:'11px 27px', borderRadius:100 },
    gold:{ background:C.gold, color:C.white, padding:'12px 28px', borderRadius:100 },
  }
  return (
    <button disabled={disabled} onClick={onClick} style={{...base,...variants[variant],...style}}
      onMouseEnter={e => { if (!disabled && variant==='primary') e.currentTarget.style.background='#0d2e1c' }}
      onMouseLeave={e => { if (variant==='primary') e.currentTarget.style.background=C.green }}
    >{children}</button>
  )
}

function Spinner() {
  return <div style={{ width:20, height:20, border:`2px solid ${C.greenPale}`, borderTopColor:C.green, borderRadius:'50%', animation:'spin .7s linear infinite' }} />
}

// ── SEARCH BOX ────────────────────────────────────────────────────────────────
function SearchBox({ onSearch }) {
  const [dest, setDest] = useState(null)
  const [showDest, setShowDest] = useState(false)
  const [showCal, setShowCal] = useState(false)
  const [showTrav, setShowTrav] = useState(false)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [dateRange, setDateRange] = useState({ start:null, end:null })
  const [travellers, setTravellers] = useState({ adults:2, children:0 })

  const today = new Date(); today.setHours(0,0,0,0)
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()
  const fmtDate = d => d ? `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : ''
  const dateLabel = dateRange.start ? (dateRange.end ? `${fmtDate(dateRange.start)} – ${fmtDate(dateRange.end)}` : fmtDate(dateRange.start)) : 'Any time'
  const travLabel = `${travellers.adults} adult${travellers.adults!==1?'s':''}${travellers.children?`, ${travellers.children} child${travellers.children!==1?'ren':''}`:''}`

  const pickDate = (day) => {
    const clicked = new Date(calYear, calMonth, day)
    if (clicked < today) return
    if (!dateRange.start || (dateRange.start && dateRange.end)) setDateRange({ start:clicked, end:null })
    else { if (clicked < dateRange.start) setDateRange({ start:clicked, end:null }); else setDateRange(p => ({...p, end:clicked})) }
  }
  const isInRange = (day) => { const d = new Date(calYear,calMonth,day); return dateRange.start && dateRange.end && d > dateRange.start && d < dateRange.end }
  const isStart = (day) => dateRange.start && new Date(calYear,calMonth,day).toDateString()===dateRange.start.toDateString()
  const isEnd = (day) => dateRange.end && new Date(calYear,calMonth,day).toDateString()===dateRange.end.toDateString()
  const isPast = (day) => new Date(calYear,calMonth,day) < today
  const closeAll = () => { setShowDest(false); setShowCal(false); setShowTrav(false) }
  const dd = (key, delta) => setTravellers(p => ({...p, [key]:Math.max(key==='adults'?1:0, p[key]+delta)}))

  return (
    <div style={{ position:'relative', zIndex:200 }}>
      {(showDest||showCal||showTrav) && <div onClick={closeAll} style={{ position:'fixed', inset:0, zIndex:190 }} />}
      <div className='au4 gt-search-box' style={{ background:C.white, borderRadius:28, boxShadow:'0 20px 60px rgba(0,0,0,.35)', padding:'6px 6px 6px 0', display:'flex', alignItems:'center', maxWidth:720, margin:'0 auto', position:'relative', zIndex:200 }}>

        <div className='gt-search-field' onClick={() => { setShowDest(!showDest); setShowCal(false); setShowTrav(false) }}
          style={{ flex:1.2, display:'flex', flexDirection:'column', padding:'10px 20px', borderRight:`1px solid ${C.sand}`, cursor:'pointer', borderRadius:'22px 0 0 22px', background:showDest?'#f5f5f3':'transparent', transition:'background .2s' }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:C.text, marginBottom:3 }}>Where</span>
          <span style={{ fontSize:14, color:dest?C.text:C.muted, fontWeight:dest?500:400 }}>{dest?`${dest.flag} ${dest.name}`:'All destinations'}</span>
        </div>

        <div className='gt-search-field' onClick={() => { setShowCal(!showCal); setShowDest(false); setShowTrav(false) }}
          style={{ flex:1.3, display:'flex', flexDirection:'column', padding:'10px 20px', borderRight:`1px solid ${C.sand}`, cursor:'pointer', background:showCal?'#f5f5f3':'transparent', transition:'background .2s' }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:C.text, marginBottom:3 }}>When</span>
          <span style={{ fontSize:13, color:dateRange.start?C.text:C.muted, fontWeight:dateRange.start?500:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{dateLabel}</span>
        </div>

        <div className='gt-search-field' onClick={() => { setShowTrav(!showTrav); setShowDest(false); setShowCal(false) }}
          style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 16px', cursor:'pointer', background:showTrav?'#f5f5f3':'transparent', transition:'background .2s' }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:C.text, marginBottom:3 }}>Travellers</span>
          <span style={{ fontSize:14, color:C.text, fontWeight:500 }}>{travLabel}</span>
        </div>

        <button className='gt-search-btn' onClick={() => { closeAll(); onSearch({ dest, dateRange, travellers }) }}
          style={{ padding:'14px 22px', background:C.green, color:C.white, borderRadius:22, border:'none', cursor:'pointer', fontSize:14, fontWeight:600, whiteSpace:'nowrap', marginRight:4, fontFamily:"'DM Sans',sans-serif", transition:'background .2s', flexShrink:0 }}
          onMouseEnter={e => e.currentTarget.style.background='#0d2e1c'}
          onMouseLeave={e => e.currentTarget.style.background=C.green}>🔍 Search</button>
      </div>

      {showDest && (
        <div style={{ position:'absolute', top:'calc(100% + 10px)', left:'50%', transform:'translateX(-50%)', width:'min(700px,90vw)', background:C.white, borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,.18)', padding:16, zIndex:201, border:`1px solid ${C.sand}` }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:C.muted, padding:'4px 8px 12px' }}>Popular Destinations</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {DESTINATIONS.map(d => (
              <div key={d.name} onClick={() => { setDest(d); setShowDest(false) }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, cursor:'pointer', background:dest?.name===d.name?C.greenPale:'transparent', transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background=C.ivory}
                onMouseLeave={e => e.currentTarget.style.background=dest?.name===d.name?C.greenPale:'transparent'}>
                <span style={{ fontSize:24 }}>{d.flag}</span>
                <div><div style={{ fontSize:14, fontWeight:600, color:C.text }}>{d.name}</div><div style={{ fontSize:11, color:C.muted }}>{d.sub}</div></div>
              </div>
            ))}
          </div>
          {dest && <div style={{ borderTop:`1px solid ${C.sand}`, marginTop:12, paddingTop:12, paddingLeft:8 }}>
            <button onClick={() => { setDest(null); setShowDest(false) }} style={{ fontSize:12, color:C.muted, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Clear destination</button>
          </div>}
        </div>
      )}

      {showCal && (
        <div style={{ position:'absolute', top:'calc(100% + 10px)', left:'50%', transform:'translateX(-50%)', width:'min(380px,90vw)', background:C.white, borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,.18)', padding:22, zIndex:201, border:`1px solid ${C.sand}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <button onClick={() => { if (calMonth===0) { setCalMonth(11); setCalYear(y=>y-1) } else setCalMonth(m=>m-1) }}
              style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${C.sand}`, background:'none', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500 }}>{MONTHS[calMonth]} {calYear}</span>
            <button onClick={() => { if (calMonth===11) { setCalMonth(0); setCalYear(y=>y+1) } else setCalMonth(m=>m+1) }}
              style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${C.sand}`, background:'none', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:C.muted, padding:'4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {Array(firstDay===0?6:firstDay-1).fill(null).map((_,i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_,i) => {
              const day=i+1, past=isPast(day), start=isStart(day), end=isEnd(day), inRange=isInRange(day)
              return (
                <div key={day} onClick={() => !past && pickDate(day)} style={{
                  textAlign:'center', padding:'8px 2px', borderRadius:start||end?8:inRange?0:8,
                  background:start||end?C.green:inRange?C.greenPale:'transparent',
                  color:start||end?C.white:past?C.subtle:C.text,
                  fontSize:13, cursor:past?'default':'pointer', fontWeight:start||end?600:400, transition:'background .1s',
                }}
                onMouseEnter={e => { if (!past&&!start&&!end) e.currentTarget.style.background=C.ivory }}
                onMouseLeave={e => { if (!start&&!end&&!inRange) e.currentTarget.style.background='transparent'; else if(inRange) e.currentTarget.style.background=C.greenPale }}
                >{day}</div>
              )
            })}
          </div>
          <div style={{ borderTop:`1px solid ${C.sand}`, marginTop:14, paddingTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:12, color:C.muted }}>{!dateRange.start?'Select check-in':!dateRange.end?'Select check-out':`${dateRange.start.getDate()} → ${dateRange.end?.getDate()||'?'} ${MONTHS[calMonth].slice(0,3)}`}</span>
            <div style={{ display:'flex', gap:8 }}>
              {dateRange.start && <button onClick={() => setDateRange({start:null,end:null})} style={{ fontSize:12, color:C.muted, background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Clear</button>}
              {dateRange.start && <button onClick={() => setShowCal(false)} style={{ padding:'6px 16px', background:C.green, color:C.white, border:'none', borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Done</button>}
            </div>
          </div>
        </div>
      )}

      {showTrav && (
        <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, width:300, background:C.white, borderRadius:20, boxShadow:'0 20px 60px rgba(0,0,0,.18)', padding:24, zIndex:201, border:`1px solid ${C.sand}` }}>
          {[['adults','Adults','Age 13+'],['children','Children','Age 2–12']].map(([key,label,sub]) => (
            <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:key==='adults'?22:0 }}>
              <div><div style={{ fontSize:15, fontWeight:500, color:C.text }}>{label}</div><div style={{ fontSize:12, color:C.muted }}>{sub}</div></div>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <button onClick={() => dd(key,-1)} style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${C.sand}`, background:'none', cursor:travellers[key]<=(key==='adults'?1:0)?'default':'pointer', fontSize:18, color:travellers[key]<=(key==='adults'?1:0)?C.subtle:C.text, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', lineHeight:1 }}>−</button>
                <span style={{ fontSize:16, fontWeight:600, minWidth:20, textAlign:'center' }}>{travellers[key]}</span>
                <button onClick={() => dd(key,1)} style={{ width:32, height:32, borderRadius:'50%', border:`1.5px solid ${C.green}`, background:'none', cursor:'pointer', fontSize:18, color:C.green, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s', lineHeight:1 }}>+</button>
              </div>
            </div>
          ))}
          <button onClick={() => setShowTrav(false)} style={{ marginTop:20, width:'100%', padding:11, background:C.green, color:C.white, border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Done</button>
        </div>
      )}
    </div>
  )
}

// ── PACKAGE CARD ──────────────────────────────────────────────────────────────
function PackageCard({ pkg, onEnquire }) {
  const [saved, setSaved] = useState(false)
  const color = CARD_COLORS[pkg.type]||C.green
  return (
    <div style={{ background:C.white, borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)', transition:'transform .3s,box-shadow .3s', cursor:'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(0,0,0,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.07)' }}>
      <div style={{ height:200, background:pkg.image?`url(${pkg.image}) center/cover`:`linear-gradient(135deg,${color},#070f09)`, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', fontSize:64 }}>
        {!pkg.image && pkg.flag}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.3) 0%,transparent 50%)' }} />
        <span style={{ position:'absolute', top:12, left:12, background:C.gold, color:C.white, padding:'3px 12px', borderRadius:100, fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>{pkg.tag}</span>
        <button onClick={e => { e.stopPropagation(); setSaved(!saved) }} style={{ position:'absolute', top:12, right:12, width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', fontSize:14 }}>{saved?'❤️':'🤍'}</button>
        <span style={{ position:'absolute', bottom:12, right:14, fontSize:11, color:'rgba(255,255,255,.7)', fontWeight:500 }}>{pkg.region} · {pkg.duration}</span>
      </div>
      <div style={{ padding:'18px 20px 20px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.greenMid, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>📍 {pkg.region}</div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:500, color:C.text, marginBottom:8, lineHeight:1.25 }}>{pkg.title}</h3>
        <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginBottom:16 }}>{pkg.desc}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:16 }}>
          {(pkg.highlights||[]).slice(0,3).map((h,i) => (
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
              <span style={{ color:C.gold, fontSize:11, marginTop:2 }}>◆</span>
              <span style={{ fontSize:12, color:C.muted }}>{h}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:14, borderTop:`1px solid ${C.sand}` }}>
          <div><span style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500 }}>€{pkg.price?.toLocaleString()}</span><span style={{ fontSize:12, color:C.muted, marginLeft:5 }}>/ person</span></div>
          <div style={{ display:'flex', gap:8 }}>
            <Btn onClick={() => onEnquire(pkg)} style={{ padding:'9px 18px', fontSize:12 }}>Book Now</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── STAY CARD ─────────────────────────────────────────────────────────────────
function StayCard({ stay }) {
  const [saved, setSaved] = useState(false)
  return (
    <div style={{ background:C.white, borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.07)', transition:'transform .3s,box-shadow .3s', cursor:'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(0,0,0,.13)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.07)' }}>
      <div style={{ height:240, background:stay.image?`url(${stay.image}) center/cover`:`linear-gradient(135deg,${C.green},#0d1a0f)`, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.25) 0%,transparent 50%)' }} />
        <span style={{ position:'absolute', top:14, left:14, background:C.gold, color:C.white, padding:'3px 12px', borderRadius:100, fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>{stay.type}</span>
        <button onClick={e => { e.stopPropagation(); setSaved(!saved) }} style={{ position:'absolute', top:14, right:14, width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.9)', border:'none', cursor:'pointer', fontSize:14 }}>{saved?'❤️':'🤍'}</button>
      </div>
      <div style={{ padding:'20px 22px 22px' }}>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:500, marginBottom:6, lineHeight:1.2 }}>{stay.name}</h3>
        <div style={{ fontSize:13, color:C.muted, marginBottom:14 }}>📍 {stay.location}</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
          {(stay.perks||[]).map(p => <span key={p} style={{ padding:'4px 12px', background:C.greenPale, borderRadius:100, fontSize:11, fontWeight:500, color:C.green }}>{p}</span>)}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:16, borderTop:`1px solid ${C.sand}` }}>
          <div><span style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500 }}>€{stay.price}</span><span style={{ fontSize:12, color:C.muted, marginLeft:5 }}>/ night</span></div>
          <div style={{ fontSize:13, fontWeight:600, color:C.green }}>★ {stay.rating}</div>
        </div>
      </div>
    </div>
  )
}

// ── BOOKING MODAL ─────────────────────────────────────────────────────────────
function BookingModal({ pkg, onClose }) {
  const [step, setStep] = useState(1) // 1=details, 2=payment, 3=confirmed
  const [form, setForm] = useState({ name:'', email:'', phone:'', travellers:2, date:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const validate1 = () => {
    const e={}
    if (!form.name.trim()) e.name='Required'
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email='Valid email required'
    if (!form.date) e.date='Please select dates'
    return e
  }

  const handleNext = () => {
    const e = validate1()
    if (Object.keys(e).length) { setErrors(e); return }
    setStep(2)
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      // In production: redirect to Stripe Checkout via your backend
      // await api.createCheckoutSession({ packageId: pkg.id, ...form })
      // window.location.href = data.url
      await new Promise(r => setTimeout(r, 1800)) // Simulate Stripe redirect
      setStep(3)
    } catch { setStep(3) }
    finally { setLoading(false) }
  }

  const inputStyle = { width:'100%', padding:'12px 14px', background:C.ivory, border:`1px solid ${C.sand}`, borderRadius:8, color:C.text, fontSize:14, fontFamily:"'DM Sans',sans-serif" }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)' }} />
      <div style={{ position:'relative', background:C.white, borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 40px 100px rgba(0,0,0,.3)' }}>
        {/* Header */}
        <div style={{ padding:'24px 28px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, marginBottom:4 }}>
              {step===1?'Booking Details':step===2?'Secure Payment':'Confirmed ✓'}
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500 }}>{pkg.title}</h2>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${C.sand}`, background:'none', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, flexShrink:0 }}>✕</button>
        </div>

        {/* Price strip */}
        <div style={{ margin:'16px 28px', padding:'12px 16px', background:C.ivory, borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, color:C.muted }}>Per person from</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500, color:C.green }}>€{pkg.price?.toLocaleString()}</span>
        </div>

        {/* Step indicators */}
        <div style={{ padding:'0 28px 20px', display:'flex', gap:8 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex:1, height:3, borderRadius:100, background:step>=s?C.green:C.sand, transition:'background .3s' }} />
          ))}
        </div>

        <div style={{ padding:'0 28px 28px' }}>
          {step===1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[['name','Full Name','John Smith'],['email','Email Address','you@example.com'],['phone','Phone / WhatsApp (optional)',''],].map(([key,label,ph]) => (
                <div key={key}>
                  <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:6 }}>{label}</label>
                  <input type={key==='email'?'email':'text'} placeholder={ph} value={form[key]} onChange={e => set(key,e.target.value)} style={{...inputStyle, borderColor:errors[key]?'#e74c3c':C.sand}} />
                  {errors[key] && <div style={{ fontSize:11, color:'#e74c3c', marginTop:4 }}>{errors[key]}</div>}
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:6 }}>Preferred Month / Dates</label>
                <input type='text' placeholder='e.g. October 2025 or 10–18 Oct' value={form.date} onChange={e => set('date',e.target.value)} style={{...inputStyle, borderColor:errors.date?'#e74c3c':C.sand}} />
                {errors.date && <div style={{ fontSize:11, color:'#e74c3c', marginTop:4 }}>{errors.date}</div>}
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:6 }}>Number of Travellers</label>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <button onClick={() => set('travellers',Math.max(1,form.travellers-1))} style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${C.sand}`, background:'none', cursor:'pointer', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ fontSize:18, fontWeight:600, minWidth:24, textAlign:'center' }}>{form.travellers}</span>
                  <button onClick={() => set('travellers',form.travellers+1)} style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${C.green}`, background:'none', cursor:'pointer', fontSize:20, color:C.green, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  <span style={{ fontSize:13, color:C.muted }}>× €{pkg.price?.toLocaleString()} = <strong style={{ color:C.text }}>€{(form.travellers*pkg.price).toLocaleString()}</strong></span>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:6 }}>Special Requests (optional)</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes',e.target.value)} placeholder='Dietary requirements, room preferences, accessibility needs...' style={{...inputStyle, resize:'vertical', lineHeight:1.6}} />
              </div>
              <Btn onClick={handleNext} style={{ width:'100%', justifyContent:'center', padding:'14px' }}>Continue to Payment →</Btn>
              <p style={{ fontSize:12, color:C.muted, textAlign:'center', lineHeight:1.6 }}>No charge yet. You'll review and confirm on the next step.</p>
            </div>
          )}

          {step===2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Order summary */}
              <div style={{ background:C.ivory, borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, marginBottom:12 }}>Order Summary</div>
                {[
                  ['Package', pkg.title],
                  ['Travellers', `${form.travellers} person${form.travellers>1?'s':''}`],
                  ['Dates', form.date],
                  ['Price per person', `€${pkg.price?.toLocaleString()}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:13, color:C.muted }}>{k}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:C.text }}>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop:`1px solid ${C.sand}`, paddingTop:12, marginTop:4, display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.text }}>Total</span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, color:C.green }}>€{(form.travellers*pkg.price).toLocaleString()}</span>
                </div>
              </div>
              {/* Stripe notice */}
              <div style={{ border:`1.5px solid ${C.sand}`, borderRadius:12, padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <span style={{ fontSize:22 }}>💳</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:C.text }}>Secure payment via Stripe</div>
                    <div style={{ fontSize:12, color:C.muted }}>All major cards · Apple Pay · Google Pay</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                  {['Visa','Mastercard','Amex','Apple Pay','Google Pay'].map(p => (
                    <span key={p} style={{ padding:'4px 10px', background:C.ivory, borderRadius:6, fontSize:11, fontWeight:600, color:C.muted, border:`1px solid ${C.sand}` }}>{p}</span>
                  ))}
                </div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>
                  🔒 256-bit SSL encryption · PCI DSS compliant · Free cancellation up to 48 hours before
                </div>
              </div>
              <button onClick={handlePayment} disabled={loading} style={{ padding:'15px', background:C.green, color:C.white, border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:loading?'default':'pointer', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:loading?.7:1, transition:'all .2s' }}>
                {loading ? <><Spinner /><span>Processing...</span></> : `Pay €${(form.travellers*pkg.price).toLocaleString()} →`}
              </button>
              <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', textAlign:'center', textDecoration:'underline', fontFamily:"'DM Sans',sans-serif" }}>← Back to details</button>
            </div>
          )}

          {step===3 && (
            <div style={{ textAlign:'center', padding:'20px 0 10px' }}>
              <div style={{ fontSize:60, marginBottom:16 }}>🌿</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, marginBottom:12, color:C.green }}>Booking confirmed!</h3>
              <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, marginBottom:24 }}>
                Thank you, {form.name.split(' ')[0]}! A confirmation has been sent to <strong>{form.email}</strong>. Your local host will contact you within 24 hours to finalise details.
              </p>
              <div style={{ background:C.greenPale, borderRadius:12, padding:'14px 18px', marginBottom:24, textAlign:'left' }}>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.green, marginBottom:8 }}>What happens next</div>
                {['Host confirmation within 24 hours','Detailed pre-trip information pack','24/7 GoEarth support throughout'].map(s => (
                  <div key={s} style={{ fontSize:13, color:C.greenMid, marginBottom:6, display:'flex', gap:8 }}><span>✓</span>{s}</div>
                ))}
              </div>
              <button onClick={onClose} style={{ padding:'12px 32px', background:C.green, color:C.white, border:'none', borderRadius:100, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── NAVBAR ─────────────────────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links = [['home','Home'],['packages','Packages'],['stays','Stays'],['b2b','For Agencies'],['ai','AI Planner'],['about','About'],['investors','Investors']]
  const go = (id) => { setPage(id); setMenuOpen(false) }
  return (
    <nav className='gt-px' style={{ position:'sticky', top:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 52px', height:70, background:scrolled||menuOpen?'rgba(250,248,244,.97)':'transparent', backdropFilter:scrolled||menuOpen?'blur(16px)':'none', borderBottom:scrolled||menuOpen?`1px solid ${C.sand}`:'1px solid transparent', transition:'all .35s' }}>
      <div onClick={() => go('home')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, background:C.green, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🌿</div>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.green, fontWeight:600 }}>GoEarth</div>
          <div style={{ fontSize:9, letterSpacing:'.2em', color:C.gold, textTransform:'uppercase' }}>TheGoEarth.com</div>
        </div>
      </div>
      <div className='gt-nav-links' style={{ display:'flex', gap:24, alignItems:'center' }}>
        {links.map(([id,label]) => (
          <button key={id} onClick={() => go(id)} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:page===id?C.green:C.muted, background:'none', border:'none', cursor:'pointer', transition:'color .2s', borderBottom:page===id?`2px solid ${C.green}`:'2px solid transparent', paddingBottom:2 }}>{label}</button>
        ))}
        <Btn onClick={() => go('b2b')} style={{ padding:'9px 18px', fontSize:12 }}>Partner With Us</Btn>
      </div>
      <button className='gt-burger' aria-label='Menu' onClick={() => setMenuOpen(o=>!o)}>{menuOpen?'✕':'☰'}</button>
      {menuOpen && (
        <div style={{ position:'absolute', top:70, left:0, right:0, background:C.white, borderBottom:`1px solid ${C.sand}`, boxShadow:'0 16px 32px rgba(0,0,0,.1)', display:'flex', flexDirection:'column', padding:'14px 20px 20px' }}>
          {links.map(([id,label]) => (
            <button key={id} onClick={() => go(id)} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:500, color:page===id?C.green:C.text, background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:'13px 4px', borderBottom:`1px solid ${C.sand}` }}>{label}</button>
          ))}
          <Btn onClick={() => go('b2b')} style={{ marginTop:14, justifyContent:'center' }}>Partner With Us</Btn>
        </div>
      )}
    </nav>
  )
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    api.getPackages().then(data => setPackages(Array.isArray(data)?data.slice(0,3):FALLBACK_PACKAGES.slice(0,3))).catch(() => setPackages(FALLBACK_PACKAGES.slice(0,3))).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {booking && <BookingModal pkg={booking} onClose={() => setBooking(null)} />}
      <section className='gt-px' style={{ minHeight:'92vh', display:'grid', placeItems:'center', padding:'80px 52px', position:'relative', overflow:'hidden', backgroundImage:`linear-gradient(180deg,rgba(10,20,12,.35) 0%,rgba(8,16,10,.55) 55%,rgba(6,12,8,.85) 100%),url('https://images.unsplash.com/photo-1706269796410-6a11ee591b6e?auto=format&fit=crop&w=2400&q=80')`, backgroundSize:'cover', backgroundPosition:'center 60%' }}>
        <div style={{ maxWidth:800, width:'100%', textAlign:'center', position:'relative', zIndex:1 }}>
          <div className='au1' style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, background:'rgba(255,255,255,.14)', backdropFilter:'blur(6px)', fontSize:12, fontWeight:600, color:C.white, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:28, border:'1px solid rgba(255,255,255,.2)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:C.greenLight, animation:'float 2s ease infinite', display:'inline-block' }} /> Authentic Local Europe
          </div>
          <h1 className='au2 gt-hero-title' style={{ fontFamily:"'Playfair Display',serif", fontSize:76, fontWeight:500, lineHeight:1.04, letterSpacing:'-.02em', marginBottom:20, color:C.white, textShadow:'0 4px 30px rgba(0,0,0,.35)' }}>
            Discover local <br /><em style={{ color:C.goldLight }}>Europe.</em>
          </h1>
          <p className='au3 gt-hero-sub' style={{ fontSize:18, fontWeight:300, color:'rgba(255,255,255,.88)', lineHeight:1.75, maxWidth:500, margin:'0 auto 44px', textShadow:'0 2px 16px rgba(0,0,0,.3)' }}>
            Find authentic experiences, handpicked stays, and cultural adventures across rural Europe — curated for curious travellers.
          </p>
          <SearchBox onSearch={({ dest }) => setPage(dest?`packages?region=${dest.region}`:'packages')} />
          <div className='au5 gt-trust' style={{ display:'flex', justifyContent:'center', gap:36, marginTop:32, flexWrap:'wrap' }}>
            {['✓ Verified local hosts','✓ 50+ unique experiences','✓ Best price guarantee','✓ 24/7 support'].map(t => (
              <span key={t} style={{ fontSize:13, color:'rgba(255,255,255,.85)', display:'flex', alignItems:'center', gap:6, textShadow:'0 1px 8px rgba(0,0,0,.4)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='gt-px' style={{ padding:'88px 52px', background:C.white }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto 56px' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:C.greenLight, marginBottom:14 }}>How GoEarth Works</div>
            <h2 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:500, lineHeight:1.2, marginBottom:16 }}>A curated booking marketplace — not a directory</h2>
            <p style={{ fontSize:15, color:C.muted, lineHeight:1.75 }}>GoEarth connects travellers and tour agencies directly to vetted rural hosts, guides, and stays. We curate, you book — no listings scraped from elsewhere, no middlemen between you and the village.</p>
          </div>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:28 }}>
            {[['01','🔍','Discover','Browse handpicked rural experiences, stays, and festivals — each one personally scouted, not crowdsourced.'],['02','🤝','Connect','Every host is vetted by our on-the-ground country ambassador before they appear on the platform.'],['03','✓','Book','Reserve directly as a traveller (B2C), or through your trusted tour agency (B2B) — transparent pricing either way.'],['04','🌿','Experience','Arrive supported by our AI Travel Planner and local contacts throughout your stay.']].map(([num,icon,title,desc]) => (
              <div key={title}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:C.sand, fontWeight:700, marginBottom:10 }}>{num}</div>
                <div style={{ fontSize:30, marginBottom:14 }}>{icon}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:21, fontWeight:500, marginBottom:10 }}>{title}</h3>
                <p style={{ fontSize:13.5, color:C.muted, lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GoEarth */}
      <section className='gt-px' style={{ padding:'88px 52px', background:C.green }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ textAlign:'center', maxWidth:620, margin:'0 auto 52px' }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:C.gold, marginBottom:14 }}>Why Not Just Use Another Experience App?</div>
            <h2 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:500, color:C.white, lineHeight:1.2 }}>Three things competitors don't do</h2>
          </div>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[['Rural-first, not rural-as-an-afterthought','Generic platforms bolt a "local experience" onto a big-city itinerary. We start with the village — the rural region is the destination, not a side activity near Paris or Rome.'],['Built for two source markets we know deeply','Direct B2B relationships already in motion across Dubai, Doha, Riyadh, Kochi, Bangalore, and New Delhi — not a generic global launch competing for attention everywhere.'],["We strengthen the supply side, not just list it",'Beyond bookings, we offer consultancy and multimedia services to the rural SMEs we work with — building better experiences, not just listing whatever already exists.']].map(([title,desc]) => (
              <div key={title} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)', borderRadius:14, padding:'32px 28px' }}>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:500, color:C.white, marginBottom:12, lineHeight:1.3 }}>{title}</h3>
                <p style={{ fontSize:13.5, color:'rgba(255,255,255,.65)', lineHeight:1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className='gt-px' style={{ padding:'80px 52px', background:C.ivory }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:48, flexWrap:'wrap', gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:C.greenLight, marginBottom:10 }}>Featured Journeys · Launching in Italy</div>
              <h2 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:500, lineHeight:1.1 }}>Where will you <em style={{ color:C.green }}>disappear?</em></h2>
            </div>
            <Btn variant='outline' onClick={() => setPage('packages')}>View all packages →</Btn>
          </div>
          {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div> : (
            <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:26 }}>
              {packages.map(p => <PackageCard key={p.id} pkg={p} onEnquire={() => setBooking(p)} />)}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className='gt-px' style={{ padding:'72px 52px', background:C.green }}>
        <div className='gt-grid' style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
          {[['€460B','European tourism market'],['20%','Choose rural experiences'],['4–5%','Annual rural growth rate'],['14M+','GCC & India visitors/yr']].map(([v,l]) => (
            <div key={l} className='gt-stat-item' style={{ textAlign:'center', padding:'0 20px', borderRight:`1px solid rgba(255,255,255,.15)` }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, color:C.gold, fontWeight:500 }}>{v}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.6)', marginTop:6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* B2B CTA */}
      <section className='gt-px' style={{ padding:'100px 52px', background:C.white, textAlign:'center' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:C.greenLight, marginBottom:16 }}>For Tour Agencies</div>
        <h2 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:52, fontWeight:500, marginBottom:18, lineHeight:1.1 }}>Ready to offer your clients <em style={{ color:C.green }}>something unforgettable?</em></h2>
        <p style={{ fontSize:16, color:C.muted, maxWidth:480, margin:'0 auto 44px', lineHeight:1.75 }}>We partner with agencies in Dubai, Doha, Riyadh, Kochi, Bangalore, and New Delhi.</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Btn onClick={() => setPage('b2b')}>Become a Partner</Btn>
          <Btn variant='outline' onClick={() => setPage('packages')}>View Package Catalogue</Btn>
        </div>
      </section>
    </div>
  )
}

// ── PACKAGES PAGE ─────────────────────────────────────────────────────────────
function PackagesPage({ setPage }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [booking, setBooking] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.getPackages(filter).then(data => setPackages(Array.isArray(data)?data:FALLBACK_PACKAGES)).catch(() => setPackages(FALLBACK_PACKAGES)).finally(() => setLoading(false))
  }, [filter])

  const filters = [['all','All Journeys'],['cultural','🏛 Cultural'],['festival','🎭 Festival'],['luxury','✨ Luxury'],['nature','🌲 Nature'],['adventure','⛰ Adventure']]

  return (
    <div style={{ minHeight:'100vh', background:C.ivory }}>
      {booking && <BookingModal pkg={booking} onClose={() => setBooking(null)} />}
      <div className='gt-px' style={{ padding:'72px 52px 52px', background:`linear-gradient(160deg,${C.green},#0d2e1c)` }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:'rgba(255,255,255,.5)', textTransform:'uppercase', marginBottom:14 }}>Our Journeys</div>
          <h1 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:68, fontWeight:500, color:C.white, marginBottom:44, lineHeight:1.05 }}>Rural Europe, <em style={{ color:C.gold }}>curated.</em></h1>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {filters.map(([id,label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{ padding:'9px 20px', borderRadius:100, fontSize:13, fontWeight:500, border:'1px solid', cursor:'pointer', transition:'all .2s', fontFamily:"'DM Sans',sans-serif", background:filter===id?C.gold:'transparent', color:filter===id?C.white:'rgba(255,255,255,.6)', borderColor:filter===id?C.gold:'rgba(255,255,255,.2)' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className='gt-px' style={{ padding:'52px 52px 80px', maxWidth:1180, margin:'0 auto' }}>
        {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><Spinner /></div> : (
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:26 }}>
            {packages.map(p => <PackageCard key={p.id} pkg={p} onEnquire={() => setBooking(p)} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── STAYS PAGE ────────────────────────────────────────────────────────────────
function StaysPage() {
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.getStays().then(data => setStays(Array.isArray(data)&&data.length?data:FALLBACK_STAYS)).catch(() => setStays(FALLBACK_STAYS)).finally(() => setLoading(false))
  }, [])
  return (
    <div style={{ minHeight:'100vh', background:C.ivory }}>
      <div className='gt-px' style={{ padding:'72px 52px 52px', background:`linear-gradient(160deg,${C.green},#0d2e1c)` }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:'rgba(255,255,255,.5)', textTransform:'uppercase', marginBottom:14 }}>Where To Sleep</div>
          <h1 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:64, fontWeight:500, color:C.white, lineHeight:1.08 }}>Handpicked <em style={{ color:C.gold }}>rural stays.</em></h1>
        </div>
      </div>
      <div className='gt-px' style={{ padding:'52px 52px 80px', maxWidth:1180, margin:'0 auto' }}>
        {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><Spinner /></div> : (
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:26 }}>
            {stays.map(s => <StayCard key={s.id} stay={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── B2B PAGE ──────────────────────────────────────────────────────────────────
function B2BPage() {
  const [form, setForm] = useState({ company:'', country:'', name:'', email:'', volume:'', message:'' })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const set = (k,v) => setForm(p => ({...p,[k]:v}))

  const validate = () => {
    const e={}
    if (!form.company.trim()) e.company='Required'
    if (!form.name.trim()) e.name='Required'
    if (!form.email.match(/^[^@]+@[^@]+\.[^@]+$/)) e.email='Valid email required'
    if (!form.country.trim()) e.country='Required'
    if (!form.volume) e.volume='Please select'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try { await api.submitEnquiry(form); setDone(true) }
    catch { setDone(true) }
    finally { setLoading(false) }
  }

  const MARKETS = [['🇦🇪','Dubai','UAE'],['🇶🇦','Doha','Qatar'],['🇸🇦','Riyadh','KSA'],['🇮🇳','Kochi','India'],['🇮🇳','Bangalore','India'],['🇮🇳','New Delhi','India']]
  const TIERS = [
    { name:'Explorer', color:C.greenMid, margin:'€500 / pkg', min:'10 pax / year', features:['Access to 6 packages','Co-branded materials','Email support','Seasonal updates'] },
    { name:'Pioneer', color:C.gold, margin:'€400 / pkg', min:'30 pax / year', featured:true, features:['Full catalogue access','Priority support','Joint marketing','Quarterly strategy review'] },
    { name:'Ambassador', color:'#c4613a', margin:'Custom terms', min:'60+ pax / year', features:['Exclusive routes','Dedicated manager','Co-branded campaigns','Annual partner summit'] },
  ]
  const inputStyle = { width:'100%', padding:'13px 16px', background:C.ivory, border:`1px solid ${C.sand}`, borderRadius:8, color:C.text, fontSize:14, fontFamily:"'DM Sans',sans-serif" }

  return (
    <div style={{ minHeight:'100vh', background:C.white }}>
      <div className='gt-px' style={{ padding:'72px 52px 72px', background:`linear-gradient(155deg,#e8f5ee,#d8f3dc)` }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenMid, textTransform:'uppercase', marginBottom:14 }}>B2B Partnership Portal</div>
          <h1 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:64, fontWeight:500, lineHeight:1.08, maxWidth:700 }}>Grow your portfolio with <em style={{ color:C.green }}>rural Europe.</em></h1>
        </div>
      </div>
      <div className='gt-px' style={{ padding:'72px 52px 100px', maxWidth:1180, margin:'0 auto' }}>
        <div style={{ marginBottom:72 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, marginBottom:8 }}>Active Markets</h2>
          <p style={{ fontSize:14, color:C.muted, marginBottom:28 }}>Onboarding agencies from 6 cities across GCC and India.</p>
          <div className='gt-grid-sm' style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:14 }}>
            {MARKETS.map(([flag,city,country]) => (
              <div key={city} style={{ background:C.ivory, border:`1px solid ${C.sand}`, borderRadius:12, padding:'20px 10px', textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{flag}</div>
                <div style={{ fontSize:13, fontWeight:600 }}>{city}</div>
                <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>{country}</div>
                <span style={{ fontSize:10, color:'#2d6a4f', background:'#d8f3dc', padding:'2px 10px', borderRadius:100 }}>● Active</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom:72 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, marginBottom:28 }}>Partnership Tiers</h2>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {TIERS.map(t => (
              <div key={t.name} style={{ background:C.ivory, border:`${t.featured?'2px':'1px'} solid ${t.featured?C.gold:C.sand}`, borderRadius:14, padding:'36px 28px', position:'relative' }}>
                {t.featured && <div style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', background:C.gold, color:C.white, padding:'4px 18px', fontSize:10, fontWeight:700, borderRadius:100, whiteSpace:'nowrap', letterSpacing:'.12em' }}>MOST POPULAR</div>}
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, color:t.color, fontStyle:'italic', marginBottom:6 }}>{t.name}</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:18 }}>Min. {t.min}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, marginBottom:24 }}>{t.margin}</div>
                {t.features.map(f => <div key={f} style={{ display:'flex', gap:10, marginBottom:10 }}><span style={{ color:t.color }}>✓</span><span style={{ fontSize:13, color:C.muted }}>{f}</span></div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:42, textAlign:'center', marginBottom:8 }}>Register Your Agency</h2>
          <p style={{ fontSize:14, color:C.muted, textAlign:'center', marginBottom:44, lineHeight:1.7 }}>We respond within 48 hours.</p>
          {done ? (
            <div style={{ background:'#d8f3dc', border:`1px solid ${C.greenMid}`, borderRadius:14, padding:'48px 36px', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:14 }}>🌿</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, marginBottom:10 }}>Thank you, {form.name.split(' ')[0]||'there'}!</h3>
              <p style={{ fontSize:14, color:C.muted, lineHeight:1.75 }}>Your enquiry has been received. Our team will be in touch within 48 hours.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {[['company','Agency / Company Name','e.g. Arabian Travel Group'],['name','Contact Name','Your full name'],['email','Email Address','agency@example.com'],['country','Country','e.g. UAE, India, Qatar']].map(([key,label,placeholder]) => (
                <div key={key}>
                  <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:7 }}>{label}</label>
                  <input value={form[key]} onChange={e => set(key,e.target.value)} placeholder={placeholder} style={{...inputStyle, borderColor:errors[key]?'#e74c3c':C.sand}} />
                  {errors[key] && <div style={{ fontSize:11, color:'#e74c3c', marginTop:4 }}>{errors[key]}</div>}
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:7 }}>Expected Annual Volume</label>
                <select value={form.volume} onChange={e => set('volume',e.target.value)} style={{...inputStyle, borderColor:errors.volume?'#e74c3c':C.sand}}>
                  <option value=''>Select passenger volume</option>
                  <option value='10-30'>10–30 passengers / year (Explorer)</option>
                  <option value='30-60'>30–60 passengers / year (Pioneer)</option>
                  <option value='60+'>60+ passengers / year (Ambassador)</option>
                </select>
                {errors.volume && <div style={{ fontSize:11, color:'#e74c3c', marginTop:4 }}>{errors.volume}</div>}
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:C.muted, display:'block', marginBottom:7 }}>Message (optional)</label>
                <textarea rows={4} value={form.message} onChange={e => set('message',e.target.value)} placeholder='Tell us about your clients...' style={{...inputStyle, resize:'vertical', lineHeight:1.65}} />
              </div>
              <Btn onClick={submit} disabled={loading} style={{ alignSelf:'flex-start', padding:'14px 36px' }}>
                {loading?<Spinner />:'Submit Partnership Enquiry →'}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── AI PAGE ───────────────────────────────────────────────────────────────────
function AIPage() {
  const [messages, setMessages] = useState([{ role:'assistant', content:"Hello! I'm your Green Tribe AI Travel Planner 🌿\n\nTell me where you're from, how many are travelling, your interests, and when you'd like to visit rural Europe — and I'll craft a personalised itinerary just for you." }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)
  useEffect(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), [messages])

  const suggestions = ['Plan a 7-day Italy trip for a family from Dubai','What is the Tomatina festival experience like?',"I'm from Bangalore — suggest a wine & food tour",'Create a luxury Tuscany honeymoon itinerary']

  const send = async () => {
    if (!input.trim()||loading) return
    const text = input.trim(); setInput('')
    const next = [...messages, { role:'user', content:text }]
    setMessages(next); setLoading(true)
    try {
      const data = await api.chat(next)
      setMessages(p => [...p, { role:'assistant', content:data.reply||data.content||'Please try again 🌿' }])
    } catch {
      setMessages(p => [...p, { role:'assistant', content:"I'm having trouble connecting. Please try again 🌿" }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'92vh', display:'flex', flexDirection:'column', background:C.ivory }}>
      <div className='gt-px' style={{ padding:'28px 52px 22px', borderBottom:`1px solid ${C.sand}`, background:C.white }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🌿</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:500 }}>AI Travel Planner</div>
            <div style={{ fontSize:12, color:C.muted }}>Powered by Claude · Personalised rural Europe itineraries</div>
          </div>
          <div style={{ marginLeft:'auto', padding:'4px 14px', background:'#d8f3dc', borderRadius:100, fontSize:10, color:C.greenMid, fontWeight:600 }}>● Online</div>
        </div>
      </div>
      <div className='gt-px' style={{ flex:1, overflowY:'auto', padding:'28px 52px' }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex', flexDirection:'column', gap:20 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:'flex', flexDirection:m.role==='user'?'row-reverse':'row', gap:12, alignItems:'flex-start' }}>
              {m.role==='assistant' && <div style={{ width:34, height:34, borderRadius:'50%', background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🌿</div>}
              <div style={{ maxWidth:'76%', padding:'13px 18px', borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px', background:m.role==='user'?C.green:C.white, color:m.role==='user'?C.white:C.text, fontSize:14, lineHeight:1.72, whiteSpace:'pre-wrap', border:m.role==='assistant'?`1px solid ${C.sand}`:'none', boxShadow:m.role==='assistant'?'0 2px 8px rgba(0,0,0,.06)':'none' }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:C.green, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🌿</div>
              <div style={{ padding:'14px 18px', borderRadius:'14px 14px 14px 4px', background:C.white, border:`1px solid ${C.sand}` }}>
                <div className='typing' style={{ display:'flex', gap:5 }}><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      {messages.length<=1 && (
        <div className='gt-px' style={{ padding:'0 52px 12px' }}>
          <div style={{ maxWidth:820, margin:'0 auto', display:'flex', gap:8, flexWrap:'wrap' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => setInput(s)} style={{ padding:'7px 16px', background:C.white, border:`1px solid ${C.sand}`, borderRadius:100, fontSize:12, color:C.muted, cursor:'pointer', transition:'all .2s', fontFamily:"'DM Sans',sans-serif" }}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <div className='gt-px' style={{ padding:'14px 52px 24px', borderTop:`1px solid ${C.sand}`, background:C.white }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex', gap:10 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); send() } }} placeholder='Tell me about your dream rural Europe journey...' rows={2} style={{ flex:1, padding:'13px 16px', background:C.ivory, border:`1px solid ${C.sand}`, borderRadius:10, color:C.text, fontSize:14, lineHeight:1.6, resize:'none', fontFamily:"'DM Sans',sans-serif" }} />
          <button onClick={send} disabled={!input.trim()||loading} style={{ width:48, alignSelf:'flex-end', height:48, background:input.trim()&&!loading?C.green:C.sand, border:'none', borderRadius:10, cursor:input.trim()&&!loading?'pointer':'default', fontSize:18, color:input.trim()&&!loading?C.white:C.muted, transition:'all .2s' }}>→</button>
        </div>
        <p style={{ fontSize:11, color:C.subtle, textAlign:'center', marginTop:8 }}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

// ── INVESTORS PAGE ────────────────────────────────────────────────────────────
function InvestorsPage({ setPage }) {
  return (
    <div style={{ minHeight:'100vh', background:C.white }}>
      <div className='gt-px' style={{ padding:'80px 52px', background:`linear-gradient(155deg,#0d2818,#1a4d2e)`, textAlign:'center' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.gold, textTransform:'uppercase', marginBottom:16 }}>Investor Overview</div>
        <h1 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:60, fontWeight:500, color:C.white, maxWidth:700, margin:'0 auto 20px', lineHeight:1.08 }}>The rural Europe tourism <em style={{ color:C.gold }}>opportunity</em></h1>
        <p style={{ fontSize:16, color:'rgba(255,255,255,.7)', maxWidth:560, margin:'0 auto', lineHeight:1.8 }}>GoEarth is building the first curated booking marketplace for rural Europe, targeting 14M+ annual GCC and India visitors who want more than Paris.</p>
      </div>

      <div className='gt-px' style={{ padding:'80px 52px', maxWidth:1100, margin:'0 auto' }}>

        {/* Market Opportunity */}
        <div style={{ marginBottom:80 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenLight, textTransform:'uppercase', marginBottom:14 }}>Market Opportunity</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, marginBottom:32, lineHeight:1.2 }}>A large market with an underserved segment</h2>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3 }}>
            {[['€460B','Total EU tourism market annual revenue','🌍'],['20%','Tourists already choosing rural over urban',`🌾`],['4–5%','Annual rural tourism growth — outpacing urban','📈'],['14M+','GCC & India visitors to Europe per year','✈️']].map(([val,label,icon]) => (
              <div key={label} style={{ background:C.ivory, padding:'32px 24px', textAlign:'center', border:`1px solid ${C.sand}` }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:34, color:C.green, fontWeight:500, marginBottom:8 }}>{val}</div>
                <div style={{ fontSize:13, color:C.muted, lineHeight:1.55 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, padding:'18px 22px', background:C.greenPale, borderRadius:12, fontSize:14, color:C.green, lineHeight:1.7 }}>
            <strong>The specific wedge:</strong> GCC travellers spend an average of €3,000 per European trip; Indian travellers €2,500. Both segments are growing rapidly, both are underserved by platforms focused on Paris, Rome, and Barcelona. GoEarth addresses this gap directly.
          </div>
        </div>

        {/* Revenue Model */}
        <div style={{ marginBottom:80 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenLight, textTransform:'uppercase', marginBottom:14 }}>Revenue Model</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, marginBottom:12, lineHeight:1.2 }}>Three revenue streams from day one</h2>
          <p style={{ fontSize:14, color:C.muted, marginBottom:36, maxWidth:600, lineHeight:1.7 }}>GoEarth generates revenue on both the B2B side (tour agency margins) and B2C side (direct bookings), with a third stream from SME services. All figures are conservative, pulled from the validated business plan.</p>

          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:32 }}>
            {[
              { stream:'B2B Package Margins', color:C.green, amount:'€500', unit:'per package', yr1:'€30,000', desc:'6 partner agencies × 10 packages each. Agencies in Dubai, Doha, Riyadh, Kochi, Bangalore, New Delhi.', math:'6 agencies × 10 pkgs × €500 = €30,000' },
              { stream:'B2C Direct Bookings', color:C.gold, amount:'€300', unit:'avg. profit/pkg', yr1:'€36,000', desc:'10 packages/month sold directly to travellers, at €300 net profit per package.', math:'10 pkgs/mo × €300 × 12 = €36,000' },
              { stream:'SME Consultancy', color:'#c4613a', amount:'€499', unit:'per SME client', yr1:'€14,970', desc:'Flat-fee consultancy for rural businesses. 30 SMEs across 3 launch countries.', math:'30 SMEs × €499 = €14,970' },
            ].map(r => (
              <div key={r.stream} style={{ background:C.ivory, border:`1px solid ${C.sand}`, borderRadius:14, padding:'28px 24px' }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:r.color, marginBottom:10 }}>{r.stream}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:500, marginBottom:4 }}>{r.amount}</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>{r.unit}</div>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginBottom:14 }}>{r.desc}</p>
                <div style={{ padding:'8px 12px', background:C.white, borderRadius:8, fontSize:12, fontFamily:'monospace', color:C.green, border:`1px solid ${C.sand}` }}>{r.math}</div>
                <div style={{ marginTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:C.muted }}>Year 1 projection</span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:500, color:C.green }}>{r.yr1}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial summary table */}
          <div style={{ border:`1px solid ${C.sand}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', background:C.green }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:C.white, fontWeight:500 }}>Year 1 Financial Summary</div>
            </div>
            {[
              ['Total Revenue','€100,470', C.green],
              ['Total Fixed Costs (website, registration, rent, branding)','€9,100', C.muted],
              ['Total Variable Costs (marketing, travel, R&D)','€14,500', C.muted],
              ['Total Costs (break-even)','€23,600', '#c4613a'],
              ['Net Profit (Year 1)','€76,870', C.green],
              ['Margin of Safety','76.5%', C.green],
            ].map(([label,val,color],i) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 24px', background:i%2===0?C.white:C.ivory, borderTop:`1px solid ${C.sand}` }}>
                <span style={{ fontSize:14, color:C.text }}>{label}</span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:500, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Year 2 scale */}
        <div style={{ marginBottom:80, padding:'36px', background:`linear-gradient(135deg,${C.green},#0d2e1c)`, borderRadius:20 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.gold, textTransform:'uppercase', marginBottom:14 }}>Year 2 Scale Plan</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, color:C.white, marginBottom:20, lineHeight:1.2 }}>Target: €119,000 revenue · 3 countries · 5-person team</h2>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[['€119,000','Total projected revenue'],['5 people','Full team headcount'],['3 countries','Italy, Spain, Greece active']].map(([v,l]) => (
              <div key={l} style={{ background:'rgba(255,255,255,.08)', borderRadius:12, padding:'22px 20px', textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, color:C.gold, fontWeight:500, marginBottom:6 }}>{v}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,.65)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* What we're asking for */}
        <div style={{ marginBottom:80 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenLight, textTransform:'uppercase', marginBottom:14 }}>Current Ask</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:38, marginBottom:20, lineHeight:1.2 }}>What we need to launch</h2>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
            {[['Operational launch capital','€23,600 to break even in Year 1 — covers prototype website, company registration, branding, R&D, ad spend, and office registration.'],['Team build','Country Ambassador for Italy (our launch market), plus a Communications/Research role and a Multimedia Creator to begin content production.'],['Network access','Introductions to tour agencies in GCC and India who would evaluate our pilot packages for their 2025–26 itinerary planning cycles.'],['Investor value-add','Beyond capital: anyone with hospitality, travel-tech, or GCC/India market expertise would significantly accelerate our go-to-market.']].map(([title,desc]) => (
              <div key={title} style={{ display:'flex', gap:16, padding:'22px 24px', background:C.ivory, borderRadius:12, border:`1px solid ${C.sand}` }}>
                <div style={{ fontSize:22, flexShrink:0 }}>🎯</div>
                <div>
                  <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500, marginBottom:8 }}>{title}</h4>
                  <p style={{ fontSize:13.5, color:C.muted, lineHeight:1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:'center', padding:'52px 40px', background:C.ivory, borderRadius:20, border:`1px solid ${C.sand}` }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🌿</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, marginBottom:14 }}>Interested in learning more?</h2>
          <p style={{ fontSize:15, color:C.muted, maxWidth:440, margin:'0 auto 32px', lineHeight:1.75 }}>We'd love to walk you through the full deck and introduce you to our first partner agencies.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Btn onClick={() => setPage('b2b')}>Get in Touch</Btn>
            <Btn variant='outline' onClick={() => setPage('ai')}>Try the AI Planner</Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
function AboutPage() {
  return (
    <div style={{ minHeight:'100vh', background:C.white }}>
      <div className='gt-px' style={{ padding:'80px 52px 80px', background:`linear-gradient(160deg,#e8f5ee,#d8f3dc)`, textAlign:'center' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenMid, textTransform:'uppercase', marginBottom:16 }}>Our Story</div>
        <h1 className='gt-page-h1' style={{ fontFamily:"'Playfair Display',serif", fontSize:64, fontWeight:500, maxWidth:700, margin:'0 auto 20px', lineHeight:1.08 }}>Closing the gap between travellers and <em style={{ color:C.green }}>truth.</em></h1>
        <p style={{ fontSize:16, color:C.muted, maxWidth:560, margin:'0 auto', lineHeight:1.8 }}>Green Tribe was born from a simple observation: travellers from the GCC and India were seeing Paris and Disneyland, but missing the truest face of Europe — its villages, its people, its land.</p>
      </div>
      <div className='gt-px' style={{ padding:'80px 52px', maxWidth:1100, margin:'0 auto' }}>
        <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center', marginBottom:80 }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenLight, textTransform:'uppercase', marginBottom:14 }}>Our Mission</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, marginBottom:20, lineHeight:1.2 }}>Economic growth through authentic experience</h2>
            <p style={{ fontSize:15, color:C.muted, lineHeight:1.8 }}>We connect affluent Middle Eastern and Asian travellers with rural European communities — creating sustainable economic value for SMEs, local guides, and host families. Operating from Brussels, launching in Italy.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3 }}>
            {[['🇮🇹','Italy','Launch Country'],['🌍','3 Countries','Year 1 Target'],['💶','€100K+','Year 1 Revenue'],['🤝','6 Agencies','Initial B2B']].map(([icon,val,label]) => (
              <div key={label} style={{ background:C.ivory, padding:'32px 20px', textAlign:'center' }}>
                <div style={{ fontSize:30, marginBottom:8 }}>{icon}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:C.gold, fontWeight:500 }}>{val}</div>
                <div style={{ fontSize:11, color:C.muted, letterSpacing:'.1em', textTransform:'uppercase', marginTop:5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:80 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenLight, textTransform:'uppercase', marginBottom:14 }}>Where We Are Today</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, marginBottom:32, lineHeight:1.2 }}>Early stage, validated direction</h2>
          <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
            {[['✅','Market validated','€460B EU tourism market, 20% choosing rural, growing 4–5% annually — with 14M+ GCC and India visitors per year.'],['✅','Agency conversations underway','Initial discussions held with tour agencies across our six target cities, all open to carrying our packages.'],['🔧','Platform live in development','The booking marketplace, AI Travel Planner, and B2B portal you can explore right now are the actual working product.'],['🎯','Roadmap: Italy → 3 countries','Launching with curated Tuscany routes, then expanding to Spain and Greece within Year 1.']].map(([icon,title,desc]) => (
              <div key={title} style={{ display:'flex', gap:16, padding:'22px 24px', background:C.ivory, borderRadius:12, border:`1px solid ${C.sand}` }}>
                <div style={{ fontSize:22, flexShrink:0 }}>{icon}</div>
                <div>
                  <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500, marginBottom:6 }}>{title}</h4>
                  <p style={{ fontSize:13.5, color:C.muted, lineHeight:1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:80 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:C.greenLight, textTransform:'uppercase', marginBottom:14 }}>A Day With GoEarth</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, marginBottom:8, lineHeight:1.2 }}>Meet Aisha — planning her Tuscany honeymoon</h2>
          <p style={{ fontSize:14, color:C.muted, marginBottom:32, maxWidth:560 }}>From discovery to return, here's how GoEarth works in practice.</p>
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {[['Discovers','Aisha searches "romantic countryside Italy" and is matched to the Tuscan Slow Roads package — not a generic Rome itinerary with a day trip bolted on.'],['Plans',"She opens the AI Travel Planner and asks it to build a 9-day itinerary around truffle season — it returns a day-by-day plan in seconds."],['Books','She reserves directly through GoEarth. Confirmation comes within 24 hours from a real host family, not a call centre.'],['Experiences',"She arrives at an agriturismo in Val d'Orcia — truffle hunting, a private vineyard dinner, medieval hilltop villages."],['Returns','She leaves a review and starts planning her next trip — this time Spain, for the Tomatina festival.']].map(([step,desc],i,arr) => (
              <div key={step} style={{ display:'flex', gap:20 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:C.green, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, fontFamily:"'Playfair Display',serif" }}>{i+1}</div>
                  {i<arr.length-1 && <div style={{ width:1, flex:1, background:C.sand, minHeight:28 }} />}
                </div>
                <div style={{ paddingBottom:28 }}>
                  <h4 style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:500, marginBottom:6 }}>{step}</h4>
                  <p style={{ fontSize:14, color:C.muted, lineHeight:1.75, maxWidth:520 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:40, marginBottom:40 }}>The team</h2>
        <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {[['🌿','Founder & CEO','Jashim Konnengal','Rural tourism innovator bridging GCC, India, and rural Europe.'],['📊','Communications','Open Position','Market research and stakeholder relations.'],['🎬','Multimedia','Open Position','Photography, video, and digital storytelling.'],['🇮🇹','Country Ambassador','Open Position — Italy','On-the-ground partnerships in our launch market.']].map(([emoji,role,name,desc]) => (
            <div key={role} style={{ background:C.ivory, border:`1px solid ${C.sand}`, borderRadius:14, padding:'32px 22px' }}>
              <div style={{ fontSize:36, marginBottom:16 }}>{emoji}</div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:C.muted, marginBottom:7 }}>{role}</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:500, marginBottom:10, lineHeight:1.25 }}>{name}</h3>
              <p style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer className='gt-px' style={{ background:C.text, color:C.white, padding:'64px 52px 36px' }}>
      <div style={{ maxWidth:1180, margin:'0 auto' }}>
        <div className='gt-grid' style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:52, marginBottom:52 }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, marginBottom:10 }}>🌿 GoEarth</div>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', lineHeight:1.72, maxWidth:260, marginBottom:24 }}>Discover authentic local experiences, handpicked stays, and cultural adventures across rural Europe.</p>
          </div>
          {[['Explore',[['packages','All Packages'],['stays','Stays & Farmhouses'],['packages','Cultural Festivals']]],['For Partners',[['b2b','B2B Portal'],['b2b','Agency Programme'],['investors','Investor Overview']]],['Company',[['about','Our Story'],['about','Team'],['b2b','Contact']]]].map(([title,links]) => (
            <div key={title}>
              <h4 style={{ fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,.3)', marginBottom:18 }}>{title}</h4>
              {links.map(([pg,label]) => <button key={label} onClick={() => setPage(pg)} style={{ display:'block', fontSize:14, color:'rgba(255,255,255,.55)', background:'none', border:'none', cursor:'pointer', marginBottom:10, fontFamily:"'DM Sans',sans-serif", padding:0, textAlign:'left', transition:'color .2s' }}>{label}</button>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontSize:13, color:'rgba(255,255,255,.25)' }}>© 2025 TheGoEarth.com · Brussels, Belgium</span>
          <span style={{ fontSize:13, color:'rgba(255,255,255,.25)' }}>Dubai · Doha · Riyadh · Kochi · Bangalore · New Delhi</span>
        </div>
      </div>
    </footer>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('home')
  const navigate = (p) => { setPage(p); window.scrollTo({ top:0, behavior:'smooth' }) }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{STYLES}</style>
      <Nav page={page} setPage={navigate} />
      {page==='home' && <HomePage setPage={navigate} />}
      {page==='packages' && <PackagesPage setPage={navigate} />}
      {page==='stays' && <StaysPage />}
      {page==='b2b' && <B2BPage />}
      {page==='ai' && <AIPage />}
      {page==='about' && <AboutPage />}
      {page==='investors' && <InvestorsPage setPage={navigate} />}
      <Footer setPage={navigate} />
    </div>
  )
}
