import React, { useState, useEffect } from 'react';
import lauzaImg from '../assets/lauza_hero.webp';
import SideRays from './SideRays';
import { useItems } from '../lib/useItems';

const roles = ['Full-stack Developer', 'Video Editor'];

export default function Hero({ onEnterGame }) {
    const { projects, status } = useItems();
    const [activeTarget, setActiveTarget] = useState('#projects');
    const [roleIndex, setRoleIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleType = () => {
            const fullText = roles[roleIndex];
            if (!isDeleting) {
                // Typing
                setCurrentText(fullText.substring(0, currentText.length + 1));
                setTypingSpeed(100);

                if (currentText === fullText) {
                    // Pause before deleting
                    setTypingSpeed(2000);
                    setIsDeleting(true);
                }
            } else {
                // Deleting
                setCurrentText(fullText.substring(0, currentText.length - 1));
                setTypingSpeed(50);

                if (currentText === '') {
                    setIsDeleting(false);
                    setRoleIndex((prev) => (prev + 1) % roles.length);
                    setTypingSpeed(500); // pause before starting next
                }
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [currentText, isDeleting, roleIndex, typingSpeed]);

    const handleToggleScroll = (targetId) => {
        setActiveTarget(targetId);
        const section = document.querySelector(targetId);
        if (section) {
            const navHeight = 90;
            const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section id="home" className="hero-section">
            <SideRays
                speed={2.0}
                rayColor1="#ff7a30"
                rayColor2="#ffffff"
                intensity={1.8}
                spread={2.0}
                origin="top-right"
                tilt={0}
                saturation={1.4}
                blend={0.7}
                falloff={1.5}
                opacity={0.8}
            />
            <div className="hero-container">
                {/* Background Semicircle (z-index 1 - behind text) */}
                <div className="hero-circle"></div>

                {/* Text Layer (z-index 2 - in front of semicircle) */}
                <div className="hero-text-bg">
                    <h1 className="hero-title reveal-fade revealed">
                        I'm <span className="accent-orange">Lauza</span>,<br />
                        <span className="sub-title">
                            {currentText}
                            <span className="typing-cursor">|</span>
                        </span>
                    </h1>
                </div>

                {/* Person Cutout Avatar Layer (z-index 3 - pops out in front of text!) */}
                <div className="hero-avatar-wrapper reveal-fade revealed">
                    <span className="hero-avatar-frame">
                        <img src={lauzaImg} alt="Lauza" className="hero-avatar" />
                    </span>
                </div>

                {/* Floating Info Cards Wrapper */}
                <div className="hero-cards-wrapper">
                    <div className="floating-card float-left reveal-fade revealed">
                        <div className="now-label"><span className="now-dot" aria-hidden="true" />Currently</div>
                        <p className="now-role">Video Editor &amp; Live Stream Operator</p>
                        <p className="now-org">ABP Startup Incubator · Yogyakarta</p>
                    </div>

                    <div className="floating-card float-right reveal-fade revealed">
                        <div className="stats-num">{status === 'ready' ? projects.length : '–'}</div>
                        <div className="stats-label">Projects<br />Built</div>
                    </div>
                </div>

                {/* Center Bottom Toggle Pill Button */}
                <div className="hero-toggle-pill reveal-fade revealed">
                    <button 
                        className={`toggle-btn ${activeTarget === '#projects' ? 'active' : ''}`} 
                        onClick={() => handleToggleScroll('#projects')}
                    >
                        Portfolio <span className="arrow">↗</span>
                    </button>
                    <button 
                        className={`toggle-btn ${activeTarget === '#contact' ? 'active' : ''}`} 
                        onClick={() => handleToggleScroll('#contact')}
                    >
                        Hire me
                    </button>
                    {onEnterGame && (
                        <button
                            type="button"
                            className="toggle-btn toggle-btn-game"
                            onClick={onEnterGame}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 10V4l4 3h6l4-3v6a7 7 0 0 1-14 0Z" />
                                <circle cx="9.5" cy="12" r="0.8" fill="currentColor" />
                                <circle cx="14.5" cy="12" r="0.8" fill="currentColor" />
                            </svg>
                            3D House
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}


