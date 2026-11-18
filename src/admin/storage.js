import { supabase } from '../lib/supabase';

const BUCKET = 'portfolio';
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

// Returns the public URL of the uploaded image
export async function uploadImage(file, category) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    const path = `${category}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

// Ignores URLs that don't live in our bucket (e.g. YouTube thumbnails)
export async function removeImages(urls) {
    const paths = urls
        .map((u) => (u.includes(PUBLIC_PREFIX) ? decodeURIComponent(u.split(PUBLIC_PREFIX)[1]) : null))
        .filter(Boolean);
    if (!paths.length) return;
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw error;
}
