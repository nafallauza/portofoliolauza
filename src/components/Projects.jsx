import React, { useState } from 'react';
import ciscoCert from '../assets/setifikat/ciscoo.jpeg';
import magangCert from '../assets/setifikat/magang.jpeg';

const projectsData = [
    {
        id: 1,
        category: 'project',
        categoryLabel: 'UI/UX Design',
        title: 'SaaS Analytics Platform',
        desc: 'High-fidelity dashboard interface tailored for AI-driven business intelligence. Focuses on data hierarchy, dense table grids, and dark interface elegance.',
        link: '#',
        linkLabel: 'View Prototype',
        bgClass: 'ui-ux-bg',
        mockType: 'ui-ux'
    },
    {
        id: 2,
        category: 'project',
        categoryLabel: 'Video Editing',
        title: 'Commercial Promo Reel',
        desc: 'Dynamic product teaser video integrating keyframe animation, swift kinetic typography transitions, and meticulous color grading for a premium brand showcase.',
        link: '#',
        linkLabel: 'Watch Video',
        bgClass: 'editing-bg',
        mockType: 'video'
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
        categoryLabel: 'UI/UX Design',
        title: 'Fintech Mobile App',
        desc: 'A minimalist finance application design emphasizing swift money transfers, elegant balance cards, and a clutter-free transaction dashboard.',
        link: '#',
        linkLabel: 'View Figma',
        bgClass: 'ui-ux-bg-2',
        mockType: 'mobile-ui'
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
            <div className={`projects-grid bento-layout-${filteredProjects.length}`}>
                {filteredProjects.map((project, index) => (
                    <div 
                        key={project.id} 
                        className={`project-card bento-item-${index} reveal-fade revealed`}
                        style={project.category === 'certificate' ? { pointerEvents: 'none' } : {}}
                    >
                        <div 
                            className="project-image-wrapper"
                            style={project.category === 'certificate' ? { aspectRatio: '4/3', height: 'auto', borderBottom: 'none' } : {}}
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
                                        <img src={project.imageSrc} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}

                            </div>
                        </div>
                        {project.category !== 'certificate' && (
                            <div className="project-info">
                                <span className="project-tag-item">{project.categoryLabel}</span>
                                <h3>{project.title}</h3>
                                <p>{project.desc}</p>
                                <a href={project.link} target="_self" rel="noreferrer" className="project-link">
                                    {project.linkLabel} <span>→</span>
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
