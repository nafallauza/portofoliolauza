import React, { useEffect, useRef, useState } from 'react';
import ciscoCert from '../assets/setifikat/ciscoo.jpeg';
import magangCert from '../assets/setifikat/magang.jpeg';
import dermacareImg from '../assets/projects/dermacare.webp';
import topupinImg from '../assets/projects/Topupin.webp';
import nikkyImg from '../assets/projects/nikky.webp';
import dengerinImg from '../assets/projects/Dengerin.webp';

const projectsData = [
    {
        id: 1,
        category: 'project',
        categoryLabel: 'AI & Web Dev',
        title: 'DermaCare',
        desc: 'Aplikasi web analisis kesehatan kulit berbasis AI dan Streamlit dengan rekomendasi perawatan otomatis.',
        fullDesc: [
            "DermaCare adalah aplikasi web cerdas berbasis AI yang dikembangkan menggunakan Streamlit untuk membantu pengguna menganalisis kondisi kulit secara mudah dan cepat.",
            "Cukup ambil atau unggah foto kulit Anda, lalu sistem akan memproses gambar tersebut dan memberikan analisis awal mengenai masalah kulit yang mungkin ada (jerawat, ruam, dll).",
            "Aplikasi ini juga menyediakan rekomendasi perawatan yang disesuaikan dengan hasil deteksi, serta fitur konsultasi awal praktis untuk perawatan kulit harian Anda."
        ],
        links: [
            { label: 'Live App', url: 'https://dermacare-app-5eaae5bwvb39sfszlwar7q.streamlit.app/' },
            { label: 'GitHub', url: 'https://github.com/nafallauza/dermacare-streamlit' },
            { label: 'YouTube', url: 'https://youtu.be/7ViRwbl1_Ro?si=QVfjckbuJdv2t3xP' }
        ],
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: dermacareImg
    },
    {
        id: 2,
        category: 'project',
        categoryLabel: 'Web E-Commerce',
        title: 'Topupin',
        desc: 'Platform top-up game online otomatis dengan pengiriman instan, multi-payment, dan harga termurah.',
        fullDesc: [
            "Topupin adalah platform penyedia layanan top-up game online dan produk digital lainnya yang dirancang dengan antarmuka yang modern dan responsif.",
            "Platform ini memungkinkan pengguna untuk membeli diamond, voucher, dan mata uang game lainnya secara cepat dan aman dengan dukungan berbagai metode pembayaran.",
            "Topupin dilengkapi dengan fitur proses otomatis sehingga pesanan masuk dalam hitungan detik. Dibangun menggunakan arsitektur Laravel dan Vite."
        ],
        links: [
            { label: 'GitHub', url: 'https://github.com/awanee/Topupin' }
        ],
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: topupinImg
    },
    {
        id: 3,
        category: 'project',
        categoryLabel: 'Mobile App & AI',
        title: 'DengerIn',
        desc: 'Aplikasi mobile pembelajaran bahasa isyarat melalui visualisasi 3D dan praktik interaktif berbasis AI.',
        fullDesc: [
            "DengerIn (Bridging the Silence) adalah aplikasi mobile inovatif yang menyediakan pembelajaran bahasa isyarat melalui visualisasi avatar 3D dan praktik interaktif.",
            "Mengusung tiga keunggulan utama: Aksesibel, Interaktif (didukung kamera dan AI untuk deteksi gestur), serta Kurikulum Terstruktur yang ramah pemula.",
            "Dirancang dengan tampilan UI/UX yang inklusif, modern, dan menyenangkan untuk membantu komunikasi teman tuli."
        ],
        // TODO: tambahkan link GitHub saat repo DengerIn sudah ada
        bgClass: 'web-dev-bg',
        mockType: 'image',
        imageSrc: dengerinImg
    },
    {
        id: 4,
        category: 'project',
        categoryLabel: 'Point of Sale',
        title: 'Nikky Frozen POS',
        desc: 'Aplikasi Point of Sale (POS) cepat dan intuitif untuk operasional toko frozen food dengan manajemen kasir.',
        fullDesc: [
            "Nikky Frozen POS adalah sistem kasir point-of-sale berbasis web yang dirancang khusus untuk memenuhi kebutuhan operasional toko frozen food.",
            "Menghadirkan katalog produk interaktif, pemilihan cepat, keranjang belanja instan, kalkulasi otomatis total transaksi, serta pengelolaan shift kerja kasir.",
            "Mempermudah kasir memproses pesanan pelanggan secara cepat, akurat, dan efisien."
        ],
        links: [
            { label: 'Live App', url: 'https://nikky-frozen-pos.vercel.app' },
            { label: 'GitHub', url: 'https://github.com/Hanjaya27/nikky_frozen_POS_system' }
        ],
        bgClass: 'ui-ux-bg-2',
        mockType: 'image',
        imageSrc: nikkyImg
    },
    {
        id: 6,
        category: 'certificate',
        categoryLabel: 'Certification',
        title: 'Cisco Networking Academy',
        issuer: 'Cisco Networking Academy',
        date: 'Jan 2025',
        desc: 'CCNA: Introduction to Networks - Universitas Amikom Yogyakarta & Cisco Networking Academy.',
        fullDesc: [
            "Sertifikasi resmi CCNA: Introduction to Networks yang diselenggarakan oleh Cisco Networking Academy bekerja sama dengan Universitas Amikom Yogyakarta.",
            "Membuktikan kompetensi dalam arsitektur jaringan, protokol komunikasi TCP/IP, IP addressing (IPv4/IPv6), subnetting, switching, dan konfigurasi dasar perangkat Cisco."
        ],
        link: ciscoCert,
        linkLabel: 'View Certificate',
        bgClass: 'web-dev-bg',
        mockType: 'image',
        imageSrc: ciscoCert
    },
    {
        id: 7,
        category: 'certificate',
        categoryLabel: 'Experience',
        title: 'Internship Certificate - PT GIT Solution',
        issuer: 'PT GIT Solution',
        date: 'Oct – Dec 2024',
        desc: 'Sertifikat magang Fullstack Web Developer di PT GIT Solution (Oktober - Desember 2024).',
        fullDesc: [
            "Sertifikat resmi penyelesaian magang industri sebagai Fullstack Web Developer di PT GIT Solution (1 Oktober - 31 Desember 2024).",
            "Terlibat dalam perancangan antarmuka UI/UX di Figma, pengembangan aplikasi web responsif menggunakan React, serta integrasi sistem backend."
        ],
        link: magangCert,
        linkLabel: 'View Certificate',
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: magangCert
    }
];

// Dipakai kartu statistik di hero supaya angkanya ikut bertambah
export const projectCount = projectsData.filter((p) => p.category === 'project').length;

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
            const top = mobile ? 80 : 84 + head.offsetHeight + 12;
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
                    <div className={`pm-media ${item.category === 'certificate' ? 'is-certificate' : ''}`}>
                        <img src={item.imageSrc} alt={item.title} />
                    </div>
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

export default function Projects() {
    const [activeFilter, setActiveFilter] = useState('project');
    const [selectedIndex, setSelectedIndex] = useState(null);

    const filteredProjects = projectsData.filter(p => p.category === activeFilter);
    const select = (item) => setSelectedIndex(filteredProjects.indexOf(item));

    return (
        <section id="projects" className="projects-section">
            <div className="section-head reveal">
                <div>
                    <span className="section-index">02</span>
                    <h2 className="section-title">Selected Work</h2>
                    <p className="section-lead">Apps and websites I've designed and built, plus the certificates I picked up along the way.</p>
                </div>

            <div className="project-filters">
                {['project', 'certificate'].map((cat) => (
                    <button
                        key={cat}
                        className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                        onClick={() => { setActiveFilter(cat); setSelectedIndex(null); }}
                    >
                        {cat === 'project' ? 'Projects' : 'Certificates'}
                        <span className="filter-count">{projectsData.filter(p => p.category === cat).length}</span>
                    </button>
                ))}
            </div>
            </div>

            {activeFilter === 'project'
                ? <ProjectStack projects={filteredProjects} onSelect={select} />
                : <CertificateViewer certificates={filteredProjects} onSelect={select} />}

            {selectedIndex !== null && (
                <ProjectModal
                    items={filteredProjects}
                    index={selectedIndex}
                    onChange={setSelectedIndex}
                    onClose={() => setSelectedIndex(null)}
                />
            )}
        </section>
    );
}
