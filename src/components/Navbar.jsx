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

            // Track active section on scroll
            const sections = document.querySelectorAll('section');
            let current = 'home';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= (sectionTop - 150)) {
                    current = section.getAttribute('id') || 'home';
                }
            });
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
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
