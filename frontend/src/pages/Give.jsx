import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { useContent } from '../context/ContentContext';

function CopyableRow({ label, value, helper }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be blocked; value stays visible for manual copy
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-800 last:border-0">
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="mt-1 font-semibold text-lg text-white break-all">{value || '—'}</div>
        {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
      </div>
      {value && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/80 hover:border-brand hover:text-brand px-3 py-2 text-sm text-slate-300 transition"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function Give() {
  const { content, loading } = useContent();
  const [searchParams] = useSearchParams();
  if (loading) return null;

  const projectId = searchParams.get('project');
  const project = projectId
    ? (content?.home?.supportPosts || []).find((p, i) => String(p.id || i) === projectId)
    : null;

  const give = content?.give || {};
  const title = give.title || 'Give';
  const subtitle = give.subtitle || 'Support the work of the church through M-Pesa.';
  const note = give.note || 'Thank you for your generosity.';
  const paybill = give.mpesaPaybill || '';
  const account = project?.account || give.mpesaAccountNumber || '';
  const isTill = project?.method === 'till';
  const till = project?.till || '';

  return (
    <div className="min-h-[70vh] bg-gray-900">
      <div className="max-w-xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{title}</h1>
          <p className="text-lg text-slate-400">{subtitle}</p>
        </div>

        {project && (
          <div className="mb-6 rounded-2xl border border-indigo-900 bg-brand-dark overflow-hidden">
            {project.image && (
              <img src={project.image} alt={project.title} className="block w-full h-auto max-h-64 object-contain bg-black/40" />
            )}
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-soft mb-1">You are giving towards</p>
              <h2 className="text-xl font-semibold text-white">{project.title}</h2>
              {project.desc && <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">{project.desc}</p>}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-700 bg-gray-950/60 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-brand to-brand-red px-6 py-5">
            <h2 className="text-white font-bold text-lg tracking-tight">{isTill ? 'M-Pesa Till (Buy Goods)' : 'M-Pesa Paybill'}</h2>
            <p className="text-brand-soft text-xs mt-1">
              Open M-Pesa on your phone, then copy the details below.
            </p>
          </div>

          <div className="px-6 py-2">
            {isTill ? (
              <CopyableRow
                label="Till number"
                value={till}
                helper="Lipa na M-Pesa → Buy Goods and Services → Till number"
              />
            ) : (
              <>
                <CopyableRow
                  label="Paybill number"
                  value={paybill}
                  helper="Lipa na M-Pesa → Paybill → Business number"
                />
                <CopyableRow
                  label="Account number"
                  value={account}
                  helper={project ? `Use this account so your gift goes to: ${project.title}` : 'Enter this as the account number after the paybill'}
                />
              </>
            )}
          </div>

          <div className="px-6 pb-6 pt-2">
            {isTill ? (
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>
                  Go to <span className="text-slate-200">M-Pesa</span> → Lipa na M-Pesa → Buy Goods and Services
                </li>
                <li>
                  Paste the <span className="text-slate-200">Till number</span>
                </li>
                <li>Enter the amount and your M-Pesa PIN</li>
              </ol>
            ) : (
              <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
                <li>
                  Go to <span className="text-slate-200">M-Pesa</span> → Lipa na M-Pesa → Paybill
                </li>
                <li>
                  Paste the <span className="text-slate-200">Paybill number</span>
                </li>
                <li>
                  Paste the <span className="text-slate-200">Account number</span>
                </li>
                <li>Enter the amount and your M-Pesa PIN</li>
              </ol>
            )}
          </div>
        </div>

        {note && <p className="text-center text-sm text-slate-500 mt-8">{note}</p>}
      </div>
    </div>
  );
}