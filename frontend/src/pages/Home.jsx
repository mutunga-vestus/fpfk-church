import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { slugify } from '../utils/slugify';

const BACKEND_URL = '';

function MinistryCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="relative h-[420px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((m, i) => (
        <Link
          key={i}
          to={`/ministries/${slugify(m.title) || i}`}
          aria-hidden={i !== index}
          tabIndex={i === index ? 0 : -1}
          className={`group absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div
            className={`relative w-full h-full flex items-end ${
              !m.image ? 'bg-gradient-to-br from-brand-dark via-gray-900 to-brand-dark' : ''
            }`}
            style={
              m.image
                ? {
                    backgroundImage: `url(${BACKEND_URL}${m.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="relative z-10 p-8 md:p-14 text-white max-w-2xl">
              <h3 className="text-3xl md:text-5xl font-bold mb-4">{m.title}</h3>
              {m.desc && (
                <p className="text-lg md:text-xl text-brand-light mb-2">{m.desc}</p>
              )}
              <span className="inline-block mt-4 font-semibold text-white group-hover:underline underline-offset-4">
                Learn more &rarr;
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PosterCards({ items }) {
  const posters = (items || []).filter((p) => p && p.image).slice(0, 2);
  if (posters.length === 0) return null;

  return (
    <div className="relative z-0 bg-gray-900 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 md:gap-6">
          {posters.map((p, i) => (
            <a
              key={i}
              href={`${BACKEND_URL}${p.image}`}
              className="group flex flex-col w-fit max-w-full lg:max-w-[calc(50%-0.75rem)] rounded-2xl overflow-hidden border border-gray-800 bg-brand-dark shadow-lg hover:shadow-2xl transition-shadow"
            >
              {p.title && (
                <div className="w-0 min-w-full bg-gray-900 px-4 py-3 text-center">
                  <p className="text-base md:text-lg font-semibold text-brand-fg">{p.title}</p>
                </div>
              )}
              <img
                src={`${BACKEND_URL}${p.image}`}
                alt={p.title || 'Poster'}
                className="block w-auto h-auto max-w-full max-h-[440px] transition group-hover:opacity-90"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ notice }) {
  const [now, setNow] = useState(() => Date.now());

  // Re-check every 30s so an open page hides the announcement when it expires.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const message = notice?.message?.trim();
  const expiresAt = notice?.expiresAt ? new Date(notice.expiresAt).getTime() : 0;
  if (!message || !expiresAt || expiresAt <= now) return null;

  return (
    <div className="py-10 bg-gray-900">
      <div className="max-w-3xl mx-auto px-6 flex justify-center">
        <div className="relative inline-block max-w-xl">
          <div className="rounded-2xl rounded-bl-sm bg-brand text-white px-5 py-4 shadow-lg">
            <span className="inline-block mb-2 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
              &#128226; Announcement
            </span>
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-line">{message}</p>
            <p className="mt-2 text-xs text-white/70">
              Until {new Date(expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className="absolute -bottom-2 left-4 h-4 w-4 rotate-45 bg-brand rounded-sm" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function SupportCards({ items }) {
  const posts = (items || []).filter((p) => p && p.title && (p.method === 'till' ? p.till : p.account)).slice(0, 4);
  if (posts.length === 0) return null;

  return (
    <div className="py-12 md:py-16 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-brand-fg">Support the Church</h2>
          <p className="text-gray-400 text-lg">Partner with us in meeting these needs.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {posts.map((p, i) => (
            <Link
              key={p.id || i}
              to={`/give?project=${encodeURIComponent(p.id || i)}`}
              className="group flex flex-col w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm rounded-2xl overflow-hidden border border-gray-800 bg-brand-dark shadow-lg hover:shadow-2xl hover:border-brand transition"
            >
              {p.image && (
                <div className="bg-black/40 flex items-center justify-center">
                  <img src={`${BACKEND_URL}${p.image}`} alt={p.title} className="block w-full h-auto max-h-64 object-contain" />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
                {p.desc && <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line mb-4 line-clamp-4">{p.desc}</p>}
                <span className="mt-auto inline-block font-semibold text-brand-light group-hover:underline underline-offset-4">
                  Give towards this &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { content, loading } = useContent();
  if (loading) return null;
  const { heroImage, heroTitle, heroSubtitle, ctaPrimary, ctaSecondary, features } = content.home;
  const ministries = content.ministries || {};
  const posters = content.home.posters || [];

  const heroStyle = heroImage
    ? {
        backgroundImage: `url(${BACKEND_URL}${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div>
      <div
        className={`relative h-screen flex items-center justify-center text-white overflow-hidden ${
          !heroImage ? 'bg-gradient-to-br from-brand-dark via-gray-900 to-brand-dark' : ''
        }`}
        style={heroStyle}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="text-2xl md:text-3xl mb-10 text-brand-light">{heroSubtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/connect"
              className="bg-gray-900 text-brand-deep px-10 py-4 rounded-full font-semibold text-lg hover:bg-brand/10 transition-all inline-block"
            >
              {ctaPrimary}
            </Link>
            <Link
              to="/sermons"
              className="border border-white/70 hover:bg-gray-900/10 px-10 py-4 rounded-full font-semibold text-lg transition-all"
            >
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      <PosterCards items={posters} />

      <div className="py-16 md:py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-brand-fg">Join Us This Week</h2>
            <p className="text-gray-400 text-lg">Everyone is welcome — come as you are.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-brand-dark border border-indigo-900 p-6 md:p-8 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-soft mb-4">
                Sunday Services
              </h3>
              <ul className="space-y-3 text-lg text-white">
                <li className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span>First Service</span>
                  <span>Youth Service</span>
                  <span className="font-semibold">6:00 AM to 8:00 AM</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span>Second Service</span>
                  <span>Main Service</span>
                  <span className="font-semibold">8:00 AM to 1:00 PM</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span>Third Service</span>
                  <span>Evening Service</span>
                  <span className="font-semibold">3:00 PM to 5:00 PM</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-brand-dark border border-indigo-900 p-6 md:p-8 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-soft mb-4">
                Weekly Services
              </h3>
              <ul className="space-y-3 text-lg text-white">
                <li className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span>Monday - Friday</span>
                  <span>Morning Glory</span>
                  <span className="font-semibold">4:00 AM to 6:00 AM</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span>Monday - Friday</span>
                  <span>Grace Hour</span>
                  <span className="font-semibold">12:00 Noon to 1:45 PM</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span>Friday</span>
                  <span>Mkesha 🔥</span>
                  <span className="font-semibold">2100 till dawn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {features && features.length > 0 && (
        <div className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <div
              className={`grid gap-8 ${
                features.length === 1
                  ? 'md:grid-cols-1 max-w-2xl mx-auto'
                  : features.length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3'
              }`}
            >
              {features.slice(0, 10).map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-800 bg-brand-dark p-6 md:p-8 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-lg md:text-xl text-white leading-relaxed whitespace-pre-line italic">
                    {f.text || f.title}
                  </p>
                  {(f.reference || f.desc) && (
                    <p className="mt-4 text-sm font-semibold text-white tracking-wide">
                      — {f.reference || f.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {ministries.items && ministries.items.length > 0 && (
        <div className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-3">
              {ministries.title || 'Our Ministries'}
            </h2>
            {ministries.subtitle && (
              <p className="text-center text-lg text-gray-300 mb-12">
                {ministries.subtitle}
              </p>
            )}

            <MinistryCarousel items={ministries.items} />

            <div className="text-center mt-10">
              <Link
                to="/ministries"
                className="inline-block text-brand font-semibold hover:underline underline-offset-4"
              >
                View all ministries &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      <AnnouncementCard notice={content.home.notice} />

      <SupportCards items={content.home.supportPosts} />
    </div>
  );
}
