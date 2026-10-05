import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { awardsData, processSteps, faqs, awardsContact } from './data';
import NominationModal from './NominationModal';
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
      <img ref={ref} src={src} alt={alt} loading="lazy" className={loaded ? 'img-loaded' : 'img-loading'} onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} {...rest} />
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
  const navLinks = (
    <>
      <Link to="/awards" className={awardsActive ? 'active' : ''} aria-current={awardsActive ? 'page' : undefined} onClick={() => setMobileOpen(false)}>Awards</Link>
      <Link to="/#process" className={processActive ? 'active' : ''} aria-current={processActive ? 'location' : undefined} onClick={() => setMobileOpen(false)}>Selection process</Link>
    </>
  );
  const nav = (
    <>
      {navLinks}
      <button className="btn-nominate" onClick={() => { setMobileOpen(false); onNominate(); }}>
        Nominate Now
      </button>
    </>
  );
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner wrap">
          <Link to="/" className="brand" aria-label="MCCIA Awards home">
            <img src="/assets/img/Logo-mccia.svg" alt="MCCIA" height="42" />
            <span className="brand-sep" />
            <span className="brand-label">Annual Awards<small>Recognising Excellence</small></span>
          </Link>
          <button className="btn-nominate header-cta" onClick={onNominate}>Nominate Now</button>
          <nav className="main-nav">{navLinks}</nav>
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
          <Reveal delay={150} className="overview-card-wrap">
            <div className="overview-card">
            <span className="overview-mark" aria-hidden="true">“</span>
            <p className="prose-text overview-quote">
              From a breakthrough idea to a resilient entrepreneur, from a business taking Indian capability to global
              markets to an organisation embedding sustainability in how it operates, excellence takes many forms.
            </p>
            <p className="overview-focus-label">Areas we recognise</p>
            <ul className="overview-focus" aria-label="Areas recognised by the awards">
              {['Industry', 'Entrepreneurship', 'Innovation', 'Exports', 'Sustainability', 'Social responsibility'].map((area, index) => (
                <li key={area}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{area}</li>
              ))}
            </ul>
            </div>
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
  const yearOf = award => Number((award.since.match(/\d{4}/) || [])[0]) || 0;
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
          {[...awardsData]
            .sort((x, y) => yearOf(x) - yearOf(y))
            .map((award, index) => (
              <Reveal key={award.id} delay={index * 40}>
                <Link to={`/awards/${award.id}`} className="home-category-link" style={{ '--tag-color': award.tagColor }}>
                  <span className="home-category-copy">
                    <span className="home-category-tag">{award.since}</span>
                    <strong>{award.tag}</strong>
                    <span className="home-category-desc">{award.eligibilitySummary}</span>
                    <span className="home-category-award">{award.title}</span>
                  </span>
                  <span className="home-category-arrow" aria-hidden="true">→</span>
                </Link>
              </Reveal>
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
                  <div className="process-head">
                    <span className="process-num" aria-hidden="true">{i + 1}</span>
                    <span className="process-phase">{['Apply', 'Review', 'Review', 'Evaluate', 'Evaluate', 'Evaluate'][i]}</span>
                  </div>
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
            <a href={`mailto:${awardsContact.email}`} className="btn-ghost-light">Write to {awardsContact.name}</a>
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
            <Reveal delay={120}>
              <h2 className="detail-section-title" style={{ marginTop: '3rem' }}>Award timeline</h2>
              <div className="timeline-container">
                <div className="timeline-step">
                  <div className="timeline-marker active"></div>
                  <div className="timeline-content">
                    <h4>Nominations Open</h4>
                    <p>Current phase</p>
                  </div>
                </div>
                <div className="timeline-step">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Jury Review</h4>
                    <p>Nov 2026 - Dec 2026</p>
                  </div>
                </div>
                <div className="timeline-step">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Shortlist Announced</h4>
                    <p>Jan 2027</p>
                  </div>
                </div>
                <div className="timeline-step">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Awards Gala</h4>
                    <p>Feb 2027</p>
                  </div>
                </div>
              </div>
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
            <section className="detail-card share-card">
              <h3>Share this Award</h3>
              <div className="share-buttons">
                <button type="button" aria-label="Share on LinkedIn" className="share-btn linkedin">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </button>
                <button type="button" aria-label="Share on X" className="share-btn twitter">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button type="button" aria-label="Share on WhatsApp" className="share-btn whatsapp">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.031 21.493l-3.125-.975-2.951 1.554.565-3.275-2.383-2.323.953-3.131L2.614 10.36l2.355-2.352.924-3.139 3.284.512L12.031 2.507l2.854 2.874 3.284-.512.924 3.139 2.355 2.352-2.476 2.983.953 3.131-2.383 2.323.565 3.275-2.951-1.554-3.125.975z"/></svg>
                </button>
                <button type="button" aria-label="Copy Link" className="share-btn copy-link" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </button>
              </div>
            </section>
            <div>
              <p className="detail-contact">Questions? <strong>{awardsContact.name}</strong><br /><a href={`mailto:${awardsContact.email}`}>{awardsContact.email}</a> · <a href={awardsContact.mobileHref}>{awardsContact.mobile}</a></p>
            </div>
          </aside>
        </div>
      </main>

      <section className="detail-cta-section wrap" style={{ textAlign: 'center', margin: '4rem auto', padding: '3rem', backgroundColor: '#f9f7f1', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem', color: '#1d352f' }}>Ready to nominate?</h2>
        <button className="btn-gold" type="button" onClick={() => onNominate(award.title)} style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
          Nominate for this award
        </button>
        <p className="detail-deadline" style={{ marginTop: '1rem', color: '#4a5553' }}>Submission deadline: <strong>15 November 2026</strong></p>
      </section>
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
