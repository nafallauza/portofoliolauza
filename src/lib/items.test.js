import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubeIdFrom, rowToItem, validateItem, validateImageFile, MAX_IMAGE_BYTES } from './items.js';

const baseRow = { id: 1, category: 'website', title: 'DermaCare', images: ['https://x/a.webp'], links: [] };

test('youtubeIdFrom accepts common forms', () => {
    for (const u of [
        'https://youtu.be/7ViRwbl1_Ro?si=QVfjckbuJdv2t3xP',
        'https://www.youtube.com/watch?v=7ViRwbl1_Ro&t=30s',
        'https://m.youtube.com/watch?v=7ViRwbl1_Ro',
        'https://youtube.com/shorts/7ViRwbl1_Ro',
        'https://www.youtube.com/embed/7ViRwbl1_Ro',
    ]) assert.equal(youtubeIdFrom(u), '7ViRwbl1_Ro', u);
});

test('youtubeIdFrom rejects others', () => {
    for (const u of ['', null, 'https://vimeo.com/123', 'https://youtu.be/', 'not a url', 'https://evil.com/watch?v=7ViRwbl1_Ro'])
        assert.equal(youtubeIdFrom(u), null, String(u));
});

test('rowToItem: empty full_desc leaves fullDesc undefined', () => {
    assert.equal(rowToItem({ ...baseRow, full_desc: '' }).fullDesc, undefined);
    assert.deepEqual(rowToItem({ ...baseRow, full_desc: 'a\n\n b \n\n\nc' }).fullDesc, ['a', 'b', 'c']);
});

test('rowToItem: cover falls back to youtube thumbnail', () => {
    const item = rowToItem({ ...baseRow, images: [], youtube_url: 'https://youtu.be/7ViRwbl1_Ro' });
    assert.equal(item.imageSrc, 'https://i.ytimg.com/vi/7ViRwbl1_Ro/hqdefault.jpg');
    assert.equal(item.youtubeId, '7ViRwbl1_Ro');
});

test('rowToItem: certificate links to its image', () => {
    const item = rowToItem({ ...baseRow, category: 'certificate', issuer: 'Cisco', date_label: 'Jan 2025' });
    assert.equal(item.link, 'https://x/a.webp');
    assert.equal(item.date, 'Jan 2025');
});

test('validateItem rules', () => {
    assert.ok(validateItem({ category: 'website', title: ' ', links: [] }).title);
    assert.ok(validateItem({ category: 'video', title: 'x', youtube_url: '', links: [] }).youtube_url);
    assert.ok(validateItem({ category: 'website', title: 'x', youtube_url: 'https://vimeo.com/1', links: [] }).youtube_url);
    assert.ok(validateItem({ category: 'website', title: 'x', links: [{ label: 'a', url: 'javascript:alert(1)' }] }).links);
    assert.deepEqual(validateItem({ category: 'website', title: 'x', links: [{ label: 'a', url: 'https://a.com' }] }), {});
});

test('validateImageFile', () => {
    assert.equal(validateImageFile({ type: 'image/png', size: 1000 }), null);
    assert.ok(validateImageFile({ type: 'application/pdf', size: 1000 }));
    assert.ok(validateImageFile({ type: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 }));
});
