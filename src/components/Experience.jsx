import React from 'react';
import { EXPERIENCE_DATA } from '../data/projects';

export default function Experience() {
    return (
        <section id="experience" className="experience-section xp-layout">
            <div className="xp-intro reveal">
                <span className="section-index">03</span>
                <h2 className="section-title">Experience</h2>
                <p className="section-lead">Design, video and frontend work for a startup incubator, a software house and my own freelance clients.</p>
            </div>

            <div className="xp-list">
                {EXPERIENCE_DATA.map(item => (
                    <article key={item.id} className="xp-row reveal">
                        <span className="xp-date">{item.date}</span>
                        <div className="xp-body">
                            <h3>{item.title}</h3>
                            <p className="xp-company">{item.company}</p>
                            <p className="xp-desc">{item.desc}</p>
                            {item.highlights?.length > 0 && (
                                <div className="xp-tags">
                                    {item.highlights.map((tag) => (
                                        <span key={tag} className="xp-tag">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
