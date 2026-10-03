import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { awardsData, processSteps, faqs } from './data';
import './App.css';

/* ─── Intersection Observer (reveal on scroll) ───────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────── */
function SkeletonImage({ src, alt, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setLoaded(Boolean(ref.current?.complete && ref.current?.naturalWidth));
  }, [src]);
  return (
    <>
      {!loaded && <span className="img-skeleton" aria-hidden="true" />}
      <img ref={ref} src={src} alt={alt} className={loaded ? 'img-loaded' : 'img-loading'} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} {...rest} />
    </>
  );
}

function Header({ onNominate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { pathname } = useLocation();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => {
    setActiveSection('');
    if (pathname !== '/') return undefined;
    const targets = ['awards', 'process'].map(id => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
        else setActiveSection(current => (current === entry.target.id ? '' : current));
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);
  const awardsActive = pathname.startsWith('/awards') || activeSection === 'awards';
  const processActive = activeSection === 'process';
  const nav = (
    <>
      <Link to="/awards" className={awardsActive ? 'active' : ''} aria-current={awardsActive ? 'page' : undefined} onClick={() => setMobileOpen(false)}>Awards</Link>
      <Link to="/#process" className={processActive ? 'active' : ''} aria-current={processActive ? 'location' : undefined} onClick={() => setMobileOpen(false)}>Selection process</Link>
      <button className="btn-nominate" onClick={() => { setMobileOpen(false); onNominate(); }}>
        Nominate Now
      </button>
    </>
  );
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="utility-bar">
        <span className="live-dot" />&nbsp;Nominations open · Closes 15 November 2026
        <div className="utility-links">
          <a href="tel:+912025709000">+91 20 2570 9000</a>
          <a href="mailto:info@mcciapune.com">info@mcciapune.com</a>
        </div>
      </div>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner wrap">
          <Link to="/" className="brand" aria-label="MCCIA Awards home">
            <img src="/assets/img/Logo-mccia.svg" alt="MCCIA" height="42" />
            <span className="brand-sep" />
            <span className="brand-label">Annual Awards<small>Recognising Excellence</small></span>
          </Link>
          <nav className="main-nav">{nav}</nav>
          <button className="hamburger" aria-label="Menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
        {mobileOpen && <div className="mobile-nav" id="mobile-navigation"><div className="mobile-nav-inner">{nav}</div></div>}
      </header>
    </>
  );
}

/* ─── Hero ───────────────────────────────────────────── */
function Hero({ onNominate }) {
  const heroRef = useRef(null);
  const imageRef = useRef(null);

  const handlePointerMove = event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = heroRef.current?.getBoundingClientRect();
    if (!bounds || !imageRef.current) return;

    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    imageRef.current.style.transform = `scale(1.04) translate3d(${-x * 10}px, ${-y * 8}px, 0)`;
  };

  const resetPointerMotion = () => {
    if (imageRef.current) imageRef.current.style.transform = 'scale(1) translate3d(0, 0, 0)';
  };

  return (
    <section
      className="hero hero-cinematic"
      id="hero"
      ref={heroRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerMotion}
    >
      <div className="hero-cinematic-image" ref={imageRef} aria-hidden="true" />
      <div className="wrap hero-cinematic-content">
        <div className="hero-cinematic-copy">
          <p className="hero-kicker"><span aria-hidden="true" /> MCCIA Annual Awards 2026</p>
          <h1 className="hero-title">
            <span className="hero-title-line hero-title-line-1">Excellence</span>
            <span className="hero-title-line hero-title-line-2">doesn’t always</span>
            <span className="hero-title-line hero-title-line-3">announce itself</span>
          </h1>
          <p className="hero-description">
            Recognising excellence across industry, entrepreneurship and social impact.
          </p>
          <div className="hero-actions">
            <button className="hero-action-primary" onClick={onNominate}>Nominate your business</button>
            <Link to="/awards" className="hero-action-secondary">Explore all {awardsData.length} awards <span aria-hidden="true">→</span></Link>
          </div>
        </div>

        <div className="hero-cinematic-footer">
          <div className="hero-deadline">
            <span>Nominations close</span>
            <strong>15 November 2026</strong>
          </div>
          <span className="hero-origin-label">MCCIA Awards · 79 years of legacy</span>
        </div>
      </div>
    </section>
  );
}

/* ─── Overview ───────────────────────────────────────── */
function Overview() {
  return (
    <section className="section overview-section" id="overview">
      <div className="wrap">
        <div className="two-col">
          <Reveal>
            <p className="eyebrow">Overview</p>
            <h2>A longstanding platform for the businesses shaping industry</h2>
            <div className="rule" />
            <p className="prose-text">
              This is an invitation to bring forward the work, the people and the journeys that deserve wider recognition.
            </p>
            <p className="prose-text">
              The MCCIA Awards 2026 recognise such achievements across industry, entrepreneurship, innovation,
              exports, sustainability and social responsibility.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <p className="prose-text overview-quote">
              From a breakthrough idea to a resilient entrepreneur, from a business taking Indian capability to global
              markets to an organisation embedding sustainability in how it operates, excellence takes many forms.
            </p>
            <ul className="overview-focus" aria-label="Areas recognised by the awards">
              {['Industry', 'Entrepreneurship', 'Innovation', 'Exports', 'Sustainability', 'Social responsibility'].map((area, index) => (
                <li key={area}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{area}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Recognition() {
  const benefits = [
    ['Build visibility', "Bring your organisation's achievements before a wider industry ecosystem."],
    ['Strengthen credibility', 'Put forward the innovation, performance or impact your organisation has demonstrated.'],
    ['Showcase excellence', 'Present your products, processes and initiatives on an established industry platform.'],
    ['Share what works', 'Help other businesses learn from approaches that contribute to industry and society.'],
  ];

  return (
    <section className="recognition-section" aria-labelledby="recognition-heading">
      <div className="wrap recognition-inner">
        <div className="recognition-heading">
          <h2 id="recognition-heading">Recognition that goes beyond a trophy</h2>
          <p>An MCCIA Award places your organisation’s achievements within a longstanding industry platform.</p>
        </div>
        <ul className="recognition-list">
          {benefits.map(([title, description]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── Award SVG Icons ──────────────────────────────── */
const AWARD_ICONS = {
  lightbulb: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6m-6-3h6M9 18a5 5 0 1 1 6 0H9Z" />
    </svg>
  ),
  person: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 9-9 1.5 3.5 0 7-2 9-1 1-1 2-1 3" />
      <path d="M4 13c4 0 7-3 8-7" />
    </svg>
  ),
  handshake: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3-3 3 3 4-4" />
      <path d="M3 17l5-5 4 4 5-5 4 4" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  ),
  grain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a9 9 0 0 1 9 9c0 4.97-9 13-9 13S3 15.97 3 11a9 9 0 0 1 9-9Z" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  ),
  recycle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-2.75L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-2.75l-3.51-6.083" />
      <path d="m7.196 9.5 2.518-4.36A1.83 1.83 0 0 1 11.3 4.5h1.384a1.83 1.83 0 0 1 1.586.915L16.8 9.5" />
      <polyline points="10 9 7 9 7 12" />
      <polyline points="14 19 17 19 17 16" />
    </svg>
  ),
};

/* ─── Awards Explorer ─────────────────────────────────── */
function AwardCard({ award, delay }) {
  return (
    <Reveal delay={delay} className="award-card-wrap">
      <article className="award-card" id={`award-${award.id}`} style={{ '--tag-color': award.tagColor }}>
        <div className="award-card-accent" style={{ background: award.tagColor }} />
        <div className="award-card-content">
          <div className="award-card-top">
            <div className={`award-image-frame ${award.imageType === 'logo' ? 'award-image-frame-logo' : ''}`}>
              {award.image ? (
                <SkeletonImage src={award.image} alt={award.imageAlt} loading="lazy" decoding="async" />
              ) : (
                <span className="award-image-fallback" aria-hidden="true">{AWARD_ICONS[award.icon]}</span>
              )}
            </div>
            <span className="award-tag">{award.tag}</span>
          </div>
          <div className="award-since">{award.since}</div>
          <h3>{award.title}</h3>
          <p className="award-desc">{award.description}</p>
          <p className="award-eligibility"><strong>Eligibility</strong> {award.eligibilitySummary}</p>
          <div className="award-card-footer">
            <Link className="award-detail-link" to={`/awards/${award.id}`}>
              View details <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function TrophyIcon() {
  return (
    <svg className="home-category-trophy" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="trophy-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d58f" />
          <stop offset="1" stopColor="#b68f46" />
        </linearGradient>
      </defs>
      <path d="M18 8h28v16c0 9-6 15-14 15s-14-6-14-15V8z" fill="url(#trophy-gold)" />
      <path d="M18 12H8c0 9 4 15 11 16M46 12h10c0 9-4 15-11 16" fill="none" stroke="#b68f46" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 38h8v8h-8z" fill="#b68f46" />
      <path d="M22 46h20l2 6H20z" fill="url(#trophy-gold)" />
      <rect x="16" y="52" width="32" height="5" rx="1.5" fill="#8f6f33" />
      <path d="M32 14l2.5 5 5.5.8-4 3.9.9 5.4-4.9-2.6-4.9 2.6.9-5.4-4-3.9 5.5-.8z" fill="#fff" opacity=".85" />
    </svg>
  );
}

function AwardsPreview() {
  return (
    <section className="section home-awards" id="awards" aria-labelledby="home-awards-heading">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">The MCCIA Awards</p>
          <h2 id="home-awards-heading">Categories for every kind of excellence</h2>
          <div className="rule" />
          <p className="prose-text">Explore the award categories and open one to review its criteria.</p>
        </Reveal>

        <div className="home-category-grid">
          {awardsData.map(award => (
            <Link key={award.id} to={`/awards/${award.id}`} className="home-category-link" style={{ '--tag-color': award.tagColor }}>
              <TrophyIcon />
              <span className="home-category-copy">
                <span className="home-category-tag">{award.since}</span>
                <strong>{award.tag}</strong>
                <span className="home-category-desc">{award.eligibilitySummary}</span>
              </span>
              <span className="home-category-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AwardsPage() {
  const filters = ['All', ...new Set(awardsData.map(award => award.tag))];
  const [active, setActive] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const query = search.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const matchesSearch = award => {
    const text = [award.title, award.tag, award.description, award.eligibility, award.eligibilitySummary, ...award.highlights].join(' ').toLowerCase();
    return terms.every(term => text.includes(term));
  };
  const searchMatches = awardsData.filter(matchesSearch);
  const countFor = filter => (filter === 'All' ? searchMatches.length : searchMatches.filter(a => a.tag === filter).length);
  const filtered = searchMatches
    .filter(award => active === 'All' || award.tag === active)
    .sort((a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : sort === 'za' ? b.title.localeCompare(a.title) : 0));
  const hasFilters = active !== 'All' || query !== '' || sort !== 'default';

  const clearFilters = () => {
    setActive('All');
    setSearch('');
    setSort('default');
  };

  return (
    <section className="section awards-directory" aria-labelledby="awards-directory-heading">
      <div className="wrap">
        <Link to="/#awards" className="guide-back-link">← Home</Link>
        <Reveal className="section-head awards-directory-head">
          <p className="eyebrow">The MCCIA Awards 2026</p>
          <h1 id="awards-directory-heading">Find the right award for your work</h1>
          <div className="rule" />
          <p className="prose-text">Search categories and eligibility. Open any award for its full criteria and recognition.</p>
        </Reveal>

        <div className="home-award-explorer">
          <div className="search-box-large">
            <label htmlFor="award-directory-search">Search awards and criteria</label>
            <input
              id="award-directory-search"
              type="search"
              placeholder="Try export, dairy or manufacturing"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
            {search && <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearch('')}>✕</button>}
          </div>
          <div className="filter-chips-modern" role="group" aria-label="Filter awards by category">
            {filters.map(filter => (
              <button
                key={filter}
                className={`chip-modern ${active === filter ? 'active' : ''}`}
                type="button"
                aria-pressed={active === filter}
                onClick={() => setActive(filter)}
              >
                {filter} <span className="chip-count">{countFor(filter)}</span>
              </button>
            ))}
          </div>
          <div className="sort-row">
            <label htmlFor="award-sort">Sort by</label>
            <select id="award-sort" value={sort} onChange={event => setSort(event.target.value)}>
              <option value="default">Featured</option>
              <option value="az">Title A–Z</option>
              <option value="za">Title Z–A</option>
            </select>
            {hasFilters && <button type="button" className="btn-ghost sort-reset" onClick={clearFilters}>Reset all</button>}
          </div>
        </div>

        <p className="result-count" aria-live="polite">
          <strong>{filtered.length}</strong> {filtered.length === 1 ? 'award' : 'awards'} shown
          {active !== 'All' && <> in <strong>{active}</strong></>}
        </p>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No awards match those filters</h3>
            <p>Try another search or category.</p>
            <button className="btn-ghost" type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="awards-grid bento-grid">
            {filtered.map((award, index) => (
              <AwardCard key={award.id} award={award} delay={index * 45} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Process ─────────────────────────────────────────── */
function Process() {
  return (
    <section className="section" id="process">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">Award Selection Process</p>
          <h2>From application to announcement</h2>
          <div className="rule" />
          <p className="prose-text">Start by submitting your application. Shortlisted candidates may then be asked for documents, a presentation, or a workplace visit.</p>
        </Reveal>
        <ol className="process-list" aria-label="Award selection stages in order">
          {processSteps.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <li className="process-item">
                <div className="process-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <p className="process-close">After careful evaluation and deliberation, the jury finalises the awardees.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <Reveal className="section-head">
          <p className="eyebrow">FAQs</p>
          <h2>Everything you need to know about applying</h2>
          <div className="rule" />
        </Reveal>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className={`faq-item ${open === i ? 'faq-open' : ''}`}>
                <button className="faq-q" type="button" aria-expanded={open === i} aria-controls={`faq-answer-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="faq-icon">{open === i ? '−' : '+'}</span>
                </button>
                <div className="faq-a" id={`faq-answer-${i}`} hidden={open !== i}><p>{f.a}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Nomination Modal ───────────────────────────────── */
function NominationModal({ initialAward, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    const blank = {
      businessName: '',
      contactName: '',
      email: '',
      phone: '',
      city: '',
      awardCategory: initialAward,
      turnover: '',
      employees: '',
      description: '',
      achievements: '',
      file: null,
      agree: false,
    };
    try {
      const draft = JSON.parse(sessionStorage.getItem('mccia-nomination-draft') || 'null');
      if (draft) return { ...blank, ...draft, awardCategory: initialAward || draft.awardCategory || '', file: null, agree: false };
    } catch { /* storage unavailable */ }
    return blank;
  });
  const [draftRestored] = useState(() => {
    try { return Boolean(sessionStorage.getItem('mccia-nomination-draft')); } catch { return false; }
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const { file, agree, ...draft } = form;
      sessionStorage.setItem('mccia-nomination-draft', JSON.stringify(draft));
    } catch { /* storage unavailable */ }
  }, [form]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  useEffect(() => {
    dialogRef.current?.scrollTo?.({ top: 0 });
  }, [step]);

  const validators = {
    businessName: v => (!v.trim() ? 'Required' : ''),
    contactName: v => (!v.trim() ? 'Required' : ''),
    email: v => (!v.trim() || !/\S+@\S+\.\S+/.test(v) ? 'Valid email required' : ''),
    phone: v => (!/^\+?[\d\s().-]{7,20}$/.test(v.trim()) || v.replace(/\D/g, '').length < 7 ? 'Enter a valid phone number' : ''),
  };
  const validateOnBlur = key => {
    const message = validators[key]?.(form[key]);
    setErrors(current => {
      if (message) return { ...current, [key]: message };
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const MAX_FILE_MB = 5;
  const onFile = file => {
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrors(current => ({ ...current, file: `File is larger than ${MAX_FILE_MB} MB. Choose a smaller one.` }));
      return;
    }
    set('file', file);
  };
  const onEnter = event => {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT' && event.target.type !== 'checkbox' && event.target.type !== 'file') {
      event.preventDefault();
      next();
    }
  };

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(current => {
      if (!current[k]) return current;
      const nextErrors = { ...current };
      delete nextErrors[k];
      return nextErrors;
    });
  };

  useEffect(() => {
    const previousFocus = document.activeElement;
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (submitted) dialogRef.current?.focus();
  }, [submitted]);

  const focusFirstError = errorsByField => {
    const fieldIds = {
      businessName: 'business-name',
      contactName: 'contact-name',
      email: 'contact-email',
      phone: 'contact-phone',
      awardCategory: 'award-category',
      description: 'nomination-story',
      agree: 'nomination-consent',
    };
    const firstInvalidId = fieldIds[Object.keys(errorsByField)[0]];
    if (firstInvalidId) document.getElementById(firstInvalidId)?.focus();
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = 'Required';
    if (!form.contactName.trim()) e.contactName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!/^\+?[\d\s().-]{7,20}$/.test(form.phone.trim()) || phoneDigits.length < 7) e.phone = 'Enter a valid phone number';
    setErrors(e);
    focusFirstError(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.awardCategory) e.awardCategory = 'Please select an award';
    setErrors(e);
    focusFirstError(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Required';
    if (!form.agree) e.agree = 'You must agree to proceed';
    setErrors(e);
    focusFirstError(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) {
      try { sessionStorage.removeItem('mccia-nomination-draft'); } catch { /* ignore */ }
      setSubmitted(true);
    }
  };

  const stepLabels = ['Contact details', 'Select award', 'Your story'];

  if (submitted) return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={dialogRef} className="modal glass-card" role="dialog" aria-modal="true" aria-labelledby="nomination-status-title" tabIndex="-1" onClick={e => e.stopPropagation()}>
        <div className="success-screen">
          <h2 id="nomination-status-title">Your nomination was not sent</h2>
          <p>This website form is a preview. It does not send or store the details you entered.</p>
          <p>To confirm the official submission process, contact the MCCIA Awards Desk:</p>
          <p><a href="mailto:sudhanwak@mcciapune.com">sudhanwak@mcciapune.com</a><br /><a href="tel:+912025709000">+91 20 2570 9000</a></p>
          <div className="modal-actions">
            <button className="btn-ghost" type="button" onClick={onClose}>Close preview</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div ref={dialogRef} className="modal glass-card" role="dialog" aria-modal="true" aria-labelledby="nomination-title" tabIndex="-1" onClick={e => e.stopPropagation()}>
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="Close nomination form preview">✕</button>
        <div className="modal-head">
          <p className="modal-eyebrow">MCCIA Awards 2026 · Closes 15 November</p>
          <h2 className="modal-title" id="nomination-title">Nominate your business</h2>
          <div className="form-progress" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Step ${step} of 3: ${stepLabels[step - 1]}`}>
            <div className="form-progress-bar" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
        <div className="modal-body">
          <div className="form-notice" role="note">
            Preview only: your details are not sent or saved. <a href="mailto:sudhanwak@mcciapune.com">Contact the Awards Desk</a> to submit officially.
          </div>
        {/* Step indicator */}
        <div className="step-indicator">
          {stepLabels.map((l, i) => (
            <React.Fragment key={i}>
              <div className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`} aria-current={step === i + 1 ? 'step' : undefined} role={step > i + 1 ? 'button' : undefined} tabIndex={step > i + 1 ? 0 : undefined} onClick={step > i + 1 ? () => setStep(i + 1) : undefined} onKeyDown={step > i + 1 ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStep(i + 1); } } : undefined}>
                {step > i + 1 ? '✓' : i + 1}
                <span>{l}</span>
              </div>
              {i < stepLabels.length - 1 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Contact */}
        {step === 1 && (
          <div className="form-step" onKeyDown={onEnter}>
            <p className="form-required-note"><span aria-hidden="true">*</span> Required{draftRestored && ' · We restored your earlier draft'}</p>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="business-name">Business / organisation name <span aria-hidden="true">*</span></label>
                <input id="business-name" onBlur={() => validateOnBlur('businessName')} type="text" autoComplete="organization" required aria-invalid={Boolean(errors.businessName)} aria-describedby={errors.businessName ? 'business-name-error' : undefined} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Organisation name" />
                {errors.businessName && <span className="field-error" id="business-name-error" role="alert">{errors.businessName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="contact-name">Contact person <span aria-hidden="true">*</span></label>
                <input id="contact-name" onBlur={() => validateOnBlur('contactName')} type="text" autoComplete="name" required aria-invalid={Boolean(errors.contactName)} aria-describedby={errors.contactName ? 'contact-name-error' : undefined} value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Full name" />
                {errors.contactName && <span className="field-error" id="contact-name-error" role="alert">{errors.contactName}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
                <input id="contact-email" onBlur={() => validateOnBlur('email')} type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@company.com" />
                {errors.email && <span className="field-error" id="contact-email-error" role="alert">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="contact-phone">Phone number <span aria-hidden="true">*</span></label>
                <input id="contact-phone" inputMode="tel" onBlur={() => validateOnBlur('phone')} type="tel" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'contact-phone-error' : undefined} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                {errors.phone && <span className="field-error" id="contact-phone-error" role="alert">{errors.phone}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="business-city">City / location</label>
                <input id="business-city" type="text" autoComplete="address-level2" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Pune, Maharashtra" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Award */}
        {step === 2 && (
          <div className="form-step">
            <div className="form-group">
              <label htmlFor="award-category">Select award category <span aria-hidden="true">*</span></label>
              <select id="award-category" required aria-invalid={Boolean(errors.awardCategory)} aria-describedby={errors.awardCategory ? 'award-category-error' : undefined} value={form.awardCategory} onChange={e => set('awardCategory', e.target.value)}>
                <option value="">Choose an award</option>
                {awardsData.map(a => (
                  <option key={a.id} value={a.title}>{a.title} ({a.tag})</option>
                ))}
              </select>
              {errors.awardCategory && <span className="field-error" id="award-category-error" role="alert">{errors.awardCategory}</span>}
            </div>
            {form.awardCategory && (() => {
              const sel = awardsData.find(a => a.title === form.awardCategory);
              return sel ? (
                <div className="award-preview glass-card" style={{ '--tag-color': sel.tagColor }}>
                  <div className="ap-header">
                    <span className="award-icon">{sel.icon}</span>
                    <div>
                      <span className="award-tag">{sel.tag}</span>
                      <h4>{sel.title}</h4>
                    </div>
                  </div>
                  <p className="ap-elig"><strong>Eligibility:</strong> {sel.eligibility}</p>
                  <p className="ap-prize">🏆 {sel.prize}</p>
                </div>
              ) : null;
            })()}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="annual-turnover">Annual turnover (approx.)</label>
                <select id="annual-turnover" value={form.turnover} onChange={e => set('turnover', e.target.value)}>
                  <option value="">Select range</option>
                  <option>Below ₹1 Crore</option>
                  <option>₹1–10 Crore</option>
                  <option>₹10–50 Crore</option>
                  <option>₹50–250 Crore</option>
                  <option>Above ₹250 Crore</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employee-count">Number of employees</label>
                <select id="employee-count" value={form.employees} onChange={e => set('employees', e.target.value)}>
                  <option value="">Select range</option>
                  <option>1–10</option>
                  <option>11–50</option>
                  <option>51–250</option>
                  <option>251–1000</option>
                  <option>1000+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Story */}
        {step === 3 && (
          <div className="form-step">
            <div className="review-summary">
              <div><span>Nominee</span><strong>{form.businessName}</strong></div>
              <div><span>Award</span><strong>{form.awardCategory}</strong></div>
              <button type="button" className="review-edit" onClick={() => setStep(1)}>Edit details</button>
            </div>
            <div className="form-group">
              <label htmlFor="nomination-story">Describe your work and achievements <span aria-hidden="true">*</span></label>
              <textarea id="nomination-story" required aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'nomination-story-error' : 'nomination-story-help'} value={form.description} maxLength={1500} onChange={e => set('description', e.target.value)} rows="5" placeholder="Describe the work that makes your organisation a fit for this award." />
              <span className="form-help" id="nomination-story-help">Include the initiative, what changed and the results you can substantiate. <span className="char-count">{form.description.trim().length}/1500</span></span>
              {errors.description && <span className="field-error" id="nomination-story-error" role="alert">{errors.description}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="nomination-achievements">Key achievements and milestones</label>
              <textarea id="nomination-achievements" value={form.achievements} onChange={e => set('achievements', e.target.value)} rows="3" placeholder="Add relevant milestones or evidence." />
            </div>
            <div className="form-group">
              <label htmlFor="fileUpload">Supporting document (optional)</label>
              <div className={`file-drop ${form.file ? 'has-file' : ''}`}>
                <input type="file" id="fileUpload" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" aria-describedby="supporting-file-help" onChange={e => onFile(e.target.files?.[0] || null)} />
                <span className="file-drop-text">{form.file ? <><strong>{form.file.name}</strong> · {(form.file.size / 1024).toFixed(0)} KB</> : <><strong>Choose a file</strong> or drag it here</>}</span>
                {form.file && <button type="button" className="file-remove" onClick={() => { set('file', null); document.getElementById('fileUpload').value = ''; }}>Remove</button>}
              </div>
              <span className="form-help" id="supporting-file-help" aria-live="polite">
                PDF, DOC, DOCX, JPG or PNG, up to {MAX_FILE_MB} MB. A catalogue or photograph can support your nomination.
              </span>
              {errors.file && <span className="field-error" role="alert">{errors.file}</span>}
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input id="nomination-consent" type="checkbox" checked={form.agree} aria-invalid={Boolean(errors.agree)} aria-describedby={errors.agree ? 'nomination-consent-error' : undefined} onChange={e => set('agree', e.target.checked)} />
                <span>I confirm the information provided is accurate and I consent to MCCIA using it for evaluation purposes.</span>
              </label>
              {errors.agree && <span className="field-error" id="nomination-consent-error" role="alert">{errors.agree}</span>}
            </div>
          </div>
        )}

        </div>

        <div className="modal-actions">
          {step > 1 && <button className="btn-ghost" type="button" onClick={() => setStep(step - 1)}>← Back</button>}
          <span className="modal-step-count">Step {step} of 3</span>
          <button className="btn-gold" type="button" onClick={next}>
            {step < 3 ? 'Continue →' : 'Finish preview'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Contact / CTA Section ──────────────────────────── */
function CTA({ onNominate }) {
  return (
    <section className="cta-section">
      <div className="cta-orb" />
      <div className="wrap cta-inner">
        <Reveal>
          <p className="eyebrow eyebrow-light">Ready to apply?</p>
          <h2>Your business belongs among India's best.</h2>
          <p>Nominations close <strong>15 November 2026</strong>. The selection process is thorough and fair, assessed by an expert jury and an industry selection committee.</p>
          <div className="cta-actions">
            <button className="btn-gold" onClick={onNominate}>Nominate Your Business</button>
            <a href="mailto:sudhanwak@mcciapune.com" className="btn-ghost-light">Write to the Awards Desk</a>
          </div>
          <div className="contact-strip">
            <a href="tel:+912025709000">+91 20 2570 9000</a>
            <a href="mailto:info@mcciapune.com">info@mcciapune.com</a>
            <a href="https://www.mcciapune.com" target="_blank" rel="noreferrer">mcciapune.com</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <img src="/assets/img/Logo-mccia.svg" alt="MCCIA" height="40" />
          <p>Mahratta Chamber of Commerce,<br />Industries and Agriculture</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/#overview">Overview</a>
          <Link to="/awards">The Awards</Link>
          <a href="/#process">Selection Process</a>
          <a href="/#faq">FAQs</a>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>MCCIA Trade Tower, 403-A,<br />Senapati Bapat Road, Pune 411016</p>
          <a href="tel:+912025709000">+91 20 2570 9000</a>
          <a href="mailto:sudhanwak@mcciapune.com">sudhanwak@mcciapune.com</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Mahratta Chamber of Commerce, Industries and Agriculture. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ─── Scroll Progress Bar ────────────────────────────── */
function ScrollProgress() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const fn = () => {
      const s = document.documentElement.scrollTop;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setW(h > 0 ? (s / h) * 100 : 0);
    };
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return <div className="scroll-progress" style={{ width: `${w}%` }} />;
}

function MobileCTA({ onNominate }) {
  return (
    <div className="mobile-cta">
      <button className="btn-gold btn-block" onClick={onNominate}>
        Nominate Now
      </button>
    </div>
  );
}

/* ─── Pages ───────────────────────────────────────────── */
function HomePage({ onNominate }) {
  return (
    <>
      <Hero onNominate={onNominate} />
      <Overview />
      <AwardsPreview />
      <Recognition />
      <Process />
      <FAQ />
      <CTA onNominate={onNominate} />
    </>
  );
}

function AwardDetailPage({ onNominate }) {
  const { id } = useParams();
  const award = awardsData.find(item => item.id === id);

  if (!award) {
    return (
      <section className="section wrap not-found">
        <h1>Award not found</h1>
        <p>This award may have moved. Browse the current categories to continue.</p>
        <Link className="btn-gold" to="/awards">Browse awards</Link>
      </section>
    );
  }

  return (
    <div className="award-detail-page">
      <header className="award-detail-hero" style={{ '--award-color': award.tagColor }}>
        <div className="wrap award-detail-hero-inner">
          <Link to="/awards" className="detail-back-link">← All awards</Link>
          <div className="detail-hero-content">
            <div className={`award-image-frame detail-award-image ${award.imageType === 'logo' ? 'award-image-frame-logo' : ''}`}>
              {award.image ? (
                <SkeletonImage src={award.image} alt={award.imageAlt} />
              ) : (
                <span className="award-image-fallback" aria-hidden="true">{AWARD_ICONS[award.icon]}</span>
              )}
            </div>
            <div>
              <span className="award-tag" style={{ '--tag-color': award.tagColor }}>{award.tag}</span>
              <h1 className="detail-title">{award.title}</h1>
              <p className="detail-since">{award.since}</p>
            </div>
            <button className="btn-gold detail-hero-apply" type="button" onClick={() => onNominate(award.title)}>
              Nominate for this award
            </button>
          </div>
        </div>
      </header>

      <main className="wrap detail-body">
        <div className="detail-two-col">
          <div>
            <Reveal>
              <h2 className="detail-section-title">About this award</h2>
              <p className="detail-description">{award.description}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="detail-section-title" style={{ marginTop: '2.5rem' }}>Award highlights</h2>
              <ul className="detail-highlights">
                {award.highlights.map(highlight => (
                  <li key={highlight}>
                    <span className="detail-check" style={{ color: award.tagColor }} aria-hidden="true">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="detail-sidebar" aria-label={`${award.title} eligibility and prize`}>
            <section className="detail-card">
              <h3>Eligibility criteria</h3>
              <p className="detail-eligibility-summary">{award.eligibilitySummary}</p>
              <p>{award.eligibility}</p>
            </section>
            <section className="detail-card detail-prize-card" style={{ borderColor: `${award.tagColor}60` }}>
              <h3 style={{ color: award.tagColor }}>Prize and recognition</h3>
              <p className="detail-prize">{award.prize}</p>
              {award.prizeSpecial && <span className="prize-badge prize-special">Special cash prize</span>}
            </section>
            <div>
              <button className="btn-gold btn-block detail-apply-btn" type="button" onClick={() => onNominate(award.title)}>
                Nominate for this award
              </button>
              <p className="detail-deadline">Submission deadline: <strong>15 November 2026</strong></p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ─── App ─────────────────────────────────────────────── */
export default function App() {
  const [selectedAward, setSelectedAward] = useState(null);
  const location = useLocation();
  const showModal = selectedAward !== null;

  const openNomination = (awardTitle = '') => setSelectedAward(awardTitle || '');
  const closeNomination = () => setSelectedAward(null);

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <ScrollProgress />
      <Header onNominate={() => openNomination()} />
      
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<HomePage onNominate={openNomination} />} />
          <Route path="/awards" element={<AwardsPage />} />
          <Route path="/awards/:id" element={<AwardDetailPage onNominate={openNomination} />} />
          <Route path="*" element={<div className="not-found wrap"><h1>Page not found</h1><p>This page may have moved. Browse the awards to continue.</p><Link className="btn-gold" to="/awards">Browse awards</Link></div>} />
        </Routes>
      </main>
      <Footer />
      <MobileCTA onNominate={() => openNomination()} />
      {showModal && <NominationModal initialAward={selectedAward} onClose={closeNomination} />}
    </>
  );
}
