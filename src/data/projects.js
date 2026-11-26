// Proyek & sertifikat dikelola lewat /admin (Supabase); di sini hanya data statis

export const WHATSAPP_URL = 'https://wa.me/qr/522OQ7OQIFPJB1';
export const CONTACT_EMAIL = 'nafallauza@gmail.com';
export const GITHUB_USER = 'nafallauza';
export const CV_URL = '/CV-Nafal-Lauza.pdf';

export const ABOUT_DATA = {
    headline: 'Informatics student at Universitas Amikom Yogyakarta who builds web apps and edits video content.',
    bio: 'My focus is full-stack web development, video editing, UI/UX design and graphic design. I build with HTML, CSS, JavaScript, React, Laravel and Python, and work in Figma, Premiere Pro, After Effects, Photoshop, Illustrator and OBS Studio.',
    currentRole: 'Video Editor & Live Stream Operator',
    currentOrg: 'ABP Startup Incubator · Yogyakarta',
    skills: [
        'React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Laravel', 'PHP',
        'Python', 'Figma', 'Premiere Pro', 'After Effects', 'Photoshop', 'OBS Studio',
    ],
};

export const EXPERIENCE_DATA = [
    {
        id: 1,
        date: 'Jan 2026 – Present',
        title: 'Video Editor, Designer & Live Stream Operator',
        company: 'ABP Startup Incubator (Amikom Business Park)',
        desc: 'Edit documentation and promotional videos, design social media visuals with the marketing team, and run live streams with OBS Studio and operate cameras during incubator events.',
        highlights: ['OBS Studio', 'Premiere Pro', 'Event Live Stream', 'Social Visuals'],
    },
    {
        id: 2,
        date: '2026 - Present',
        title: 'Freelance Video Clipper',
        company: 'Self-employed',
        desc: 'Editing short-form video content for TikTok, Reels, and Shorts. Optimizing viewer retention through engaging cuts, subtitles, transitions, and trend-aware background music.',
        highlights: ['TikTok / Reels', 'Retention Editing', 'Subtitles & Pacing'],
    },
    {
        id: 3,
        date: 'Oct – Dec 2024',
        title: 'Full-stack Web Developer (Intern)',
        company: 'PT GIT Solution',
        desc: 'Designed website interfaces in Figma, from wireframes to high-fidelity UI, then built them into working frontend pages with HTML, CSS and React.',
        highlights: ['Figma UI/UX', 'React', 'Responsive Frontend'],
    },
];

export const CONTACT_SOCIALS = [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/nafal-lauza-83a579275/' },
    { label: 'GitHub', url: `https://github.com/${GITHUB_USER}` },
    { label: 'TikTok', url: 'https://www.tiktok.com/@lauzaaaaa_?_r=1&_t=ZS-97ugMMHTa2W' },
    { label: 'Instagram', url: 'https://www.instagram.com/lauzaaaaa_?igsh=MWpxaW4wdHJnd3B3Zg==' },
    { label: 'WhatsApp', url: WHATSAPP_URL },
];

// Layanan freelance; slug dipakai untuk link /work/<slug>
export const services = [
    {
        slug: 'website',
        title: 'Website development',
        lead: 'Company profiles, online stores and web apps, built with Laravel and React.',
        tags: ['Landing page', 'Company profile', 'Web app'],
    },
    {
        slug: 'uiux',
        title: 'UI/UX design',
        lead: 'App and website interfaces designed in Figma, from wireframe to clickable prototype.',
        tags: ['Wireframe', 'UI design', 'Prototype'],
    },
    {
        slug: 'video',
        title: 'Video editing',
        lead: 'Short-form clips for Reels, TikTok and Shorts, plus event and promo videos.',
        tags: ['Reels / TikTok', 'Podcast clips', 'Event recap'],
    },
];
