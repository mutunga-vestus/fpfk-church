import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import { adminSchema } from '../../config/adminSchema';
import { buildEventsField } from './EventsManager';
import { buildMinistriesField } from './MinistriesManager';
import { buildPostersField } from './PostersManager';
import { buildNoticeField } from './NoticeManager';
import { buildSupportField } from './SupportManager';
import { buildFeaturesField } from './FeaturesManager';
import AdminMessages from './AdminMessages';
import AdminGiving from './AdminGiving';
import AdminEventRegistrations from './AdminEventRegistrations';
import fpfkLogo from '../../assets/fpfk-logo.png';
import { buildLeadersField } from './LeadersManager';

const BACKEND_URL = '';

// Builds the upload control (form) and the current-image preview (content)
// for an image field, sharing ephemeral upload state lifted from the parent.
function buildImageField(field, value, onChange, ui, setUi, uploadImage) {
  const uploading = ui.uploading || false;
  const error = ui.error || '';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const url = await uploadImage(file);
      onChange(url);
      setUi({ uploading: false });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
  };

  const form = (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-brand-border rounded-xl bg-brand-dark/40 hover:border-brand/50 hover:bg-brand/5 transition cursor-pointer px-4 py-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="sr-only"
        />
        {uploading ? (
          <span className="text-sm text-brand-muted">Uploading…</span>
        ) : (
          <>
            <span className="text-2xl mb-2 opacity-70">📷</span>
            <span className="text-sm font-medium text-brand-fg">Click to upload image</span>
            <span className="text-xs text-brand-muted mt-1">PNG, JPG, WEBP · max recommended 2MB</span>
          </>
        )}
      </label>
      {error && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );

  const content = value ? (
    <div className="space-y-3">
      <div className="relative inline-block">
        <img
          src={`${BACKEND_URL}${value}`}
          alt="Preview"
          className="w-full max-w-full sm:max-w-sm h-40 sm:h-48 object-cover rounded-xl border border-brand-border"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange('')}
        className="text-sm text-red-400 hover:text-red-300 hover:underline"
      >
        Remove image
      </button>
    </div>
  ) : null;

  return { form, content };
}

// Builds the add/edit form and the existing-items list for a list field,
// sharing ephemeral draft/editing state lifted from the parent.
function buildListField(field, items, onChange, ui, setUi) {
  const blank = Object.fromEntries(field.itemFields.map((f) => [f.key, '']));
  const draft = ui.draft || blank;
  const editingIndex = ui.editingIndex ?? null;
  const error = ui.error || '';

  const updateDraft = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const startEdit = (i) => setUi({ editingIndex: i, draft: items[i], error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: blank, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    const hasContent = Object.values(draft).some((v) => v.trim());
    if (!hasContent) {
      setUi({ error: 'Fill in at least one field before saving.' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: blank, editingIndex: null, error: '' });
  };

  const form = (
    <div className="border border-brand-border bg-brand-dark/50 rounded-2xl p-5 sm:p-6 space-y-4">
      <h4 className="text-base font-semibold text-brand-fg">
        {editingIndex !== null ? `Edit ${field.label.replace(/s$/, '')}` : `Add New ${field.label.replace(/s$/, '')}`}
      </h4>
      {field.itemFields.map((sf) => (
        <div key={sf.key}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">{sf.label}</label>
          <input
            value={draft[sf.key] || ''}
            onChange={(e) => updateDraft(sf.key, e.target.value)}
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-brand hover:bg-brand-deep text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          {editingIndex !== null ? 'Save Changes' : `+ Add ${field.label.replace(/s$/, '')}`}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm text-brand-muted hover:underline self-start sm:self-center"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  const content = items.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {field.label} ({items.length})
      </h3>
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
        <table className="w-full text-sm text-left min-w-[480px]">
          <thead>
            <tr className="bg-[#141414]">
              {field.itemFields.map((sf) => (
                <th key={sf.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">
                  {sf.label}
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                {field.itemFields.map((sf) => (
                  <td key={sf.key} className="px-4 py-3 border-b border-brand-border/70 text-brand-fg max-w-[200px] truncate">
                    {item[sf.key] || '—'}
                  </td>
                ))}
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

export default function AdminDashboard() {
  const { content, loading, savePage, uploadImage, uploadMedia } = useContent();
  const [activePage, setActivePage] = useState('home');
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('');
  const [fieldUi, setFieldUi] = useState({});
  const navigate = useNavigate();

  if (loading || !content) return <div className="p-10 text-center text-brand-fg min-h-screen bg-brand-dark">Loading...</div>;

  const currentDraft = draft ?? content[activePage];
  const schema = adminSchema[activePage];

  const selectPage = (page) => {
    setActivePage(page);
    setDraft(null);
    setStatus('');
    setFieldUi({});
  };

  const updateField = (key, value) => {
    setDraft({ ...currentDraft, [key]: value });
  };

  const getUi = (key) => fieldUi[key] || {};
  const setUi = (key, patch) =>
    setFieldUi((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      await savePage(activePage, currentDraft);
      setStatus('Saved!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  const tabClass = (key) =>
    `whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activePage === key
        ? 'bg-brand/20 text-brand-light shadow-sm'
        : 'text-brand-soft hover:text-white hover:bg-brand-border/10'
    }`;

  // Split every field into its editable "form" piece and its read-only
  // "updated content" piece, so the page renders: forms -> Save button -> content.
  const formSections = [];
  const contentSections = [];

  if (schema) {
    schema.fields.forEach((field) => {
      const key = field.key;
      const label = (
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">{field.label}</label>
      );

      if (field.type === 'text') {
        formSections.push(
          <div key={key}>
            {label}
            <input
              value={currentDraft[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm text-brand-fg placeholder:text-brand-muted/70 transition"
            />
          </div>
        );
        return;
      }

      if (field.type === 'textarea') {
        formSections.push(
          <div key={key}>
            {label}
            <textarea
              value={currentDraft[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
              rows={4}
              className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand text-sm text-brand-fg placeholder:text-brand-muted/70 transition"
            />
          </div>
        );
        return;
      }

      if (field.type === 'image') {
        const { form, content } = buildImageField(
          field,
          currentDraft[key],
          (url) => updateField(key, url),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'list') {
        const { form, content } = buildListField(
          field,
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch)
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'features') {
  const { form, content: fieldContent } = buildFeaturesField(
    currentDraft[key] || [],
    (items) => updateField(key, items),
    getUi(key),
    (patch) => setUi(key, patch)
  );
  formSections.push(
    <div key={key}>
      {label}
      {form}
    </div>
  );
  if (fieldContent) {
    contentSections.push(
      <div key={`${key}-content`}>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
          Current {field.label}
        </label>
        {fieldContent}
      </div>
    );
  }
  return;
}

      if (field.type === 'events') {
        const { form, content } = buildEventsField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'ministries') {
        const { form, content } = buildMinistriesField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadMedia
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }
            if (field.type === 'leaders') {
        const { form, content: fieldContent } = buildLeadersField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (fieldContent) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {fieldContent}
            </div>
          );
        }
        return;
      }

      if (field.type === 'support') {
        const { form, content } = buildSupportField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'notice') {
        const { form } = buildNoticeField(currentDraft[key], (val) => updateField(key, val));
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        return;
      }

      if (field.type === 'posters') {
        const { form, content } = buildPostersField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-2">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Top bar */}
      <div className="bg-brand-dark sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={fpfkLogo}
                alt="FPFK Church Kitengela logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shrink-0"
              />
              <span className="font-semibold text-white text-sm sm:text-base truncate">Admin Panel</span>
            </div>
            <button
              onClick={logout}
              className="text-xs sm:text-sm text-brand-soft hover:text-white shrink-0 ml-2"
            >
              Log Out
            </button>
          </div>

          {/* Dropdown nav — small screens only */}
          <div className="sm:hidden pb-3">
            <select
              value={activePage}
              onChange={(e) => selectPage(e.target.value)}
              className="w-full bg-brand-border/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-soft/50"
            >
              {Object.entries(adminSchema).map(([key, s]) => (
                <option key={key} value={key} className="text-brand-fg">
                  {s.label}
                </option>
              ))}
              <option value="messages" className="text-brand-fg">
                Messages
              </option>
              <option value="giving" className="text-brand-fg">
                Giving Records
              </option>
              <option value="registrations" className="text-brand-fg">
                Event Registrations
              </option>
            </select>
          </div>

          {/* Button nav — sm screens and up */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-3">
            {Object.entries(adminSchema).map(([key, s]) => (
              <button key={key} onClick={() => selectPage(key)} className={tabClass(key)}>
                {s.label}
              </button>
            ))}
            <span className="w-px h-5 bg-brand-border/20 mx-1 shrink-0" />
            <button onClick={() => selectPage('messages')} className={tabClass('messages')}>
              Messages
            </button>
            <button onClick={() => selectPage('giving')} className={tabClass('giving')}>
              Giving Records
            </button>
            <button onClick={() => selectPage('registrations')} className={tabClass('registrations')}>
              Event Registrations
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {activePage === 'messages' ? (
          <AdminMessages />
        ) : activePage === 'giving' ? (
          <AdminGiving />
        ) : activePage === 'registrations' ? (
          <AdminEventRegistrations />
        ) : (
          <div className="rounded-xl border border-brand-border bg-[#0f0f0f] shadow-sm p-5 sm:p-8 space-y-6">
            <h1 className="text-lg sm:text-xl font-semibold text-brand-fg tracking-tight">Update {schema.label} Content</h1>

            {formSections}

            <div className="space-y-2">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-brand hover:bg-brand-deep text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition shadow-sm shadow-brand/20"
              >
                Save Changes
              </button>
              {status && <p className="text-sm text-brand-muted">{status}</p>}
            </div>

            {contentSections.length > 0 && (
              <div className="pt-4 border-t border-brand-border space-y-6">
                {contentSections}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}