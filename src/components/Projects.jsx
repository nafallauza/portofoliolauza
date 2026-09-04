import React, { useState } from 'react';
import ciscoCert from '../assets/setifikat/ciscoo.jpeg';
import magangCert from '../assets/setifikat/magang.jpeg';
import dermacareImg from '../assets/projects/dermacare.png';
import topupinImg from '../assets/projects/Topupin.png';
import nikkyImg from '../assets/projects/nikky.png';
import dengerinImg from '../assets/projects/Dengerin.png';

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
        links: [
            { label: 'GitHub', url: 'https://github.com/nafallauza' }
        ],
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

export default function Projects() {
    const [activeFilter, setActiveFilter] = useState('project');
    const [selectedProject, setSelectedProject] = useState(null);

    const filteredProjects = projectsData.filter(p => p.category === activeFilter);

    return (
        <section id="projects" className="projects-section">
            <div className="section-header">
                <span className="section-tag">Work Gallery</span>
                <h2 className="section-title">Selected Projects</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="project-filters reveal-fade revealed">
                <button 
                    className={`filter-btn ${activeFilter === 'project' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('project')}
                >
                    Project
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'certificate' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('certificate')}
                >
                    Certificate
                </button>
            </div>

            {/* Projects Grid */}
            <div className="projects-grid-minimal">
                {filteredProjects.map((project, index) => {
                    const formattedIndex = String(index + 1).padStart(2, '0');
                    return (
                    <div 
                        key={project.id} 
                        className="project-card-minimal reveal-fade revealed"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedProject(project)}
                    >
                        <div 
                            className={`project-image-wrapper-minimal ${project.category === 'certificate' ? 'is-certificate' : ''}`}
                            style={project.category === 'certificate' ? { aspectRatio: '16/10', height: 'auto', borderRadius: '0px' } : { borderRadius: '0px' }}
                        >
                            <div className={`project-image-placeholder ${project.bgClass}`} style={{ borderRadius: '0px' }}>
                                
                                {project.mockType === 'ui-ux' && (
                                    <div className="project-mock-ui">
                                        <div className="mock-nav"><span></span><span></span><span></span></div>
                                        <div className="mock-hero">
                                            <div className="mock-title"></div>
                                            <div className="mock-btn"></div>
                                        </div>
                                        <div className="mock-cards">
                                            <div></div><div></div>
                                        </div>
                                    </div>
                                )}

                                {project.mockType === 'video' && (
                                    <div className="project-mock-video">
                                        <div className="play-icon-svg">
                                            <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                        <span className="video-duration">0:45</span>
                                    </div>
                                )}

                                {project.mockType === 'code' && (
                                    <div className="project-mock-code">
                                        <span className="code-line">&lt;div class="grid-glow"&gt;</span>
                                        <span className="code-line indent">&lt;h1&gt;Future is Here&lt;/h1&gt;</span>
                                        <span className="code-line">&lt;/div&gt;</span>
                                    </div>
                                )}

                                {project.mockType === 'mobile-ui' && (
                                    <div className="project-mock-ui mobile">
                                        <div className="mock-status-bar"><span>9:41</span><span>🔋</span></div>
                                        <div className="mock-app-card"></div>
                                        <div className="mock-app-btn"></div>
                                    </div>
                                )}

                                {project.mockType === 'image' && (
                                    <div className="project-mock-image" style={{ width: '100%', height: '100%', borderRadius: '0px', overflow: 'hidden', display: 'block' }}>
                                        <img 
                                            src={project.imageSrc} 
                                            alt={project.title} 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: project.category === 'certificate' ? 'contain' : 'cover', 
                                                objectPosition: 'center',
                                                borderRadius: '0px'
                                            }} 
                                        />
                                    </div>
                                )}

                            </div>
                        </div>
                        <div className="project-info-minimal">
                            <div className="info-left">
                                <h3>{project.title}</h3>
                                <span className="project-tag-minimal">{project.categoryLabel.toUpperCase()}</span>
                            </div>
                            <div className="info-right">
                                <span className="project-index">{formattedIndex}</span>
                            </div>
                        </div>
                    </div>
                )})}
            </div>

            {selectedProject && (
                <div className="project-modal-overlay" onClick={() => setSelectedProject(null)}>
                    <div className="project-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedProject(null)}>×</button>
                        <div className="modal-inner">
                            <div className="modal-image-container">
                                {selectedProject.mockType === 'image' && selectedProject.imageSrc ? (
                                    <img src={selectedProject.imageSrc} alt={selectedProject.title} />
                                ) : (
                                    <div className={`project-image-placeholder ${selectedProject.bgClass} modal-placeholder`}>
                                        <span>{selectedProject.title} Preview</span>
                                    </div>
                                )}
                            </div>
                            <div className="modal-details">
                                <span className="project-tag-item">{selectedProject.categoryLabel}</span>
                                <h2>{selectedProject.title}</h2>
                                
                                <div className="modal-article">
                                    {selectedProject.fullDesc ? (
                                        selectedProject.fullDesc.map((p, i) => <p key={i}>{p}</p>)
                                    ) : (
                                        <p>{selectedProject.desc}</p>
                                    )}
                                </div>
                                
                                {selectedProject.links ? (
                                    <div className="modal-links">
                                        {selectedProject.links.map((lnk, i) => (
                                            <a key={i} href={lnk.url} target="_blank" rel="noreferrer" className="project-link">
                                                {lnk.label} <span>→</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : selectedProject.link && selectedProject.link !== '#' ? (
                                    <div className="modal-links">
                                        <a href={selectedProject.link} target="_blank" rel="noreferrer" className="project-link">
                                            {selectedProject.linkLabel || 'View'} <span>→</span>
                                        </a>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
