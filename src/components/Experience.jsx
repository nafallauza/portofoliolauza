import React from 'react';

const experienceData = [
    {
        id: 1,
        date: '2026 - Present',
        title: 'Content Designer & Video Editor',
        company: 'Amikom Business Park',
        desc: 'Designing promotional materials and editing video documentation for startup incubator activities. Collaborating with the marketing team to maintain visual consistency across social media.'
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
        date: '2024',
        title: 'Digital Designer & Frontend Assistant',
        company: 'PT GIT Solution',
        desc: 'Designed website interfaces from wireframes to high-fidelity UI using Figma. Implemented designs into functional frontend pages using HTML, CSS, and React.'
    }
];

export default function Experience() {
    return (
        <section id="experience" className="experience-section">
            <div className="section-header">
                <span className="section-tag">Journey</span>
                <h2 className="section-title">Professional Timeline</h2>
            </div>

            <div className="experience-container reveal-fade revealed">
                {/* Timeline Line */}
                <div className="timeline-line"></div>

                {experienceData.map(item => (
                    <div key={item.id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-date">{item.date}</div>
                        <div className="timeline-content">
                            <h3>{item.title}</h3>
                            <h4 className="company">{item.company}</h4>
                            <p>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
