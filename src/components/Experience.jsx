import React from 'react';

const experienceData = [
    {
        id: 1,
        date: '2024 - Present',
        title: 'Lead UI/UX Designer & Editor',
        company: 'Creative Solutions Agency',
        desc: 'Overseeing the complete design lifecycle of web and mobile products. Editing premium marketing videos and brand social campaigns, resulting in a 40% increase in user engagement.'
    },
    {
        id: 2,
        date: '2023 - 2024',
        title: 'Freelance Product Designer & Editor',
        company: 'Self-Employed',
        desc: 'Collaborated with global startup founders to craft visual design languages, wireframes, and promotional marketing video reels. Delivered over 25+ successful project design specs.'
    },
    {
        id: 3,
        date: '2021 - 2023',
        title: 'Junior Designer & Content Editor',
        company: 'Digital Media Lab',
        desc: 'Created layouts, vector components, and drafted UI screens. Responsible for editing monthly social media assets and interactive promotional graphics.'
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
