import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import ClickSpark from './components/ClickSpark';

export default function App() {
    useEffect(() => {
        // Scroll reveal animation observer
        const revealItems = document.querySelectorAll('.reveal-fade');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealItems.forEach(item => {
            revealObserver.observe(item);
        });

        return () => revealObserver.disconnect();
    }, []);

    return (
        <ClickSpark sparkColor="#ff7a30" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500}>
            {/* Radial Background Grid Glow */}
            <div className="grid-glow-bg"></div>

            <Navbar />
            
            <main>
                <Hero />
                <About />
                <Projects />
                <Experience />
                <Contact />
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; 2026 Lauza. All rights reserved.</p>
                    <p>Designed with premium aesthetics & clean code.</p>
                </div>
            </footer>
        </ClickSpark>
    );
}
