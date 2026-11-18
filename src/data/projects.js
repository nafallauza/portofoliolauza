import ciscoCert from '../assets/setifikat/ciscoo.jpeg';
import magangCert from '../assets/setifikat/magang.jpeg';
import dermacareImg from '../assets/projects/dermacare.webp';
import topupinImg from '../assets/projects/Topupin.webp';
import nikkyImg from '../assets/projects/nikky.webp';
import dengerinImg from '../assets/projects/Dengerin.webp';

const items = [
    {
        id: 1,
        category: 'website',
        categoryLabel: 'AI & Web Dev',
        title: 'DermaCare',
        desc: 'Aplikasi web analisis kesehatan kulit berbasis AI dan Streamlit dengan rekomendasi perawatan otomatis.',
        fullDesc: [
            "DermaCare adalah aplikasi web cerdas berbasis AI yang dikembangkan menggunakan Streamlit untuk membantu pengguna menganalisis kondisi kulit secara mudah dan cepat.",
            "Cukup ambil atau unggah foto kulit Anda, lalu sistem akan memproses gambar tersebut dan memberikan analisis awal mengenai masalah kulit yang mungkin ada (jerawat, ruam, dll).",
            "Aplikasi ini juga menyediakan rekomendasi perawatan yang disesuaikan dengan hasil deteksi, serta fitur konsultasi awal praktis untuk perawatan kulit harian Anda."
        ],
        links: [
            { label: 'Live App', url: 'https://dermacare-app-5eaae5bwvb39sfszlwar7q.streamlit.app/' },
            { label: 'GitHub', url: 'https://github.com/nafallauza/dermacare-streamlit' },
            { label: 'YouTube', url: 'https://youtu.be/7ViRwbl1_Ro?si=QVfjckbuJdv2t3xP' }
        ],
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: dermacareImg
    },
    {
        id: 2,
        category: 'website',
        categoryLabel: 'Web E-Commerce',
        title: 'Topupin',
        desc: 'Platform top-up game online otomatis dengan pengiriman instan, multi-payment, dan harga termurah.',
        fullDesc: [
            "Topupin adalah platform penyedia layanan top-up game online dan produk digital lainnya yang dirancang dengan antarmuka yang modern dan responsif.",
            "Platform ini memungkinkan pengguna untuk membeli diamond, voucher, dan mata uang game lainnya secara cepat dan aman dengan dukungan berbagai metode pembayaran.",
            "Topupin dilengkapi dengan fitur proses otomatis sehingga pesanan masuk dalam hitungan detik. Dibangun menggunakan arsitektur Laravel dan Vite."
        ],
        links: [
            { label: 'GitHub', url: 'https://github.com/awanee/Topupin' }
        ],
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: topupinImg
    },
    {
        id: 3,
        category: 'uiux',
        categoryLabel: 'Mobile App & AI',
        title: 'DengerIn',
        desc: 'Aplikasi mobile pembelajaran bahasa isyarat melalui visualisasi 3D dan praktik interaktif berbasis AI.',
        fullDesc: [
            "DengerIn (Bridging the Silence) adalah aplikasi mobile inovatif yang menyediakan pembelajaran bahasa isyarat melalui visualisasi avatar 3D dan praktik interaktif.",
            "Mengusung tiga keunggulan utama: Aksesibel, Interaktif (didukung kamera dan AI untuk deteksi gestur), serta Kurikulum Terstruktur yang ramah pemula.",
            "Dirancang dengan tampilan UI/UX yang inklusif, modern, dan menyenangkan untuk membantu komunikasi teman tuli."
        ],
        // TODO: tambahkan link GitHub saat repo DengerIn sudah ada
        bgClass: 'web-dev-bg',
        mockType: 'image',
        imageSrc: dengerinImg
    },
    {
        id: 4,
        category: 'website',
        categoryLabel: 'Point of Sale',
        title: 'Nikky Frozen POS',
        desc: 'Aplikasi Point of Sale (POS) cepat dan intuitif untuk operasional toko frozen food dengan manajemen kasir.',
        fullDesc: [
            "Nikky Frozen POS adalah sistem kasir point-of-sale berbasis web yang dirancang khusus untuk memenuhi kebutuhan operasional toko frozen food.",
            "Menghadirkan katalog produk interaktif, pemilihan cepat, keranjang belanja instan, kalkulasi otomatis total transaksi, serta pengelolaan shift kerja kasir.",
            "Mempermudah kasir memproses pesanan pelanggan secara cepat, akurat, dan efisien."
        ],
        links: [
            { label: 'Live App', url: 'https://nikky-frozen-pos.vercel.app' },
            { label: 'GitHub', url: 'https://github.com/Hanjaya27/nikky_frozen_POS_system' }
        ],
        bgClass: 'ui-ux-bg-2',
        mockType: 'image',
        imageSrc: nikkyImg
    },
    {
        id: 6,
        category: 'certificate',
        categoryLabel: 'Certification',
        title: 'Cisco Networking Academy',
        issuer: 'Cisco Networking Academy',
        date: 'Jan 2025',
        desc: 'CCNA: Introduction to Networks - Universitas Amikom Yogyakarta & Cisco Networking Academy.',
        fullDesc: [
            "Sertifikasi resmi CCNA: Introduction to Networks yang diselenggarakan oleh Cisco Networking Academy bekerja sama dengan Universitas Amikom Yogyakarta.",
            "Membuktikan kompetensi dalam arsitektur jaringan, protokol komunikasi TCP/IP, IP addressing (IPv4/IPv6), subnetting, switching, dan konfigurasi dasar perangkat Cisco."
        ],
        link: ciscoCert,
        linkLabel: 'View Certificate',
        bgClass: 'web-dev-bg',
        mockType: 'image',
        imageSrc: ciscoCert
    },
    {
        id: 7,
        category: 'certificate',
        categoryLabel: 'Experience',
        title: 'Internship Certificate - PT GIT Solution',
        issuer: 'PT GIT Solution',
        date: 'Oct – Dec 2024',
        desc: 'Sertifikat magang Fullstack Web Developer di PT GIT Solution (Oktober - Desember 2024).',
        fullDesc: [
            "Sertifikat resmi penyelesaian magang industri sebagai Fullstack Web Developer di PT GIT Solution (1 Oktober - 31 Desember 2024).",
            "Terlibat dalam perancangan antarmuka UI/UX di Figma, pengembangan aplikasi web responsif menggunakan React, serta integrasi sistem backend."
        ],
        link: magangCert,
        linkLabel: 'View Certificate',
        bgClass: 'ui-ux-bg',
        mockType: 'image',
        imageSrc: magangCert
    }
];

export const projects = items.filter((p) => p.category !== 'certificate');
export const certificates = items.filter((p) => p.category === 'certificate');
export const projectCount = projects.length;

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
