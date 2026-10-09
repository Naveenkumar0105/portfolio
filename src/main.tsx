import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { projects } from './data/projects'
import { experience } from './data/experience'
import { skills, education } from './data/skills'
import { certs } from './data/certs'
import { site, dossierHighlights } from './data/site'
import './style.css'

const Figure = lazy(() => import('./Figure'))
const base = import.meta.env.BASE_URL
const resume = `${base}assets/resume.pdf`
const email = `mailto:${site.email}`
const linkedin = site.linkedin
const github = site.github

function Ornament() { return <span className="ornament" aria-hidden="true">✧</span> }
function SectionLabel({ id, children }: { id: string; children: React.ReactNode }) { return <div className="section-heading"><h2 id={`${id}-heading`} tabIndex={-1}>{children}</h2><Ornament /></div> }
function ScrollIcon() { return <svg className="scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 3h11a2 2 0 0 1 0 4H8v12a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2Zm2 4v11h11a2 2 0 0 1 0 4H6"/><path d="M17 3v4M4 18h4"/></svg> }
function ResumeLink({ className = '' }: { className?: string }) { return <a className={className} href={resume} download><ScrollIcon />Download Resume Scroll</a> }

function App() {
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'light' || saved === 'dark' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [showFigure, setShowFigure] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)
  const [dossierOpen, setDossierOpen] = useState(false)
  const [toast, setToast] = useState(false)
  const [copied, setCopied] = useState(false)
  const [seeker, setSeeker] = useState(false)
  const [snitch, setSnitch] = useState({ x: 0, y: 0 })
  const [certImage, setCertImage] = useState<string|null>(null)
  const heroRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const snitchRef = useRef<HTMLButtonElement>(null)
  const heroSnitchRef = useRef<HTMLButtonElement>(null)
  const snitchStart = useRef({ x: 52, y: 42 })
  const lastFocus = useRef<HTMLElement|null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme) }, [theme])
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { setHeroVisible(entry.isIntersecting); if (entry.isIntersecting) setShowFigure(true) }, { rootMargin: '150px' })
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!seeker || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0, last = 0
    const started = performance.now()
    const tick = (time: number) => {
      if (time - last > 26) {
        const progress = Math.min((time - started) / 700, 1)
        const ease = progress * progress * (3 - 2 * progress)
        const x = 52 + 31 * Math.sin(time / 850), y = 42 + 23 * Math.sin(time / 1250)
        setSnitch({ x: snitchStart.current.x + (x - snitchStart.current.x) * ease, y: snitchStart.current.y + (y - snitchStart.current.y) * ease })
        last = time
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [seeker])
  useEffect(() => {
    if (!dossierOpen && !certImage) return
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeModal() }
      if (event.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
        const items = [...(dialog?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])]
        if (event.shiftKey && (document.activeElement === items[0] || !dialog?.contains(document.activeElement))) { event.preventDefault(); items.at(-1)?.focus() }
        if (!event.shiftKey && (document.activeElement === items.at(-1) || !dialog?.contains(document.activeElement))) { event.preventDefault(); items[0]?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow }
  }, [dossierOpen, certImage])
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); if (copyTimer.current) clearTimeout(copyTimer.current) }, [])
  const closeModal = (focusTarget?: HTMLElement) => {
    setDossierOpen(false); setCertImage(null)
    const target = focusTarget ?? lastFocus.current
    requestAnimationFrame(() => (target?.isConnected ? target : document.querySelector<HTMLElement>('.snitch-dock button'))?.focus())
  }
  const goToHighlight = (section: 'work'|'experience') => {
    const heading = document.getElementById(`${section}-heading`)
    closeModal(heading ?? undefined)
    document.getElementById(section)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch { setCopied(false) }
  }
  const openDossier = () => { lastFocus.current = document.activeElement as HTMLElement; setToast(false); setCopied(false); setDossierOpen(true) }
  const startSeeker = () => {
    const origin = heroSnitchRef.current
    if (!origin) return
    const rect = origin.getBoundingClientRect()
    if (rect.top < 0 || rect.bottom > innerHeight) origin.scrollIntoView({ block: 'center', behavior: 'instant' })
    const { x, y, width, height } = origin.getBoundingClientRect()
    snitchStart.current = { x: (x + width / 2) / innerWidth * 100, y: (y + height / 2) / innerHeight * 100 }
    setSnitch(snitchStart.current)
    setSeeker(true)
    requestAnimationFrame(() => snitchRef.current?.focus())
  }
  const catchSnitch = () => {
    if (heroSnitchRef.current) heroSnitchRef.current.style.translate = '0 0'
    if (!sessionStorage.getItem('dossier-seen')) { sessionStorage.setItem('dossier-seen', '1'); openDossier() }
    else { setToast(true); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(false), 4000) }
  }
  const evadePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches || !heroSnitchRef.current) return
    const rect = heroSnitchRef.current.getBoundingClientRect()
    const dx = rect.left + rect.width / 2 - event.clientX, dy = rect.top + rect.height / 2 - event.clientY
    const distance = Math.hypot(dx, dy)
    heroSnitchRef.current.style.translate = distance < 110 && distance > 0 ? `${dx / distance * 16}px ${dy / distance * 16}px` : '0 0'
  }

  return <>
    <a className="skip-link" href="#work">Skip to work</a>
    <header className="site-header"><nav className="nav wrap" aria-label="Main navigation"><a className="wordmark" href="#top">{site.name.split(" ")[0]} <span>{site.name.split(" ")[1]}</span></a><div className="nav-links"><a href="#work">Work</a><a href="#experience">Experience</a><a href="#skills">Skills</a><a href="#contact">Contact</a><a className="nav-resume" href={resume} download>Resume</a><button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>{theme === 'light' ? '☾' : '☼'}</button></div></nav></header>
    <main id="top">
      <section className="hero wrap" ref={heroRef} aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">{site.heroLabel}</p><h1 id="hero-title">{site.heroFirst} <em>{site.heroSecond}</em></h1><p className="hero-sub">{site.heroDescription}</p><div className="hero-links"><a href={email}>Email ↗</a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={github} target="_blank" rel="noreferrer">GitHub ↗</a><ResumeLink /></div></div><div className="figure-space"><div className="figure-frame" onPointerMove={evadePointer}>{showFigure && <Suspense fallback={null}><Figure active={heroVisible} theme={theme} /></Suspense>}<button ref={heroSnitchRef} type="button" className="hero-snitch" style={{ visibility: seeker && !dossierOpen ? 'hidden' : 'visible' }} onClick={catchSnitch} aria-label="Catch the Golden Snitch"><span className="wing left-wing"/><span className="snitch-core"/><span className="wing right-wing"/></button><div className="figure-mark" aria-hidden="true">✧</div></div><p className="figure-caption">An original little bit of magic.</p></div></section>
      <div className="wrap"><section id="work" className="section" aria-labelledby="work-heading"><SectionLabel id="work">Work</SectionLabel><p className="section-intro">{site.workIntro}</p><div className="project-list">{projects.map((p, i) => <details className="project-row" key={p.title}><summary><span className="index">{String(i+1).padStart(2,'0')}</span><span className="project-main"><strong>{p.title}</strong><span className="project-result">{p.result}</span></span><span className="project-year">{p.year}</span><span className="expand-mark" aria-hidden="true">+</span></summary><div className="project-detail"><p><b>Problem</b>{p.problem}</p><p><b>Approach</b>{p.approach}</p><p><b>Result</b>{p.outcome}</p><div className="project-bottom"><span>{p.tech.join(' · ')}</span>{p.url && <a href={p.url} target="_blank" rel="noreferrer">View repository ↗</a>}</div></div></details>)}</div><a className="text-link more-link" href={github} target="_blank" rel="noreferrer">View More Projects ↗</a></section>
      <section id="experience" className="section" aria-labelledby="experience-heading"><SectionLabel id="experience">Experience</SectionLabel><div className="experience-list">{experience.map(e => <article className="experience-row" key={e.company}><div><h3>{e.company}</h3><p>{e.role}</p></div><div><span className="period">{e.period}</span><ul>{e.bullets.map(b => <li key={b}>{b}</li>)}</ul></div></article>)}</div></section>
      <section id="skills" className="section" aria-labelledby="skills-heading"><SectionLabel id="skills">Skills</SectionLabel><div className="simple-list">{skills.map(s => <div className="simple-row" key={s.label}><h3>{s.label}</h3><p>{s.items}</p></div>)}</div></section>
      <section id="education" className="section" aria-labelledby="education-heading"><SectionLabel id="education">Education</SectionLabel><div className="simple-list">{education.map(e => <article className="simple-row education-row" key={e.school}><div><h3>{e.school}</h3><p>{e.degree}</p></div><div><p>{e.period} · {e.grade}</p><p className="coursework">Coursework: {e.coursework}</p></div></article>)}</div></section>
      <section id="certifications" className="section" aria-labelledby="certifications-heading"><SectionLabel id="certifications">Certifications</SectionLabel><div className="simple-list">{certs.map(c => <div className="cert-row" key={c.title}><button type="button" className="cert-thumb" onClick={() => { lastFocus.current = document.activeElement as HTMLElement; setCertImage(`${base}assets/certificates/${c.image}`) }} aria-label={`Preview ${c.title} certificate`}><img src={`${base}assets/certificates/${c.image}`} alt="" loading="lazy" /></button><div><h3>{c.title}</h3><p>{c.issuer}</p></div><a href={c.url} target="_blank" rel="noreferrer">View Credential ↗</a></div>)}</div></section>
      </div>
    </main>
    <footer id="contact" className="footer"><div className="wrap"><SectionLabel id="contact">Contact</SectionLabel><h2>{site.contactHeadline}</h2><p className="contact-intro">{site.contactDescription}</p><div className="footer-links"><a href={email}>{site.email} ↗</a><a href={site.phoneHref}>{site.phoneDisplay} ↗</a><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={github} target="_blank" rel="noreferrer">GitHub ↗</a><ResumeLink /></div><p className="location">{site.location}</p><div className="footer-bottom"><span>© 2026 {site.name}</span><span>{site.quote}</span></div></div></footer>
    <div className="snitch-dock" aria-label="Quidditch Seeker Mode">{!seeker && <button type="button" onClick={startSeeker}><span className="snitch-glyph" aria-hidden="true">✦</span> Release Snitch</button>}<button type="button" onClick={openDossier}>Quick Resume</button></div>
    {seeker && <div className="seeker-hud"><span>Quidditch Seeker Mode · Catch the Golden Snitch</span><button type="button" onClick={() => setSeeker(false)}>Rest Snitch</button></div>}
    {seeker && <button ref={snitchRef} className="flying-snitch" hidden={dossierOpen} style={{ left: `${snitch.x}%`, top: `${snitch.y}%` }} type="button" aria-label="Catch the Golden Snitch" onClick={catchSnitch}><span className="wing left-wing"/><span className="snitch-core"/><span className="wing right-wing"/></button>}
    {toast && !dossierOpen && <div className="snitch-toast" role="status"><span>{site.dossier.toast}</span><button type="button" onClick={openDossier}>{site.dossier.open}</button></div>}
    {dossierOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}><div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reward-heading"><div className="dossier-top"><p className="eyebrow">{site.dossier.label}</p><button ref={closeRef} className="close" type="button" onClick={() => closeModal()} aria-label="Close dossier">×</button></div><h2 id="reward-heading">{site.dossier.headline.split('+150')[0]}<span className="points-shimmer">+150</span>{site.dossier.headline.split('+150')[1]}</h2><div className="dossier-identity"><h3>{site.name}</h3><p>{site.dossier.graduation}</p><p>{site.dossier.seeking}</p></div><p className="eyebrow dossier-label">{site.dossier.highlightsLabel}</p><div className="dossier-highlights">{dossierHighlights.map(item => <a href={`#${item.section}`} className="dossier-highlight" key={item.label} onClick={event => { event.preventDefault(); goToHighlight(item.section) }}><span className="dossier-stat">{item.stat}</span><span className="dossier-description">{item.description}</span><span className="dossier-target">{item.label} <span aria-hidden="true">↗</span></span></a>)}</div><div className="dossier-actions"><ResumeLink className="dossier-resume" /><div className="dossier-social"><div className="dossier-email"><a href={`mailto:${site.email}?subject=${encodeURIComponent(site.dossier.mailSubject)}`}>Email</a><button type="button" onClick={copyEmail} aria-label="Copy email address"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V4H4v12h4"/></svg></button></div><a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={github} target="_blank" rel="noreferrer">GitHub ↗</a></div><span className="copy-status" aria-live="polite">{copied ? 'Copied ✓' : ''}</span></div><div className="dossier-footer"><button type="button" onClick={() => closeModal()}>{site.dossier.keepExploring}</button><button type="button" onClick={() => { setSeeker(false); closeModal(document.querySelector<HTMLElement>('.snitch-dock button') ?? undefined) }}>{site.dossier.rest}</button></div></div></div>}
    {certImage && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) closeModal() }}><div className="certificate-dialog" role="dialog" aria-modal="true" aria-label="Certificate preview"><button ref={closeRef} className="close" type="button" onClick={() => closeModal()} aria-label="Close certificate preview">×</button><img src={certImage} alt="Certificate preview" /></div></div>}
  </>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
