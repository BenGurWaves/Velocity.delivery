'use client';

import { useEffect, useState } from 'react';

interface Audit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  numericValue?: number;
  numericUnit?: string;
  displayValue?: string;
}

interface Category {
  title: string;
  score: number | null;
  auditRefs: Array<{ id: string; weight: number; group?: string; acronym?: string }>;
}

interface LighthouseData {
  requestedUrl: string;
  fetchTime: string;
  lighthouseVersion: string;
  categories: {
    performance?: Category;
    accessibility?: Category;
    'best-practices'?: Category;
    seo?: Category;
  };
  audits: Record<string, Audit>;
}

const getScoreColor = (score: number | null, displayMode: string): string => {
  if (score === null) return 'text-gray-500';
  if (displayMode === 'binary') {
    return score === 1 ? 'text-emerald-400' : 'text-rose-500';
  }
  if (score >= 0.9) return 'text-emerald-400';
  if (score >= 0.5) return 'text-amber-400';
  return 'text-rose-500';
};

const formatScore = (score: number | null, displayMode: string): string => {
  if (score === null) return 'N/A';
  if (displayMode === 'binary') {
    return score === 1 ? 'Pass' : 'Fail';
  }
  return Math.round(score * 100).toString();
};

const ScoreRing = ({ score, size = 80 }: { score: number | null; size?: number }) => {
  const percentage = score !== null ? Math.round(score * 100) : 0;
  const circumference = 2 * Math.PI * ((size - 8) / 2);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let strokeColor = '#ef4444';
  if (score !== null) {
    if (score >= 0.9) strokeColor = '#34d399';
    else if (score >= 0.5) strokeColor = '#fbbf24';
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-atelier-dark"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - 8) / 2}
          stroke={strokeColor}
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-serif text-lg ${getScoreColor(score, 'numeric')}`}>
          {score !== null ? percentage : '?'}
        </span>
      </div>
    </div>
  );
};

const AuditItem = ({ audit, isPass }: { audit: Audit; isPass: boolean }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-b border-atelier-dark/50 last:border-b-0 transition-all duration-300 ${
        isPass ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-4 px-4 flex items-center justify-between hover:bg-atelier-dark/30 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              isPass ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          <span className="font-sans text-sm text-atelier-cream/90">{audit.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {audit.displayValue && (
            <span className="text-xs text-atelier-cream-muted font-sans">{audit.displayValue}</span>
          )}
          <span
            className={`font-serif text-sm ${getScoreColor(
              audit.score,
              audit.scoreDisplayMode
            )}`}
          >
            {formatScore(audit.score, audit.scoreDisplayMode)}
          </span>
          <svg
            className={`w-4 h-4 text-atelier-cream-muted transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pl-11">
          <p className="text-sm text-atelier-cream-muted leading-relaxed font-sans">
            {audit.description}
          </p>
        </div>
      )}
    </div>
  );
};

const CategorySection = ({
  title,
  category,
  audits,
}: {
  title: string;
  category: Category;
  audits: Record<string, Audit>;
}) => {
  const weightedAudits = category.auditRefs
    .filter((ref) => ref.weight > 0 && audits[ref.id])
    .map((ref) => ({ ...audits[ref.id], weight: ref.weight, acronym: ref.acronym }));

  const otherAudits = category.auditRefs
    .filter((ref) => ref.weight === 0 && audits[ref.id] && audits[ref.id].score !== null)
    .map((ref) => audits[ref.id]);

  const passAudits = weightedAudits.filter((a) => a.score !== null && a.score >= 0.9);
  const failAudits = weightedAudits.filter((a) => a.score === null || a.score < 0.9);

  const getBorderClass = (score: number | null, displayMode: string): string => {
    if (score === null) return 'border-gray-500/20';
    if (displayMode === 'binary') {
      return score === 1 ? 'border-emerald-500/30' : 'border-rose-500/30';
    }
    if (score >= 0.9) return 'border-emerald-500/30';
    if (score >= 0.5) return 'border-amber-500/30';
    return 'border-rose-500/30';
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-6 mb-8 pb-6 border-b border-atelier-cream/20">
        <ScoreRing score={category.score} size={100} />
        <div>
          <h2 className="font-serif text-2xl text-atelier-cream tracking-wide">{title}</h2>
          <p className="text-atelier-cream-muted text-sm mt-1 font-sans">
            Score: {category.score !== null ? Math.round(category.score * 100) : 'N/A'}/100
          </p>
        </div>
      </div>

      {failAudits.length > 0 && (
        <div className="mb-6">
          <h3 className="font-sans text-xs uppercase tracking-widest text-rose-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full" />
            Needs Attention
          </h3>
          <div className={`border rounded-lg ${getBorderClass(0.3, 'numeric')} bg-rose-500/5`}>
            {failAudits.map((audit) => (
              <AuditItem key={audit.id} audit={audit} isPass={false} />
            ))}
          </div>
        </div>
      )}

      {passAudits.length > 0 && (
        <div className="mb-6">
          <h3 className="font-sans text-xs uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            Passing
          </h3>
          <div className={`border rounded-lg ${getBorderClass(1, 'binary')} bg-emerald-500/5`}>
            {passAudits.map((audit) => (
              <AuditItem key={audit.id} audit={audit} isPass={true} />
            ))}
          </div>
        </div>
      )}

      {otherAudits.length > 0 && (
        <div>
          <h3 className="font-sans text-xs uppercase tracking-widest text-atelier-cream-muted mb-4">
            Additional Diagnostics
          </h3>
          <div className="border border-atelier-dark rounded-lg bg-atelier-dark/20">
            {otherAudits.map((audit) => (
              <AuditItem
                key={audit.id}
                audit={audit}
                isPass={audit.score !== null && audit.score >= 0.9}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AuditClient({ prospect }: { prospect: string }) {
  const [data, setData] = useState<LighthouseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/audits/${prospect}.json`);
        if (!response.ok) {
          throw new Error('Audit report not found');
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prospect]);

  if (loading) {
    return (
      <div className="min-h-screen bg-atelier-black flex items-center justify-center">
        <div className="text-atelier-cream font-serif text-lg">Loading audit report...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-atelier-black flex items-center justify-center">
        <div className="text-rose-400 font-serif text-lg">{error || 'Audit not found'}</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-atelier-black">
      <div className="grain-overlay" aria-hidden="true" />

      {/* Header */}
      <header className="border-b border-atelier-dark">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-atelier-cream-muted mb-2">
                Velocity Digital Atelier
              </p>
              <h1 className="font-serif text-3xl text-atelier-cream tracking-wide">
                Lighthouse Audit Report
              </h1>
            </div>
            <div className="text-right">
              <p className="font-serif text-xl text-atelier-cream capitalize">{prospect}</p>
              <p className="text-sm text-atelier-cream-muted font-sans mt-1">
                {formatDate(data.fetchTime)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* URL Bar */}
      <div className="border-b border-atelier-dark bg-atelier-dark/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-sm font-sans">
            <span className="text-atelier-cream-muted">Audited URL:</span>{' '}
            <a
              href={data.requestedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-atelier-cream hover:text-atelier-orange transition-colors underline underline-offset-4"
            >
              {data.requestedUrl}
            </a>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {data.categories.performance && (
            <div className="border border-atelier-dark rounded-lg p-6 bg-atelier-dark/20">
              <ScoreRing score={data.categories.performance.score} size={60} />
              <p className="font-serif text-atelier-cream mt-4">Performance</p>
              <p className="text-xs text-atelier-cream-muted font-sans mt-1">
                {data.categories.performance.score !== null
                  ? Math.round(data.categories.performance.score * 100)
                  : 'N/A'}
                /100
              </p>
            </div>
          )}
          {data.categories.accessibility && (
            <div className="border border-atelier-dark rounded-lg p-6 bg-atelier-dark/20">
              <ScoreRing score={data.categories.accessibility.score} size={60} />
              <p className="font-serif text-atelier-cream mt-4">Accessibility</p>
              <p className="text-xs text-atelier-cream-muted font-sans mt-1">
                {data.categories.accessibility.score !== null
                  ? Math.round(data.categories.accessibility.score * 100)
                  : 'N/A'}
                /100
              </p>
            </div>
          )}
          {data.categories['best-practices'] && (
            <div className="border border-atelier-dark rounded-lg p-6 bg-atelier-dark/20">
              <ScoreRing score={data.categories['best-practices'].score} size={60} />
              <p className="font-serif text-atelier-cream mt-4">Best Practices</p>
              <p className="text-xs text-atelier-cream-muted font-sans mt-1">
                {data.categories['best-practices'].score !== null
                  ? Math.round(data.categories['best-practices'].score * 100)
                  : 'N/A'}
                /100
              </p>
            </div>
          )}
          {data.categories.seo && (
            <div className="border border-atelier-dark rounded-lg p-6 bg-atelier-dark/20">
              <ScoreRing score={data.categories.seo.score} size={60} />
              <p className="font-serif text-atelier-cream mt-4">SEO</p>
              <p className="text-xs text-atelier-cream-muted font-sans mt-1">
                {data.categories.seo.score !== null
                  ? Math.round(data.categories.seo.score * 100)
                  : 'N/A'}
                /100
              </p>
            </div>
          )}
        </div>

        {/* Detailed Sections */}
        {data.categories.performance && (
          <CategorySection
            title="Performance"
            category={data.categories.performance}
            audits={data.audits}
          />
        )}

        {data.categories.accessibility && (
          <CategorySection
            title="Accessibility"
            category={data.categories.accessibility}
            audits={data.audits}
          />
        )}

        {data.categories['best-practices'] && (
          <CategorySection
            title="Best Practices"
            category={data.categories['best-practices']}
            audits={data.audits}
          />
        )}

        {data.categories.seo && (
          <CategorySection
            title="SEO"
            category={data.categories.seo}
            audits={data.audits}
          />
        )}

        {/* Footer */}
        <footer className="border-t border-atelier-dark pt-8 mt-16">
          <div className="flex items-center justify-between">
            <p className="text-xs text-atelier-cream-muted font-sans">
              Lighthouse v{data.lighthouseVersion} • Generated by Velocity Atelier
            </p>
            <a
              href="https://velocity.calyvent.com"
              className="text-xs text-atelier-cream hover:text-atelier-orange transition-colors font-sans"
            >
              velocity.calyvent.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
