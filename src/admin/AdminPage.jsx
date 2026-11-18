import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ItemForm, { CATEGORIES } from './ItemForm';
import './admin.css';

export default function AdminPage() {
    const [session, setSession] = useState(undefined);

    useEffect(() => {
        document.title = 'Admin — Lauza';
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => data.subscription.unsubscribe();
    }, []);

    if (!supabase) return <div className="ad-center"><p className="ad-error">Supabase belum dikonfigurasi (cek VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY).</p></div>;
    if (session === undefined) return null;
    return session ? <Dashboard /> : <Login />;
}

function Login() {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setBusy(true);
        const { error: err } = await supabase.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
        setBusy(false);
        if (err) setError(err.status === 400 ? 'Email atau password salah.' : `Gagal masuk: ${err.message}`);
    };

    return (
        <div className="ad-center">
            <form className="ad-login" onSubmit={submit}>
                <p className="ad-brand">Lauza<span>.</span> admin</p>
                <p className="ad-muted">Masuk untuk mengelola portofolio</p>
                <label className="ad-field"><span className="ad-label">Email</span><input name="email" type="email" autoComplete="username" required /></label>
                <label className="ad-field"><span className="ad-label">Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
                {error && <p className="ad-error" role="alert">{error}</p>}
                <button type="submit" className="ad-btn is-primary" disabled={busy}>{busy ? 'Masuk…' : 'Masuk'}</button>
            </form>
        </div>
    );
}

function Dashboard() {
    const [rows, setRows] = useState([]);
    const [loadError, setLoadError] = useState('');
    const [selected, setSelected] = useState(null); // row id, 'new', or null
    const [version, setVersion] = useState(0); // bump to reset the form to the saved row

    const load = useCallback(async () => {
        const { data, error } = await supabase.from('projects').select('*').order('sort_order').order('created_at');
        if (error) return setLoadError(`Gagal memuat data: ${error.message}`);
        setLoadError('');
        setRows(data);
    }, []);

    useEffect(() => { load(); }, [load]);

    const row = rows.find((r) => r.id === selected);

    return (
        <div className="ad-shell">
            <header className="ad-top">
                <span className="ad-brand">Lauza<span>.</span> admin</span>
                <div className="ad-top-actions">
                    <a className="ad-btn" href="/" target="_blank" rel="noreferrer">Lihat website ↗</a>
                    <button type="button" className="ad-btn" onClick={() => supabase.auth.signOut()}>Logout</button>
                </div>
            </header>

            <div className="ad-body">
                <aside className="ad-list">
                    <button type="button" className="ad-btn is-primary ad-add" onClick={() => setSelected('new')}>+ Tambah item</button>
                    {loadError && <p className="ad-error">{loadError}</p>}
                    {CATEGORIES.map((c) => {
                        const group = rows.filter((r) => r.category === c.value);
                        return (
                            <section key={c.value}>
                                <p className="ad-group">{c.label} · {group.length}</p>
                                {group.length === 0 && <p className="ad-muted ad-empty">Belum ada item</p>}
                                {group.map((r) => (
                                    <button key={r.id} type="button" className={`ad-row ${r.id === selected ? 'is-on' : ''}`} onClick={() => setSelected(r.id)}>
                                        <span className="ad-thumb">{r.images?.[0] && <img src={r.images[0]} alt="" />}</span>
                                        <span className="ad-row-text">
                                            <span>{r.title}</span>
                                            <span className="ad-muted">{r.category_label || r.date_label}{!r.published && <span className="ad-draft">draft</span>}</span>
                                        </span>
                                    </button>
                                ))}
                            </section>
                        );
                    })}
                </aside>

                <main className="ad-main">
                    {selected === null ? (
                        <p className="ad-muted ad-placeholder">Pilih item di kiri atau tambah item baru.</p>
                    ) : (
                        <ItemForm
                            key={`${selected}:${version}`}
                            row={selected === 'new' ? null : row}
                            onSaved={async (saved) => { await load(); setSelected(saved.id); setVersion((v) => v + 1); }}
                            onDeleted={async () => { await load(); setSelected(null); }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
