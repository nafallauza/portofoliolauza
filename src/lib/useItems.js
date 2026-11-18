import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { rowToItem } from './items';

// One request per page load, shared by Hero, Projects and Certificates
let request;
const loadItems = () => (request ??= !supabase
    ? Promise.reject(new Error('Supabase env is not set'))
    : supabase
    .from('projects')
    .select('*')
    .order('sort_order')
    .order('created_at')
    .then(({ data, error }) => {
        if (error) throw error;
        return data.map(rowToItem);
    }));

export function useItems() {
    const [state, setState] = useState({ items: [], status: 'loading' });
    useEffect(() => {
        let alive = true;
        loadItems()
            .then((items) => alive && setState({ items, status: 'ready' }))
            .catch(() => alive && setState({ items: [], status: 'error' }));
        return () => { alive = false; };
    }, []);
    return {
        projects: state.items.filter((i) => i.category !== 'certificate'),
        certificates: state.items.filter((i) => i.category === 'certificate'),
        status: state.status,
    };
}
