import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { validateItem, validateImageFile, youtubeIdFrom } from '../lib/items';
import { uploadImage, removeImages } from './storage';

export const CATEGORIES = [
    { value: 'website', label: 'Website' },
    { value: 'uiux', label: 'UI/UX' },
    { value: 'video', label: 'Video' },
    { value: 'certificate', label: 'Sertifikat' },
];

const EMPTY = {
    category: 'website', category_label: '', title: '', description: '', full_desc: '',
    links: [], images: [], youtube_url: '', issuer: '', date_label: '', sort_order: 0, published: true,
};

const isAuthError = (err) => err?.status === 401 || /jwt|token|session/i.test(err?.message ?? '');

// Form for one item; parent remounts it (key) when switching items
export default function ItemForm({ row, onSaved, onDeleted }) {
    const [draft, setDraft] = useState(() => ({ ...EMPTY, ...row, links: row?.links ?? [], images: row?.images ?? [] }));
    const [newFiles, setNewFiles] = useState([]); // { file, preview }
    const [removed, setRemoved] = useState([]);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

    const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const setLink = (i, field, value) => setDraft((d) => ({ ...d, links: d.links.map((l, j) => (j === i ? { ...l, [field]: value } : l)) }));

    const addFiles = (e) => {
        const picked = [...e.target.files];
        e.target.value = '';
        const bad = picked.map(validateImageFile).find(Boolean);
        if (bad) return setErrors((er) => ({ ...er, images: bad }));
        setErrors(({ images: _images, ...rest }) => rest);
        setNewFiles((f) => [...f, ...picked.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    };

    const ytId = youtubeIdFrom(draft.youtube_url?.trim());
    const isCert = draft.category === 'certificate';

    const save = async (e) => {
        e.preventDefault();
        const found = validateItem(draft);
        setErrors(found);
        if (Object.keys(found).length) return;
        setBusy(true);
        setMessage('');
        try {
            const uploaded = [];
            for (const { file } of newFiles) uploaded.push(await uploadImage(file, draft.category));
            const { id, created_at: _createdAt, ...fields } = draft;
            const payload = {
                ...fields,
                title: draft.title.trim(),
                youtube_url: draft.youtube_url?.trim() || null,
                sort_order: Number(draft.sort_order) || 0,
                images: [...draft.images, ...uploaded],
                issuer: isCert ? draft.issuer : null,
                date_label: isCert ? draft.date_label : null,
            };
            const query = id
                ? supabase.from('projects').update(payload).eq('id', id)
                : supabase.from('projects').insert(payload);
            const { data, error } = await query.select().single();
            if (error) throw error;
            await removeImages(removed).catch((err) => console.warn("Foto lama tidak terhapus:", err)); // orphan files are harmless; don't fail the save
            onSaved(data);
        } catch (err) {
            setMessage(isAuthError(err) ? 'Sesi habis, silakan login lagi.' : `Gagal menyimpan: ${err.message}`);
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!confirm(`Hapus "${draft.title}"? Foto-fotonya juga ikut terhapus.`)) return;
        setBusy(true);
        try {
            const { error } = await supabase.from('projects').delete().eq('id', draft.id);
            if (error) throw error;
            await removeImages(draft.images).catch((err) => console.warn("Foto tidak terhapus:", err));
            onDeleted();
        } catch (err) {
            setMessage(isAuthError(err) ? 'Sesi habis, silakan login lagi.' : `Gagal menghapus: ${err.message}`);
            setBusy(false);
        }
    };

    const photos = [
        ...draft.images.map((src) => ({ src, key: src, drop: () => { setRemoved((r) => [...r, src]); setDraft((d) => ({ ...d, images: d.images.filter((x) => x !== src) })); } })),
        ...newFiles.map((f) => ({ src: f.preview, key: f.preview, drop: () => setNewFiles((n) => n.filter((x) => x !== f)) })),
    ];

    return (
        <form className="ad-form" onSubmit={save} noValidate>
            <div className="ad-form-head">
                <h2>{draft.id ? `Edit: ${row.title}` : 'Item baru'}</h2>
                <div className="ad-chips" role="radiogroup" aria-label="Kategori">
                    {CATEGORIES.map((c) => (
                        <label key={c.value} className={`ad-chip ${draft.category === c.value ? 'is-on' : ''}`}>
                            <input type="radio" name="category" value={c.value} checked={draft.category === c.value} onChange={set('category')} />
                            {c.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="ad-grid">
                <Field label="Judul" error={errors.title}>
                    <input value={draft.title} onChange={set('title')} placeholder="DermaCare" />
                </Field>
                <Field label="Label kategori">
                    <input value={draft.category_label ?? ''} onChange={set('category_label')} placeholder={isCert ? 'Certification' : 'AI & Web Dev'} />
                </Field>
            </div>

            {isCert && (
                <div className="ad-grid">
                    <Field label="Penerbit"><input value={draft.issuer ?? ''} onChange={set('issuer')} placeholder="Cisco Networking Academy" /></Field>
                    <Field label="Tanggal"><input value={draft.date_label ?? ''} onChange={set('date_label')} placeholder="Jan 2025" /></Field>
                </div>
            )}

            <Field label="Ringkasan">
                <input value={draft.description ?? ''} onChange={set('description')} placeholder="Satu kalimat tentang proyek ini" />
            </Field>
            <Field label="Deskripsi lengkap (pisah paragraf dengan baris kosong)">
                <textarea rows={5} value={draft.full_desc ?? ''} onChange={set('full_desc')} />
            </Field>

            <Field label={isCert ? 'Foto sertifikat' : 'Foto (pertama = cover)'} error={errors.images}>
                <div className="ad-photos">
                    {photos.map((p, i) => (
                        <div key={p.key} className={`ad-photo ${i === 0 ? 'is-cover' : ''}`}>
                            <img src={p.src} alt="" />
                            {i === 0 && <span>cover</span>}
                            <button type="button" onClick={p.drop} aria-label="Hapus foto">×</button>
                        </div>
                    ))}
                    <label className="ad-upload">
                        <input type="file" accept="image/*" multiple onChange={addFiles} />
                        + Upload
                    </label>
                </div>
            </Field>

            <Field label={draft.category === 'video' ? 'Link YouTube' : 'Link YouTube (opsional)'} error={errors.youtube_url}>
                <div className="ad-yt">
                    <input value={draft.youtube_url ?? ''} onChange={set('youtube_url')} placeholder="https://youtu.be/..." />
                    {ytId && <img src={`https://i.ytimg.com/vi/${ytId}/default.jpg`} alt="Thumbnail YouTube" />}
                </div>
            </Field>

            <Field label="Link" error={errors.links}>
                {draft.links.map((l, i) => (
                    <div key={i} className="ad-link">
                        <input value={l.label} onChange={(e) => setLink(i, 'label', e.target.value)} placeholder="Live App" aria-label="Label link" />
                        <input value={l.url} onChange={(e) => setLink(i, 'url', e.target.value)} placeholder="https://..." aria-label="URL link" />
                        <button type="button" className="ad-btn" onClick={() => setDraft((d) => ({ ...d, links: d.links.filter((_, j) => j !== i) }))} aria-label="Hapus link">×</button>
                    </div>
                ))}
                <button type="button" className="ad-btn" onClick={() => setDraft((d) => ({ ...d, links: [...d.links, { label: '', url: '' }] }))}>+ Tambah link</button>
            </Field>

            <div className="ad-foot">
                <div className="ad-foot-opts">
                    <label>Urutan <input type="number" className="ad-order" value={draft.sort_order} onChange={set('sort_order')} /></label>
                    <label><input type="checkbox" checked={draft.published} onChange={set('published')} /> Tampil di website</label>
                </div>
                <div className="ad-foot-actions">
                    {draft.id && <button type="button" className="ad-btn is-danger" onClick={remove} disabled={busy}>Hapus</button>}
                    <button type="submit" className="ad-btn is-primary" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan'}</button>
                </div>
            </div>
            {message && <p className="ad-error" role="alert">{message}</p>}
        </form>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="ad-field">
            <span className="ad-label">{label}</span>
            {children}
            {error && <span className="ad-error">{error}</span>}
        </div>
    );
}
