// Admin control for "Support Needs" posts shown on the homepage.
// Each post: { id, title, desc, image (optional), method: 'paybill' | 'till', account, till }.
// Clicking a post on the homepage opens /give?project=<id>, which shows the
// church paybill + this post's account number, or this post's Till number.

const BACKEND_URL = '';
const MAX_POSTS = 4;
const BLANK = { id: '', title: '', desc: '', image: '', method: 'paybill', account: '', till: '' };
const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input = 'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

export function buildSupportField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK;
  const uploading = ui.uploading || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const update = (key, value) => setUi({ draft: { ...draft, [key]: value } });
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const url = await uploadImage(file);
      setUi({ uploading: false, draft: { ...draft, image: url } });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
    e.target.value = '';
  };
  const startEdit = (i) => setUi({ editingIndex: i, draft: { ...BLANK, ...items[i] }, error: '' });
  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK, error: '' });
  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };
  const handleSubmit = () => {
    if (!draft.title.trim()) return setUi({ error: 'Please enter what the church needs support for' });
    const isTill = draft.method === 'till';
    if (isTill) {
      if (!/^\d+$/.test(draft.till.trim())) return setUi({ error: 'Please enter the Till number (digits only)' });
    } else if (!draft.account.trim()) {
      return setUi({ error: 'Please enter the account number for this item' });
    }
    const clean = {
      ...draft,
      title: draft.title.trim(),
      desc: draft.desc.trim(),
      method: isTill ? 'till' : 'paybill',
      account: isTill ? '' : draft.account.trim(),
      till: isTill ? draft.till.trim() : '',
    };
    if (editingIndex !== null) {
      onChange(items.map((item, idx) => (idx === editingIndex ? clean : item)));
    } else if (items.length >= MAX_POSTS) {
      return setUi({ error: `Only ${MAX_POSTS} support posts allowed. Delete one first.` });
    } else {
      onChange([...items, { ...clean, id: Date.now().toString(36) }]);
    }
    setUi({ draft: BLANK, editingIndex: null, error: '' });
  };

  const limitReached = items.length >= MAX_POSTS && editingIndex === null;

  const form = limitReached ? (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 text-sm text-brand-muted">
      Maximum of {MAX_POSTS} support posts reached. Edit or delete one to add another.
    </div>
  ) : (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <h3 className="text-sm font-semibold text-brand-fg border-b border-brand-border pb-3">
        {editingIndex !== null ? 'Edit support post' : 'Add support post'}
      </h3>
      <div>
        <label className={label}>What does the church need? <span className="text-red-400">*</span></label>
        <input value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="New church roof" className={input} />
      </div>
      <div>
        <label className={label}>Explanation</label>
        <textarea value={draft.desc} onChange={(e) => update('desc', e.target.value)} rows={4} maxLength={800} placeholder="Explain the need and how the support will be used…" className={input} />
      </div>
      <div>
        <label className={label}>Image (optional)</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {draft.image ? (
            <div className="relative shrink-0">
              <img src={`${BACKEND_URL}${draft.image}`} alt="" className="w-40 h-24 object-contain rounded-lg border border-brand-border bg-black/40" />
              <button type="button" onClick={() => update('image', '')} className="absolute top-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded">Remove</button>
            </div>
          ) : null}
          <label className="flex flex-col items-center justify-center flex-1 min-h-[96px] border border-dashed border-brand-border rounded-lg bg-[#121212] hover:border-brand/50 cursor-pointer px-3 py-4 transition">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
            <span className="text-sm text-brand-fg">{uploading ? 'Uploading…' : 'Upload image'}</span>
          </label>
        </div>
      </div>
      <div>
        <label className={label}>How will people pay? <span className="text-red-400">*</span></label>
        <div className="inline-flex rounded-lg border border-brand-border overflow-hidden">
          {[['paybill', 'Paybill + account'], ['till', 'Till number']].map(([val, text]) => (
            <button
              key={val}
              type="button"
              onClick={() => update('method', val)}
              className={`px-4 py-2 text-sm font-medium transition ${
                (draft.method || 'paybill') === val ? 'bg-brand text-white' : 'bg-[#121212] text-brand-soft hover:text-white'
              }`}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      {draft.method === 'till' ? (
        <div>
          <label className={label}>Till number for this item <span className="text-red-400">*</span></label>
          <input value={draft.till} onChange={(e) => update('till', e.target.value)} inputMode="numeric" placeholder="5123456" className={input} />
          <p className="text-xs text-brand-muted mt-1">Donors will pay via Lipa na M-Pesa → Buy Goods and Services. No account number is needed.</p>
        </div>
      ) : (
        <div>
          <label className={label}>Account number for this item <span className="text-red-400">*</span></label>
          <input value={draft.account} onChange={(e) => update('account', e.target.value)} placeholder="ROOF2026" className={input} />
          <p className="text-xs text-brand-muted mt-1">Donors will see this as the M-Pesa account number, together with the church paybill.</p>
        </div>
      )}
      {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} className="bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
          {editingIndex !== null ? 'Save changes' : 'Add post'}
        </button>
        {editingIndex !== null && (
          <button type="button" onClick={cancelEdit} className="text-sm text-brand-muted hover:text-brand-fg px-3 py-2">Cancel</button>
        )}
      </div>
      <p className="text-xs text-brand-muted">After adding or editing, press Save at the bottom for changes to go live.</p>
    </div>
  );

  const content = items.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Support posts ({items.length}/{MAX_POSTS})</h3>
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
        <table className="w-full text-sm text-left min-w-[520px]">
          <thead>
            <tr className="bg-[#141414]">
              {['Image', 'Need', 'Payment', 'Actions'].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border ${i === 3 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={p.id || i} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 border-b border-brand-border/70">
                  {p.image ? <img src={`${BACKEND_URL}${p.image}`} alt="" className="w-16 h-10 object-cover rounded border border-brand-border" /> : <span className="text-brand-muted text-xs">—</span>}
                </td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg">{p.title}</td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg">{p.method === 'till' ? `Till ${p.till}` : `Account ${p.account}`}</td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-right whitespace-nowrap">
                  <button type="button" onClick={() => startEdit(i)} className="text-brand hover:text-brand-soft text-sm font-medium mr-3">Edit</button>
                  <button type="button" onClick={() => handleDelete(i)} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;

  return { form, content };
}