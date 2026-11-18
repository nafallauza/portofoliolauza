// Proyek & sertifikat dikelola lewat /admin (Supabase); di sini hanya data statis

export const WHATSAPP_URL = 'https://wa.me/qr/522OQ7OQIFPJB1';

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
