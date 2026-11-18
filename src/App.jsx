import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects, { Certificates, WorkPage } from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import ClickSpark from './components/ClickSpark';
import Footer from './components/Footer';

// Link /work/<layanan> membuka halaman kategori; selain itu halaman utama
const workSlug = window.location.pathname.match(/^\/work\/(website|uiux|video)\/?$/)?.[1];

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

        // Link /#about dari halaman lain: lompat ke section setelah React selesai render
        if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();

        return () => revealObserver.disconnect();
    }, []);

    return (
        <ClickSpark sparkColor="#ff7a30" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500}>
            {/* Radial Background Grid Glow */}
            <div className="grid-glow-bg"></div>

            <Navbar />
            {workSlug ? (
                <WorkPage slug={workSlug} />
            ) : (
                <>
                    <main>
                        <Hero />
                        <About />
                        <Projects />
                        <Experience />
                        <Certificates />
                        <Contact />
                    </main>
                </>
            )}

            <Footer />
        </ClickSpark>
    );
}
