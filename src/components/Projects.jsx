import React, { useState } from 'react';

const projectsData = [
    {
        id: 1,
        category: 'ui-ux',
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
        category: 'editing',
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
        category: 'web-dev',
        categoryLabel: 'Web Dev',
        title: 'Personal Brand Hub',
        desc: 'An ultra-fast static developer portfolio website, featuring customizable dark grids, smooth transitions, and high-scoring Lighthouse metrics.',
        link: '#',
        linkLabel: 'Explore Code',
        bgClass: 'web-dev-bg',
        mockType: 'code'
    },
    {
        id: 4,
        category: 'ui-ux',
        categoryLabel: 'UI/UX Design',
        title: 'Fintech Mobile App',
        desc: 'A minimalist finance application design emphasizing swift money transfers, elegant balance cards, and a clutter-free transaction dashboard.',
        link: '#',
        linkLabel: 'View Figma',
        bgClass: 'ui-ux-bg-2',
        mockType: 'mobile-ui'
    }
];

export default function Projects() {
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredProjects = activeFilter === 'all' 
        ? projectsData 
        : projectsData.filter(p => p.category === activeFilter);

    return (
        <section id="projects" className="projects-section">
            <div className="section-header">
                <span className="section-tag">Work Gallery</span>
                <h2 className="section-title">Selected Projects</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="project-filters reveal-fade revealed">
                <button 
                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('all')}
                >
                    All Projects
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'ui-ux' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('ui-ux')}
                >
                    UI/UX Design
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'editing' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('editing')}
                >
                    Video Editing
                </button>
                <button 
                    className={`filter-btn ${activeFilter === 'web-dev' ? 'active' : ''}`} 
                    onClick={() => setActiveFilter('web-dev')}
                >
                    Web Dev
                </button>
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
                {filteredProjects.map(project => (
                    <div key={project.id} className="project-card reveal-fade revealed">
                        <div className="project-image-wrapper">
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

                            </div>
                        </div>
                        <div className="project-info">
                            <span className="project-tag-item">{project.categoryLabel}</span>
                            <h3>{project.title}</h3>
                            <p>{project.desc}</p>
                            <a href={project.link} className="project-link">
                                {project.linkLabel} <span>→</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
