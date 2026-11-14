import React from 'react';

const nav = [['About', '#about'], ['Projects', '#projects'], ['Experience', '#experience'], ['Contact', '#contact']];
const social = [
    ['GitHub', 'https://github.com/nafallauza'],
    ['LinkedIn', 'https://www.linkedin.com/in/nafal-lauza-83a579275/'],
    ['Instagram', 'https://www.instagram.com/lauzaaaaa_'],
    ['TikTok', 'https://www.tiktok.com/@lauzaaaaa_'],
    ['WhatsApp', 'https://wa.me/qr/522OQ7OQIFPJB1'],
];

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-top reveal">
                <div className="footer-cta">
                    <p className="footer-eyebrow">Have a project in mind?</p>
                    <a className="footer-mail" href="mailto:nafallauza@gmail.com">nafallauza@gmail.com</a>
                </div>
                <nav className="footer-cols" aria-label="Footer">
                    <div>
                        <p className="footer-heading">Navigate</p>
                        {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
                    </div>
                    <div>
                        <p className="footer-heading">Elsewhere</p>
                        {social.map(([label, href]) => (
                            <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>
                        ))}
                    </div>
                </nav>
            </div>

            <p className="footer-wordmark" aria-hidden="true">LAUZA</p>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Nafal Lauza</span>
                <span>Yogyakarta, Indonesia</span>
                <a href="#home">Back to top ↑</a>
            </div>
        </footer>
    );
}
