import React from 'react';

const experienceData = [
    {
        id: 1,
        date: 'Jan 2026 – Present',
        title: 'Video Editor, Designer & Live Stream Operator',
        company: 'ABP Startup Incubator (Amikom Business Park)',
        desc: 'Edit documentation and promotional videos, design social media visuals with the marketing team, and run live streams with OBS Studio and operate cameras during incubator events.'
    },
    {
        id: 2,
        date: '2026 - Present',
        title: 'Freelance Video Clipper',
        company: 'Self-employed',
        desc: 'Editing short-form video content for TikTok, Reels, and Shorts. Optimizing viewer retention through engaging cuts, subtitles, transitions, and trend-aware background music.'
    },
    {
        id: 3,
        date: 'Oct – Dec 2024',
        title: 'Full-stack Web Developer (Intern)',
        company: 'PT GIT Solution',
        desc: 'Designed website interfaces in Figma, from wireframes to high-fidelity UI, then built them into working frontend pages with HTML, CSS and React.'
    }
];

export default function Experience() {
    return (
        <section id="experience" className="experience-section xp-layout">
            <div className="xp-intro reveal">
                <span className="section-index">03</span>
                <h2 className="section-title">Experience</h2>
                <p className="section-lead">Design, video and frontend work for a startup incubator, a software house and my own freelance clients.</p>
            </div>

            <div className="xp-list">
                {experienceData.map(item => (
                    <article key={item.id} className="xp-row reveal">
                        <span className="xp-date">{item.date}</span>
                        <div className="xp-body">
                            <h3>{item.title}</h3>
                            <p className="xp-company">{item.company}</p>
                            <p className="xp-desc">{item.desc}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
