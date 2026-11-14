import React, { useEffect, useRef, useState } from 'react';
import {
    siReact, siJavascript, siTypescript, siTailwindcss, siHtml5, siCss, siVite,
    siLaravel, siPhp, siPython, siFigma, siGit, siGithub, siClaude,
} from 'simple-icons';
import LogoLoop from './LogoLoop';
import ContributionSkyline from './ui/contribution-skyline';

const GITHUB_USER = 'nafallauza';

const stack = [
    ['React', siReact], ['JavaScript', siJavascript], ['TypeScript', siTypescript],
    ['Tailwind', siTailwindcss], ['HTML', siHtml5], ['CSS', siCss], ['Vite', siVite],
    ['Laravel', siLaravel], ['PHP', siPhp], ['Python', siPython], ['Figma', siFigma],
    ['Git', siGit], ['GitHub', siGithub], ['Claude', siClaude],
];

const techLogos = stack.map(([name, icon]) => ({
    node: (
        <span className="tech-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg>
            {name}
        </span>
    ),
    title: name,
}));

// Warna skyline mengikuti aksen oranye situs, dari paling sepi ke paling ramai
// Kalimat utama About; bagian bertanda true ditulis oranye
const statement = [
    ['Informatics student at Universitas Amikom Yogyakarta who'],
    ['builds web apps', true],
    ['and'],
    ['edits video content.', true],
];
const statementText = statement.map(([text]) => text).join(' ');
const words = statement.flatMap(([text, accent]) => text.split(' ').map((w) => ({ text: w, accent })));

const orangePalette = ['#3a1c0d', '#7a3512', '#d4601f', '#ff8a45'];

export default function About() {
    const [contributions, setContributions] = useState(null);
    const statementRef = useRef(null);

    // Kata-kata menyala bertahap mengikuti posisi scroll
    useEffect(() => {
        const el = statementRef.current;
        const update = () => {
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
            el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    useEffect(() => {
        fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`)
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then(json => setContributions(json.contributions.map(({ date, count }) => ({ date, count }))))
            .catch(() => setContributions([]));
    }, []);

    return (
        <section id="about" className="about-section">
            <div className="about-logo-ticker-wrapper">
                <LogoLoop
                    logos={techLogos}
                    speed={40}
                    direction="left"
                    logoHeight={20}
                    gap={40}
                    pauseOnHover={true}
                    fadeOut={true}
                    fadeOutColor="#090909"
                    ariaLabel="Tech stack"
                />
            </div>

            <div className="about-card reveal-fade revealed">
                <div className="about-intro">
                    <div>
                        <span className="section-index">01</span>
                        <h2 className="about-heading">About me</h2>
                    </div>
                    <div>
                        <p className="about-statement" ref={statementRef} style={{ '--n': words.length }}>
                            <span className="sr-only">{statementText}</span>
                            {words.map((w, i) => (
                                <span key={i} aria-hidden="true" className={w.accent ? 'is-accent' : undefined} style={{ '--i': i }}>{w.text} </span>
                            ))}
                        </p>
                        <p className="about-text">
                            My focus is full-stack web development, video editing, UI/UX design and graphic design. I build with
                            HTML, CSS, JavaScript, React, Laravel and Python, and work in Figma, Premiere Pro, After Effects,
                            Photoshop, Illustrator and OBS Studio.
                        </p>
                    </div>
                </div>

                {contributions?.length > 0 && (
                    <div className="about-skyline reveal">
                        <ContributionSkyline
                            data={contributions}
                            palette={orangePalette}
                            footer={
                                <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">
                                    github.com/{GITHUB_USER}
                                </a>
                            }
                        />
                    </div>
                )}
                {contributions === null && <div className="about-skyline-placeholder" aria-hidden="true" />}
            </div>
        </section>
    );
}
