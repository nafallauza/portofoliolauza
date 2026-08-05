import React, { useState } from 'react';
import ciscoCert from '../assets/setifikat/ciscoo.jpeg';
import magangCert from '../assets/setifikat/magang.jpeg';
import dermacareImg from '../assets/projects/dermacare.png';
import topupinImg from '../assets/projects/topupin.png';
import nikkyposImg from '../assets/projects/nikkypos.png';

const projectsData = [
    {
        id: 1,
        category: 'project',
        categoryLabel: 'AI & Web Dev',
        title: 'DermaCare (AI Skin Analysis)',
        desc: 'An AI-powered dermatology application built with Streamlit for skin condition analysis and care recommendations.',
        fullDesc: [
            "DermaCare adalah aplikasi web cerdas berbasis AI yang dikembangkan menggunakan Streamlit untuk membantu pengguna menganalisis kondisi kulit secara mudah dan cepat.",
            "Cara kerjanya sangat sederhana: cukup ambil atau unggah foto kulit Anda, lalu sistem akan memproses gambar tersebut dan memberikan analisis awal mengenai masalah kulit yang mungkin ada (seperti jerawat, ruam, dll).",
            "Aplikasi ini juga menyediakan rekomendasi perawatan yang disesuaikan dengan hasil deteksi, serta fitur konsultasi awal. Meskipun bukan alat diagnosis medis resmi, DermaCare berfungsi sebagai panduan praktis untuk perawatan kulit harian Anda."
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
        desc: 'Platform top-up game online otomatis dengan pengiriman instan dan harga termurah.',
        fullDesc: [
            "Topupin adalah platform penyedia layanan top-up game online dan produk digital lainnya yang dirancang dengan antarmuka yang modern dan responsif.",
            "Platform ini memungkinkan pengguna untuk membeli diamond, voucher, dan mata uang game lainnya secara cepat dan aman dengan dukungan berbagai metode pembayaran.",
            "Topupin dilengkapi dengan fitur proses otomatis sehingga pesanan masuk dalam hitungan detik. Dibangun menggunakan teknologi web terkini untuk memberikan pengalaman pengguna (UX) yang mulus."
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
        category: 'certificate',
        categoryLabel: 'Certification',
        title: 'Cisco Networking Academy',
        desc: 'Completed comprehensive networking curriculum and hands-on training via Cisco.',
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
        title: 'Internship Certificate',
        desc: 'Successfully completed professional internship program and contributed to real-world projects.',
        link: magangCert,
        linkLabel: 'View Certificate',
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: magangCert
    },
    {
        id: 4,
        category: 'project',
        categoryLabel: 'Point of Sale',
        title: 'Nikky Frozen POS',
        desc: 'Aplikasi kasir (POS) khusus untuk toko frozen food dengan manajemen stok dan multi-cabang.',
        fullDesc: [
            "Nikky Frozen POS adalah sistem kasir point-of-sale berbasis web yang dirancang khusus untuk memenuhi kebutuhan operasional toko frozen food.",
            "Aplikasi ini memiliki fitur lengkap mulai dari pencatatan transaksi kasir, manajemen stok yang terintegrasi, fitur multi-cabang, hingga pengelolaan shift kasir dan riwayat transaksi harian.",
            "Dengan antarmuka pengguna yang bersih dan intuitif, sistem ini mempermudah kasir dalam memproses pesanan secara efisien dan akurat."
        ],
        links: [
            { label: 'Live App', url: 'https://nikky-frozen-pos.vercel.app' },
            { label: 'GitHub', url: 'https://github.com/Hanjaya27/nikky_frozen_POS_system' }
        ],
        bgClass: 'ui-ux-bg-2',
        mockType: 'image',
        imageSrc: nikkyposImg
    },
    {
        id: 5,
        category: 'project',
        categoryLabel: 'Web Development',
        title: 'E-Commerce Platform',
        desc: 'A full-stack e-commerce solution with dynamic cart management, smooth page transitions, and an integrated payment gateway interface.',
        link: '#',
        linkLabel: 'Live Demo',
        bgClass: 'web-dev-bg',
        mockType: 'code'
    },
    {
        id: 6,
        category: 'project',
        categoryLabel: 'UI/UX Design',
        title: 'Healthcare Portal',
        desc: 'Patient management dashboard designed for clinics, featuring a calming color palette and intuitive appointment scheduling flow.',
        link: '#',
        linkLabel: 'View Case Study',
        bgClass: 'ui-ux-bg',
        mockType: 'ui-ux'
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
                {filteredProjects.slice(0, 4).map((project, index) => {
                    const formattedIndex = String(index + 1).padStart(2, '0');
                    return (
                    <div 
                        key={project.id} 
                        className={`project-card-minimal reveal-fade revealed`}
                        style={project.category === 'certificate' ? { pointerEvents: 'none' } : { cursor: 'pointer' }}
                        onClick={() => {
                            if (project.category !== 'certificate') {
                                setSelectedProject(project);
                            }
                        }}
                    >
                        <div 
                            className="project-image-wrapper-minimal"
                            style={project.category === 'certificate' ? { aspectRatio: '4/3', height: 'auto' } : {}}
                        >
                            <div className={`project-image-placeholder ${project.bgClass}`}>
                                
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
                                    <div className="project-mock-image" style={{ width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', display: 'block' }}>
                                        <img src={project.imageSrc} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                    </div>
                                )}

                            </div>
                        </div>
                        {project.category !== 'certificate' && (
                            <div className="project-info-minimal">
                                <div className="info-left">
                                    <h3>{project.title.split(' (')[0]}</h3>
                                    <span className="project-tag-minimal">{project.categoryLabel.toUpperCase()}</span>
                                </div>
                                <div className="info-right">
                                    <span className="project-index">{formattedIndex}</span>
                                </div>
                            </div>
                        )}
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
                                ) : (
                                    <div className="modal-links">
                                        <a href={selectedProject.link} target="_blank" rel="noreferrer" className="project-link">
                                            {selectedProject.linkLabel} <span>→</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
