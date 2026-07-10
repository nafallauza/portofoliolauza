import React from 'react';
import StickerPeel from './StickerPeel';
import logoAbp from '../assets/logo_abp.png';
import logoGit from '../assets/logo_git.png';

const experienceData = [
    {
        id: 1,
        date: '2026 - Present',
        title: 'Content Designer & Video Editor',
        company: 'Amikom Business Park',
        desc: 'Designing promotional materials and editing video documentation for startup incubator activities. Collaborating with the marketing team to maintain visual consistency across social media.',
        logo: logoAbp
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
        desc: 'Designed website interfaces from wireframes to high-fidelity UI using Figma. Implemented designs into functional frontend pages using HTML, CSS, and React.',
        logo: logoGit
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
                        <div className="timeline-content" style={{ position: 'relative' }}>
                            {/* Sticker on the outside edge of the card */}
                            {item.logo && (
                                <div style={{ position: 'absolute', top: '-30px', right: '-30px', zIndex: 50, width: '90px', height: '90px' }}>
                                    <StickerPeel
                                        imageSrc={item.logo}
                                        width={90}
                                        initialPosition={{ x: 0, y: 0 }}
                                        rotate={Math.random() * 20 - 10} /* Random rotation between -10 and 10 */
                                        peelBackHoverPct={30}
                                        peelBackActivePct={50}
                                    />
                                </div>
                            )}
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
