// Admin control for the homepage announcement (shown below Ministries).
// The announcement is stored as { message, expiresAt (ISO), postedAt (ISO) }
// inside the "home" page content. It is hidden automatically once expiresAt passes.

const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input = 'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

const PRESETS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
];

const addDays = (days) => new Date(Date.now() + days * 86400000).toISOString();

// ISO string -> value for <input type="datetime-local"> (local time)
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildNoticeField(value, onChange) {
  const notice = value || {};
  const message = notice.message || '';
  const expiresAt = notice.expiresAt || '';
  const expired = expiresAt && new Date(expiresAt).getTime() <= Date.now();

  const setMessage = (text) => {
    if (!text.trim() && !text) {
      onChange({ ...notice, message: '' });
      return;
    }
    onChange({
      ...notice,
      message: text,
      // First time a message is typed: default to expiring in 1 week and stamp the post time.
      expiresAt: notice.expiresAt || addDays(7),
      postedAt: notice.postedAt || new Date().toISOString(),
    });
  };
  const setExpiry = (iso) => onChange({ ...notice, expiresAt: iso });
  const clear = () => onChange({});

  const form = (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <div>
        <label className={label}>Announcement message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={600}
          placeholder="e.g. Join us this Saturday for the youth outreach at 10:00 AM."
          className={input}
        />
        <p className="text-xs text-brand-muted mt-1">{message.length}/600</p>
      </div>

      <div>
        <label className={label}>Expires on</label>
        <input
          type="datetime-local"
          value={toLocalInput(expiresAt)}
          onChange={(e) => setExpiry(e.target.value ? new Date(e.target.value).toISOString() : '')}
          className={input}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setExpiry(addDays(p.days))}
              className="text-xs px-3 py-1.5 rounded-full border border-brand-border text-brand-soft hover:text-white hover:border-brand/60 transition"
            >
              {p.label} from now
            </button>
          ))}
        </div>
      </div>

      {message.trim() && (
        <p className={`text-sm rounded-lg px-3 py-2 border ${
          expired || !expiresAt
            ? 'text-amber-300 bg-amber-950/30 border-amber-900/50'
            : 'text-emerald-300 bg-emerald-950/30 border-emerald-900/50'
        }`}>
          {!expiresAt
            ? 'Set an expiry date, otherwise this will not show.'
            : expired
              ? 'This announcement has expired and is not showing. Pick a new expiry date to show it again.'
              : `Visible on the homepage until ${new Date(expiresAt).toLocaleString()}.`}
        </p>
      )}

      <p className="text-xs text-brand-muted">Remember to press Save for changes to go live.</p>

      {(message || expiresAt) && (
        <button type="button" onClick={clear} className="text-sm text-red-400 hover:text-red-300 font-medium">
          Remove announcement
        </button>
      )}
    </div>
  );

  return { form, content: null };
}