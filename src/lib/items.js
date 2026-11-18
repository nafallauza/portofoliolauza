// Pure helpers for portfolio items: no Supabase import, so `node --test` can run them.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const YT_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
const YT_ID = /^[\w-]{11}$/;

export function youtubeIdFrom(url) {
    let u;
    try { u = new URL(url); } catch { return null; }
    if (!YT_HOSTS.includes(u.hostname)) return null;
    const id = u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1];
    return YT_ID.test(id ?? '') ? id : null;
}

// DB row -> the item shape Projects.jsx already renders
export function rowToItem(row) {
    const images = row.images ?? [];
    const youtubeId = youtubeIdFrom(row.youtube_url);
    const imageSrc = images[0] ?? (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined);
    const paragraphs = (row.full_desc ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const isCert = row.category === 'certificate';
    const links = row.links ?? [];
    return {
        id: row.id,
        category: row.category,
        categoryLabel: row.category_label ?? '',
        title: row.title,
        desc: row.description ?? '',
        fullDesc: paragraphs.length ? paragraphs : undefined,
        links: isCert && !links.length && images[0] ? [{ label: 'View Certificate', url: images[0] }] : links,
        images,
        imageSrc,
        youtubeId,
        issuer: row.issuer ?? '',
        date: row.date_label ?? '',
        link: isCert ? images[0] : undefined,
        linkLabel: isCert ? 'View Certificate' : undefined,
        published: row.published ?? true,
        sortOrder: row.sort_order ?? 0,
    };
}

const isHttpUrl = (s) => {
    try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; }
};

// Returns { field: message }; empty object means valid
export function validateItem(draft) {
    const errors = {};
    if (!draft.title?.trim()) errors.title = 'Judul wajib diisi.';
    const yt = draft.youtube_url?.trim();
    if (draft.category === 'video' && !yt) errors.youtube_url = 'Video wajib punya link YouTube.';
    else if (yt && !youtubeIdFrom(yt)) errors.youtube_url = 'Link YouTube tidak valid.';
    if ((draft.links ?? []).some((l) => !l.label?.trim() || !isHttpUrl(l.url)))
        errors.links = 'Setiap link butuh label dan URL yang diawali http:// atau https://.';
    return errors;
}

export function validateImageFile(file) {
    if (!file.type?.startsWith('image/')) return 'File harus berupa gambar.';
    if (file.size > MAX_IMAGE_BYTES) return 'Ukuran gambar maksimal 5 MB.';
    return null;
}
