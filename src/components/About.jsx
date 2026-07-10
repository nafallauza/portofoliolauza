import React from 'react';
import LogoLoop from './LogoLoop';
import lauzaImg from '../assets/lauza_about.jpeg';
import ProfileCard from './ProfileCard';
import ciscoCert from '../assets/setifikat/ciscoo.jpeg';
import magangCert from '../assets/setifikat/magang.jpeg';

const ReactIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" className="ticker-svg">
    <ellipse cx="50" cy="50" rx="8" ry="38" transform="rotate(0 50 50)" />
    <ellipse cx="50" cy="50" rx="8" ry="38" transform="rotate(60 50 50)" />
    <ellipse cx="50" cy="50" rx="8" ry="38" transform="rotate(120 50 50)" />
    <circle cx="50" cy="50" r="10" fill="currentColor" />
  </svg>
);

const FigmaIcon = () => (
  <svg viewBox="0 0 38 57" fill="currentColor" className="ticker-svg figma-svg">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38H19V28.5Z" />
    <path d="M0 47.5C0 42.2533 4.2533 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.2533 57 0 52.7467 0 47.5Z" />
    <path d="M19 0V19H9.5C4.2533 19 0 14.7467 0 9.5C0 4.2533 4.2533 0 9.5 0H19Z" />
    <path d="M19 19V38H9.5C4.2533 38 0 33.7467 0 28.5C0 23.2533 4.2533 19 9.5 19H19Z" />
    <path d="M19 0H28.5C33.7467 0 38 4.2533 38 9.5C38 14.7467 33.7467 19 28.5 19H19V0Z" />
  </svg>
);

const PremiereIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <rect width="90" height="90" x="5" y="5" rx="14" fill="currentColor" />
    <text x="50" y="58" dominantBaseline="middle" textAnchor="middle" fill="#090909" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38">Pr</text>
  </svg>
);

const AfterEffectsIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <rect width="90" height="90" x="5" y="5" rx="14" fill="currentColor" />
    <text x="50" y="58" dominantBaseline="middle" textAnchor="middle" fill="#090909" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38">Ae</text>
  </svg>
);

const PhotoshopIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <rect width="90" height="90" x="5" y="5" rx="14" fill="currentColor" />
    <text x="50" y="58" dominantBaseline="middle" textAnchor="middle" fill="#090909" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38">Ps</text>
  </svg>
);

const TypeScriptIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <rect width="90" height="90" x="5" y="5" rx="10" fill="currentColor" />
    <text x="76" y="76" textAnchor="end" fill="#090909" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38">TS</text>
  </svg>
);

const JavaScriptIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <rect width="90" height="90" x="5" y="5" rx="10" fill="currentColor" />
    <text x="76" y="76" textAnchor="end" fill="#090909" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="38">JS</text>
  </svg>
);

const NextjsIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <circle cx="50" cy="50" r="46" fill="currentColor" />
    <path d="M70 66 L38 28 H32 V72 H38 V42 L68 72 Z" fill="#090909" />
  </svg>
);

const TailwindIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ticker-svg">
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.518 15.025 11.9 18.2 11.9c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.537 6.182 15.177 4.8 12.001 4.8zm-6 7.1c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.536 2.576 5.712 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624-1.177-1.194-2.536-2.576-5.712-2.576z" />
  </svg>
);

const VsCodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ticker-svg">
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/>
  </svg>
);

const AntigravityIcon = () => (
  <svg viewBox="0 0 100 100" className="ticker-svg">
    <rect width="90" height="90" x="5" y="5" rx="16" fill="currentColor" />
    <path d="M50 24 L78 60 H60 L50 44 L40 60 H22 Z" fill="#090909" />
    <path d="M22 70 H78 V78 H22 Z" fill="#090909" />
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="ticker-svg">
    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
  </svg>
);

const techLogos = [
    { node: <ReactIcon /> },
    { node: <FigmaIcon /> },
    { node: <PremiereIcon /> },
    { node: <AfterEffectsIcon /> },
    { node: <TypeScriptIcon /> },
    { node: <NextjsIcon /> },
    { node: <TailwindIcon /> },
    { node: <PhotoshopIcon /> },
    { node: <JavaScriptIcon /> },
    { node: <VsCodeIcon /> },
    { node: <AntigravityIcon /> },
    { node: <ClaudeIcon /> },
];

export default function About() {
    return (
        <section className="about-section">
            <div className="about-logo-ticker-wrapper">
                <LogoLoop
                    logos={techLogos}
                    speed={60}
                    direction="left"
                    logoHeight={42}
                    gap={32}
                    pauseOnHover={true}
                    fadeOut={true}
                    fadeOutColor="#090909"
                    scaleOnHover={true}
                />
            </div>

            <div id="about" className="about-card reveal-fade revealed" style={{ marginTop: '40px', scrollMarginTop: '110px' }}>
                {/* Left side: Bio & Workspace/Skills Table */}
                <div className="about-bio-content">
                    <table className="about-table">
                        <thead>
                            <tr>
                                <th colSpan="2" style={{ paddingBottom: '24px', textAlign: 'left' }}>
                                    <span className="section-tag" style={{ margin: 0, display: 'inline-block', marginBottom: '12px' }}>About Me</span>
                                    <h2 style={{ fontSize: '2.4rem', margin: 0, color: '#fff', fontFamily: 'var(--font-header)', letterSpacing: '-0.5px' }}>My Workspace & Skills</h2>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="table-label" style={{ verticalAlign: 'top', paddingTop: '16px' }}>Profile</td>
                                <td className="table-value" style={{ lineHeight: '1.6', paddingTop: '16px' }}>
                                    Informatics student specializing in UI/UX Design and Web Development. Passionate about crafting intuitive application interfaces and building responsive, functional digital experiences with high attention to detail.
                                </td>
                            </tr>
                            <tr>
                                <td className="table-label">Focus</td>
                                <td className="table-value">UI/UX Design, Frontend Development, Video Editing, Graphic Design</td>
                            </tr>
                            <tr>
                                <td className="table-label">Software</td>
                                <td className="table-value">Figma, Adobe Photoshop, Adobe Illustrator, Premiere Pro, OBS Studio</td>
                            </tr>
                            <tr>
                                <td className="table-label">Tech Stack</td>
                                <td className="table-value">HTML, CSS, JavaScript, React</td>
                            </tr>
                            <tr>
                                <td className="table-label">Education</td>
                                <td className="table-value">Informatics, Universitas Amikom Yogyakarta (GPA: 3.6)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Right side: Photo Frame */}
                <div className="about-photo-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <ProfileCard
                        name="Nafal Lauza"
                        title="UI/UX & Web Dev"
                        handle="nafallauza"
                        status="Available for work"
                        contactText="Hire Me"
                        avatarUrl={lauzaImg}
                        showUserInfo={false}
                        enableTilt={true}
                        enableMobileTilt={false}
                        onContactClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        behindGlowColor="rgba(255, 122, 48, 0.67)"
                        innerGradient="linear-gradient(145deg, #1a1a1a 0%, rgba(255, 122, 48, 0.15) 100%)"
                        behindGlowEnabled={true}
                    />
                </div>
            </div>

        </section>
    );
}
