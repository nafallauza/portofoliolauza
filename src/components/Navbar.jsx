import React, { useState, useEffect } from 'react';

export default function Navbar() {
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
            let current = 'home';
            document.querySelectorAll('main > section[id]').forEach(section => {
                if (section.getBoundingClientRect().top <= 150) current = section.id;
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
                            Projects
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
                </ul>

                <div className="nav-cta">
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
