const BACKEND_URL = '';
const MAX_POSTERS = 2;
const BLANK = { image: '', title: '' };
const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input = 'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

export function buildPostersField(items, onChange, ui, setUi, uploadImage) {
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
    if (!draft.image) {
      setUi({ error: 'Please upload a poster image' });
      return;
    }
    if (editingIndex !== null) onChange(items.map((item, idx) => (idx === editingIndex ? draft : item)));
    else if (items.length >= MAX_POSTERS) {
      setUi({ error: `Only ${MAX_POSTERS} posters allowed. Delete one first.` });
      return;
    } else onChange([...items, draft]);
    setUi({ draft: BLANK, editingIndex: null, error: '' });
  };

  const limitReached = items.length >= MAX_POSTERS && editingIndex === null;
  const form = limitReached ? (<div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 text-sm text-brand-muted">Maximum of {MAX_POSTERS} posters reached. Edit or delete one to add another.</div>) : (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <h3 className="text-sm font-semibold text-brand-fg border-b border-brand-border pb-3">
        {editingIndex !== null ? 'Edit poster' : 'Add poster'}
      </h3>
      <div>
        <label className={label}>Poster image <span className="text-red-400">*</span></label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {draft.image ? (
            <div className="relative shrink-0">
              <img src={`${BACKEND_URL}${draft.image}`} alt="" className="w-40 h-24 object-contain rounded-lg border border-brand-border bg-black/40" />
              <button type="button" onClick={() => update('image', '')} className="absolute top-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded">Remove</button>
            </div>
          ) : null}
          <label className="flex flex-col items-center justify-center flex-1 min-h-[96px] border border-dashed border-brand-border rounded-lg bg-[#121212] hover:border-brand/50 cursor-pointer px-3 py-4 transition">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
            <span className="text-sm text-brand-fg">{uploading ? 'Uploading…' : 'Upload poster'}</span>
            <span className="text-xs text-brand-muted mt-1">Homepage card (max 2)</span>
          </label>
        </div>
      </div>
      <div>
        <label className={label}>Caption (optional)</label>
        <input value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="Year of Open Doors" className={input} />
      </div>
      {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} className="bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
          {editingIndex !== null ? 'Save changes' : 'Add poster'}
        </button>
        {editingIndex !== null && (
          <button type="button" onClick={cancelEdit} className="text-sm text-brand-muted hover:text-brand-fg px-3 py-2">Cancel</button>
        )}
      </div>
    </div>
  );

  const content =
    items.length > 0 ? (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Posters ({items.length}/{MAX_POSTERS})</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="bg-[#141414]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Preview</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Caption</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 border-b border-brand-border/70">
                    {p.image ? (
                      <img src={`${BACKEND_URL}${p.image}`} alt="" className="w-16 h-10 object-cover rounded border border-brand-border" />
                    ) : (
                      <span className="text-brand-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg">{p.title || '—'}</td>
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