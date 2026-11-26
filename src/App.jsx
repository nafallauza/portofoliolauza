import React, { Suspense, lazy, useEffect, useState } from 'react';
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
// Admin dan mode game 3D dimuat terpisah supaya pengunjung biasa tidak ikut mengunduh kodenya
const isAdmin = /^\/admin\/?$/.test(window.location.pathname);
const AdminPage = lazy(() => import('./admin/AdminPage'));
const GameMode = lazy(() => import('./components/game/GameMode'));

const initialMode = () =>
    new URLSearchParams(window.location.search).get('mode') === 'game' ? 'game' : 'normal';

function syncModeUrl(nextMode) {
    const url = new URL(window.location.href);
    if (nextMode === 'game') url.searchParams.set('mode', 'game');
    else url.searchParams.delete('mode');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
}

export default function App() {
    const [mode, setMode] = useState(initialMode);

    useEffect(() => {
        if (mode !== 'normal') return;

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
    }, [mode]);

    const enterGameMode = () => {
        syncModeUrl('game');
        setMode('game');
    };

    const exitGameMode = (targetHash) => {
        syncModeUrl('normal');
        setMode('normal');
        if (targetHash) {
            requestAnimationFrame(() => {
                document.querySelector(targetHash)?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    };

    if (isAdmin) return <Suspense fallback={null}><AdminPage /></Suspense>;

    if (mode === 'game') {
        return (
            <Suspense
                fallback={
                    <div className="game-loading-screen">
                        <span className="game-loading-dot" aria-hidden="true" />
                        <span>Opening Lauza&apos;s 3D Cat House…</span>
                    </div>
                }
            >
                <GameMode onExit={exitGameMode} />
            </Suspense>
        );
    }

    return (
        <ClickSpark sparkColor="#ff7a30" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500}>
            {/* Radial Background Grid Glow */}
            <div className="grid-glow-bg"></div>

            <Navbar onEnterGame={enterGameMode} />
            {workSlug ? (
                <WorkPage slug={workSlug} />
            ) : (
                <>
                    <main>
                        <Hero onEnterGame={enterGameMode} />
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
