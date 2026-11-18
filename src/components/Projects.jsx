import React, { useEffect, useRef, useState } from 'react';
import { services, WHATSAPP_URL } from '../data/projects';
import { useItems } from '../lib/useItems';

// Project unggulan di tumpukan; sisanya dibuka lewat tombol
const FEATURED_LIMIT = 3;

const Icon = ({ d, size = 20 }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {d.map((path) => <path key={path} d={path} />)}
    </svg>
);
const ARROW_UP_RIGHT = ['M7 7h10v10', 'M7 17 17 7'];
const CHEVRON_LEFT = ['m15 18-6-6 6-6'];
const CHEVRON_RIGHT = ['m9 18 6-6-6-6'];
const CLOSE = ['M18 6 6 18', 'm6 6 12 12'];

function ShowMore({ total, limit, expanded, onToggle, label }) {
    if (total <= limit) return null;
    return (
        <button type="button" className="show-more" onClick={onToggle} aria-expanded={expanded}>
            <span className="show-more-label">{expanded ? 'Show less' : `See other ${label}`}</span>
            {!expanded && <span className="show-more-count">{String(total - limit).padStart(2, '0')}</span>}
            <span className="show-more-icon"><Icon d={expanded ? ['m18 15-6-6-6 6'] : ['m6 9 6 6 6-6']} size={20} /></span>
        </button>
    );
}

// Arsip project lainnya: baris editorial, preview gambar mengikuti kursor di desktop
function MoreProjects({ projects, onSelect }) {
    const [hovered, setHovered] = useState(null);
    const listRef = useRef(null);
    const previewRef = useRef(null);

    const handleMove = (e) => {
        const r = listRef.current.getBoundingClientRect();
        previewRef.current.style.transform = `translate(${e.clientX - r.left + 24}px, ${e.clientY - r.top}px) translateY(-50%)`;
    };

    return (
        <div className="archive" ref={listRef} onMouseMove={handleMove} onMouseLeave={() => setHovered(null)}>
            {projects.map((p, i) => (
                <button key={p.id} type="button" className="archive-row" onMouseEnter={() => setHovered(p.id)} onClick={() => onSelect(p)}>
                    <span className="archive-num">{String(FEATURED_LIMIT + i + 1).padStart(2, '0')}</span>
                    <img className="archive-thumb" src={p.imageSrc} alt="" loading="lazy" />
                    <span className="archive-title">{p.title}</span>
                    <span className="archive-desc">{p.desc}</span>
                    <span className="stack-cat">{p.categoryLabel}</span>
                    <span className="archive-arrow"><Icon d={ARROW_UP_RIGHT} size={20} /></span>
                </button>
            ))}
            <div ref={previewRef} className={`archive-preview ${hovered ? 'is-visible' : ''}`} aria-hidden="true">
                {projects.map((p) => (
                    <img key={p.id} src={p.imageSrc} alt="" className={hovered === p.id ? 'is-active' : ''} />
                ))}
            </div>
        </div>
    );
}

// Kartu project menumpuk saat discroll. Judul section ikut menempel, dan bar judul
// tiap kartu tetap terlihat, jadi semuanya muat dalam satu layar.
function ProjectStack({ projects, onSelect }) {
    const [expanded, setExpanded] = useState(false);
    const visible = projects.slice(0, FEATURED_LIMIT);
    const others = projects.slice(FEATURED_LIMIT);
    const listRef = useRef(null);

    useEffect(() => {
        const list = listRef.current;
        const head = list.closest('section').querySelector('.section-head');
        const cards = [...list.children];
        const n = cards.length;

        const layout = () => {
            const mobile = window.innerWidth <= 768;
            // Di HP judul tidak ikut menempel supaya kartu tetap lega
            const top = mobile ? 80 : parseFloat(getComputedStyle(head).top) + head.offsetHeight + 12;
            list.style.setProperty('--stack-top', `${top}px`);
            list.style.setProperty('--n', n);
            update();
        };
        const update = () => {
            const r = list.getBoundingClientRect();
            const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
            cards.forEach((card, i) => {
                const start = i / n;
                const t = Math.min(1, Math.max(0, (p - start) / (1 - start)));
                card.style.setProperty('--dim', ((n - 1 - i) * 0.14 * t).toFixed(3));
            });
        };

        layout();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', layout);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', layout);
        };
    }, [visible.length]);

    return (
        <>
            <div className="stack-list" ref={listRef}>
                {visible.map((p, i) => (
                    <article key={p.id} className="stack-card" style={{ '--i': i }}>
                        <button type="button" className="stack-tab" onClick={() => onSelect(p)}>
                            <span className="stack-index">{String(i + 1).padStart(2, '0')}</span>
                            <span className="stack-tab-title">{p.title}</span>
                            <span className="stack-cat">{p.categoryLabel}</span>
                        </button>
                        <div className="stack-inner">
                            <div className="stack-info">
                                <h3 className="stack-title">{p.title}</h3>
                                <p className="stack-desc">{p.desc}</p>
                                <div className="stack-actions">
                                    <button type="button" className="stack-btn is-primary" onClick={() => onSelect(p)}>
                                        View details <Icon d={ARROW_UP_RIGHT} size={16} />
                                    </button>
                                    {p.links?.[0] && (
                                        <a className="stack-btn" href={p.links[0].url} target="_blank" rel="noreferrer">
                                            {p.links[0].label} <Icon d={ARROW_UP_RIGHT} size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <button type="button" className="stack-media" onClick={() => onSelect(p)} aria-label={`Open ${p.title}`}>
                                <img src={p.imageSrc} alt="" loading="lazy" />
                            </button>
                        </div>
                    </article>
                ))}
            </div>
            <ShowMore total={projects.length} limit={FEATURED_LIMIT} expanded={expanded} onToggle={() => setExpanded(!expanded)} label="projects" />
            {expanded && <MoreProjects projects={others} onSelect={onSelect} />}
        </>
    );
}

// Credential viewer: daftar di kiri, sertifikat tampil besar seperti kertas di kanan
function CertificateViewer({ certificates, onSelect }) {
    const [active, setActive] = useState(0);
    const cert = certificates[active];

    const tilt = (e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
        el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
    };
    const reset = (e) => {
        e.currentTarget.style.setProperty('--rx', '0deg');
        e.currentTarget.style.setProperty('--ry', '0deg');
    };

    return (
        <div className="cred reveal">
            <ol className="cred-list">
                {certificates.map((c, i) => (
                    <li key={c.id}>
                        <button
                            type="button"
                            className={`cred-item ${i === active ? 'is-active' : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onFocus={() => setActive(i)}
                            onClick={() => onSelect(c)}
                        >
                            <span className="cred-num">{String(i + 1).padStart(2, '0')}</span>
                            <span className="cred-text">
                                <span className="cred-title">{c.title}</span>
                                <span className="cred-meta">{c.issuer} · {c.date}</span>
                            </span>
                            <span className="cred-type">{c.categoryLabel}</span>
                        </button>
                    </li>
                ))}
            </ol>

            <div className="cred-stage">
                <button type="button" className="cred-paper" onClick={() => onSelect(cert)} onMouseMove={tilt} onMouseLeave={reset} aria-label={`Open ${cert.title}`}>
                    <img key={cert.id} src={cert.imageSrc} alt={cert.title} />
                    <span className="cert-glare" aria-hidden="true" />
                </button>
                <div className="cred-caption">
                    <span>
                        <span className="cred-caption-title">{cert.title}</span>
                        <span className="cred-meta">{cert.desc}</span>
                    </span>
                    <button type="button" className="stack-btn" onClick={() => onSelect(cert)}>
                        View certificate <Icon d={ARROW_UP_RIGHT} size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Video YouTube (kalau ada, selain kategori video) lalu foto-foto; strip thumbnail kalau lebih dari satu
function ModalMedia({ item }) {
    const media = [
        ...(item.youtubeId && item.category !== 'video' ? [{ youtubeId: item.youtubeId }] : []),
        ...(item.images.length ? item.images : [item.imageSrc]).map((src) => ({ src })),
    ];
    const [active, setActive] = useState(0);
    const current = media[active];
    return (
        <div className={`pm-media ${item.category === 'certificate' ? 'is-certificate' : ''}`}>
            {current.youtubeId ? (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?rel=0`}
                    title={item.title}
                    allow="encrypted-media; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <img src={current.src} alt={item.title} />
            )}
            {media.length > 1 && (
                <div className="pm-thumbs">
                    {media.map((m, i) => (
                        <button key={m.youtubeId ?? m.src} type="button" className={i === active ? 'is-active' : undefined} onClick={() => setActive(i)} aria-label={m.youtubeId ? 'Play video' : `Photo ${i + 1}`}>
                            <img src={m.src ?? `https://i.ytimg.com/vi/${m.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProjectModal({ items, index, onChange, onClose }) {
    const item = items[index];
    const go = (step) => onChange((index + step + items.length) % items.length);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onChange((index + 1) % items.length);
            if (e.key === 'ArrowLeft') onChange((index - 1 + items.length) % items.length);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [index, items.length, onChange, onClose]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const links = item.links ?? (item.link && item.link !== '#' ? [{ label: item.linkLabel || 'View', url: item.link }] : []);

    return (
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-sheet" role="dialog" aria-modal="true" aria-label={item.title} onClick={(e) => e.stopPropagation()}>
                <div className="pm-bar">
                    <span className="pm-count">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                    <div className="pm-actions">
                        {items.length > 1 && (
                            <>
                                <button type="button" className="pm-icon" onClick={() => go(-1)} aria-label="Previous"><Icon d={CHEVRON_LEFT} /></button>
                                <button type="button" className="pm-icon" onClick={() => go(1)} aria-label="Next"><Icon d={CHEVRON_RIGHT} /></button>
                            </>
                        )}
                        <button type="button" className="pm-icon" onClick={onClose} aria-label="Close"><Icon d={CLOSE} /></button>
                    </div>
                </div>

                <div className="pm-body" key={item.id}>
                    <ModalMedia item={item} />
                    <div className="pm-details">
                        <span className="pm-label">{item.categoryLabel}</span>
                        <h2>{item.title}</h2>
                        <div className="pm-text">
                            {(item.fullDesc ?? [item.desc]).map((para, i) => <p key={i}>{para}</p>)}
                        </div>
                        {links.length > 0 && (
                            <div className="pm-links">
                                {links.map((lnk) => (
                                    <a key={lnk.url} href={lnk.url} target="_blank" rel="noreferrer" className="pm-link">
                                        {lnk.label} <Icon d={ARROW_UP_RIGHT} size={16} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modal detail dipakai bersama oleh halaman utama dan halaman kategori
function useModal(items) {
    const [index, setIndex] = useState(null);
    const modal = index !== null && (
        <ProjectModal items={items} index={index} onChange={setIndex} onClose={() => setIndex(null)} />
    );
    return [(item) => setIndex(items.indexOf(item)), modal];
}

const byService = (projects, slug) => projects.filter((p) => p.category === slug);

const LOAD_ERROR = "Couldn't load this section. Please refresh the page.";

// Halaman utama: daftar layanan, tiap baris menuju /work/<slug>
export default function Projects() {
    const { projects, status } = useItems();
    return (
        <section id="projects" className="projects-section">
            <div className="section-head reveal">
                <div>
                    <span className="section-index">02</span>
                    <h2 className="section-title">What I can do for you</h2>
                    <p className="section-lead">Pick a service to see the work I've done in it.</p>
                </div>
            </div>

            <ol className="service-list">
                {services.map((svc, i) => {
                    const items = byService(projects, svc.slug);
                    return (
                        <li key={svc.slug}>
                            <a className="service-row reveal" href={`/work/${svc.slug}`}>
                                <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
                                <span className="service-main">
                                    <span className="service-title">{svc.title}</span>
                                    <span className="service-lead">{svc.lead}</span>
                                    <span className="service-tags">
                                        {svc.tags.map((t) => <span key={t}>{t}</span>)}
                                    </span>
                                </span>
                                <span className="service-thumbs" aria-hidden="true">
                                    {items.slice(0, 3).map((p) => <img key={p.id} src={p.imageSrc} alt="" loading="lazy" />)}
                                </span>
                                <span className="service-meta">
                                    <span>{status !== 'ready' ? '' : items.length ? `${items.length} ${items.length === 1 ? 'project' : 'projects'}` : 'Coming soon'}</span>
                                    <span className="service-arrow"><Icon d={ARROW_UP_RIGHT} size={20} /></span>
                                </span>
                            </a>
                        </li>
                    );
                })}
            </ol>
            {status === 'error' && <p className="load-note">{LOAD_ERROR}</p>}
        </section>
    );
}

export function Certificates() {
    const { certificates, status } = useItems();
    const [select, modal] = useModal(certificates);
    return (
        <section id="certificates" className="projects-section">
            <div className="section-head reveal">
                <div>
                    <span className="section-index">04</span>
                    <h2 className="section-title">Certificates</h2>
                    <p className="section-lead">Courses and programs I've completed.</p>
                </div>
            </div>
            {certificates.length > 0 ? (
                <CertificateViewer certificates={certificates} onSelect={select} />
            ) : (
                <p className="load-note">{status === 'error' ? LOAD_ERROR : status === 'loading' ? 'Loading…' : 'No certificates yet.'}</p>
            )}
            {modal}
        </section>
    );
}

// Kartu video 9:16; diklik langsung memutar YouTube di tempat
function VideoGrid({ videos }) {
    const [playing, setPlaying] = useState(null);
    return (
        <div className="video-grid">
            {videos.map((v) => (
                <figure key={v.id} className="video-card reveal">
                    {playing === v.id ? (
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
                            title={v.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <button type="button" onClick={() => setPlaying(v.id)} aria-label={`Play ${v.title}`}>
                            <img src={v.imageSrc ?? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
                            <span className="video-play"><Icon d={['M8 5v14l11-7z']} size={22} /></span>
                        </button>
                    )}
                    <figcaption>
                        <span className="video-title">{v.title}</span>
                        <span className="stack-cat">{v.categoryLabel}</span>
                    </figcaption>
                </figure>
            ))}
        </div>
    );
}

// Halaman kategori yang linknya dikirim ke calon klien: /work/website, /work/uiux, /work/video
export function WorkPage({ slug }) {
    const svc = services.find((x) => x.slug === slug);
    const { projects, status } = useItems();
    const items = byService(projects, slug);
    const [select, modal] = useModal(items);

    useEffect(() => {
        document.title = `${svc.title} — Lauza`;
        window.scrollTo(0, 0);
    }, [svc]);

    return (
        <>

            <main>
                <section id="work" className="projects-section work-section">
                    <div className="section-head">
                        <div>
                        <nav className="work-switch" aria-label="Services">
                            {services.map((x) => (
                                <a key={x.slug} href={`/work/${x.slug}`} className={x.slug === slug ? 'is-active' : undefined} aria-current={x.slug === slug ? 'page' : undefined}>
                                    {x.title}
                                    <span>{status === 'ready' ? byService(projects, x.slug).length : ''}</span>
                                </a>
                            ))}
                        </nav>
                            <span className="section-index">Services / {svc.title}</span>
                            <h1 className="section-title">{svc.title}</h1>
                            <p className="section-lead">{svc.lead}</p>
                        </div>
                        <span className="service-tags">
                            {svc.tags.map((t) => <span key={t}>{t}</span>)}
                        </span>
                    </div>

                    {status !== 'ready' ? (
                        <p className="load-note">{status === 'error' ? LOAD_ERROR : 'Loading…'}</p>
                    ) : items.length === 0 ? (
                        <div className="work-empty reveal">
                            <p className="work-empty-title">Samples are on the way</p>
                            <p className="section-lead">I'm putting this page together. Message me and I'll send examples straight to your WhatsApp.</p>
                            <a className="stack-btn is-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Ask for samples <Icon d={ARROW_UP_RIGHT} size={16} /></a>
                        </div>
                    ) : slug === 'video' ? (
                        <VideoGrid videos={items} />
                    ) : (
                        <ProjectStack projects={items} onSelect={select} />
                    )}

                    <div className="work-cta reveal">
                        <p className="work-cta-title">Need {svc.title.toLowerCase()} like this?</p>
                        <div className="stack-actions">
                            <a className="stack-btn is-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer">Chat on WhatsApp <Icon d={ARROW_UP_RIGHT} size={16} /></a>
                            <a className="stack-btn" href="/#projects">See all services</a>
                        </div>
                    </div>
                </section>
                {modal}
            </main>
        </>
    );
}
