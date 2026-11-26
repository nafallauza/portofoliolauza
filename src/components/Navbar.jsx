import React, { useState, useEffect } from 'react';

const CatIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 10V4l4 3h6l4-3v6a7 7 0 0 1-14 0Z" />
        <circle cx="9.5" cy="12" r="0.8" fill="currentColor" />
        <circle cx="14.5" cy="12" r="0.8" fill="currentColor" />
        <path d="M10.5 15c.9.7 2.1.7 3 0" />
    </svg>
);

export default function Navbar({ onEnterGame }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileActive, setMobileActive] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            // Hanya section utama yang punya id; section di dalam komponen (grafik GitHub) diabaikan
            // Di halaman /work/<layanan>, menu Services yang menyala
            let current = window.location.pathname.startsWith('/work/') ? 'projects' : 'home';
            document.querySelectorAll('main > section[id]').forEach(section => {
                if (section.getBoundingClientRect().top <= 150) current = section.id === 'work' ? 'projects' : section.id;
            });
            // Di dasar halaman, Contact dianggap aktif walau tidak sampai ke atas layar
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'contact';
            setActiveSection(current);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        setMobileActive(false);
        const section = document.getElementById(id);
        // Section tidak ada di halaman ini (mis. /work/website): pindah ke halaman utama
        if (!section) {
            window.location.href = `/#${id}`;
            return;
        }
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
        <header className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="nav-logo">
                    <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
                        Lauza<span>.</span>
                    </a>
                </div>
                
                <ul className={`nav-links ${mobileActive ? 'mobile-active' : ''}`}>
                    <li>
                        <a 
                            href="#home" 
                            className={activeSection === 'home' ? 'active' : ''} 
                            onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
                        >
                            Home
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#about" 
                            className={activeSection === 'about' ? 'active' : ''} 
                            onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}
                        >
                            About
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#projects" 
                            className={activeSection === 'projects' ? 'active' : ''} 
                            onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}
                        >
                            Services
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#experience" 
                            className={activeSection === 'experience' ? 'active' : ''} 
                            onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }}
                        >
                            Experience
                        </a>
                    </li>
                    <li>
                        <a 
                            href="#contact" 
                            className={activeSection === 'contact' ? 'active' : ''} 
                            onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                        >
                            Contact
                        </a>
                    </li>
                    {onEnterGame && (
                        <li className="mobile-game-item">
                            <button
                                type="button"
                                className="btn-game-mode"
                                onClick={() => { setMobileActive(false); onEnterGame(); }}
                            >
                                <CatIcon />
                                <span>3D Cat House</span>
                            </button>
                        </li>
                    )}
                </ul>

                <div className="nav-cta">
                    {onEnterGame && (
                        <button type="button" className="btn-game-mode" onClick={onEnterGame}>
                            <CatIcon />
                            <span>3D Mode</span>
                        </button>
                    )}
                    <a href="#contact" className="btn-talk" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>
                        Let's Talk
                    </a>
                </div>

                <button 
                    className={`mobile-menu-toggle ${mobileActive ? 'active' : ''}`} 
                    onClick={() => setMobileActive(!mobileActive)}
                    aria-label="Toggle Menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </nav>
        </header>
    );
}
