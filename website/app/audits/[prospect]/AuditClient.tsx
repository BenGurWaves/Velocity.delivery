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
type SummarySeverity = 'good' | 'warn' | 'bad';

interface SummaryFinding {
  title: string;
  detail: string;
  severity: SummarySeverity;
}

const formatDuration = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'unknown';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
};

const buildPlainLanguageSummary = (data: LighthouseData) => {
  const performance = data.categories.performance?.score ?? null;
  const accessibility = data.categories.accessibility?.score ?? null;
  const bestPractices = data.categories['best-practices']?.score ?? null;
  const seo = data.categories.seo?.score ?? null;

  const fcp = data.audits['first-contentful-paint']?.numericValue ?? null;
  const lcp = data.audits['largest-contentful-paint']?.numericValue ?? null;
  const tbt = data.audits['total-blocking-time']?.numericValue ?? null;
  const cls = data.audits['cumulative-layout-shift']?.numericValue ?? null;

  const findings: SummaryFinding[] = [];
  const actions: string[] = [];

  if (lcp !== null && lcp > 4000) {
    findings.push({
      title: 'Main content appears too late',
      detail: `The key visual/content shows around ${formatDuration(lcp)}, which is much slower than users expect on mobile.`,
      severity: 'bad',
    });
    actions.push('Prioritize the hero image/video: compress media, preload it, and avoid heavy effects before first paint.');
  } else if (lcp !== null && lcp > 2500) {
    findings.push({
      title: 'Hero section loads slower than ideal',
      detail: `Largest content appears around ${formatDuration(lcp)}, which may still feel sluggish for first-time visitors.`,
      severity: 'warn',
    });
    actions.push('Trim initial media and prioritize above-the-fold assets.');
  }

  if (cls !== null && cls > 0.25) {
    findings.push({
      title: 'Layout shifts are visibly disruptive',
      detail: `Page elements move during load (CLS ${cls.toFixed(3)}), which can cause missed taps and reduce trust.`,
      severity: 'bad',
    });
    actions.push('Reserve space for images/fonts/buttons so layout stays stable while loading.');
  } else if (cls !== null && cls > 0.1) {
    findings.push({
      title: 'Some visual jumping during load',
      detail: `Layout stability is weaker than recommended (CLS ${cls.toFixed(3)}).`,
      severity: 'warn',
    });
    actions.push('Define fixed dimensions for key elements to reduce movement while assets load.');
  }

  if (performance !== null && performance < 0.5) {
    findings.push({
      title: 'Overall speed is in a high-risk zone',
      detail: `Performance score is ${Math.round(performance * 100)}/100; this usually increases bounce before users engage with products.`,
      severity: 'bad',
    });
    actions.push('Reduce JavaScript and third-party scripts loaded on first view.');
  } else if (performance !== null && performance < 0.75) {
    findings.push({
      title: 'Overall speed needs improvement',
      detail: `Performance score is ${Math.round(performance * 100)}/100; users may notice delay on weaker mobile connections.`,
      severity: 'warn',
    });
    actions.push('Improve first-load performance by delaying non-critical scripts.');
  }

  if (fcp !== null && fcp > 1800) {
    findings.push({
      title: 'First visual response is delayed',
      detail: `Users wait about ${formatDuration(fcp)} before meaningful content appears.`,
      severity: 'warn',
    });
    actions.push('Inline critical CSS and preload key fonts to show meaningful content faster.');
  }

  if (tbt !== null && tbt > 300) {
    findings.push({
      title: 'Interactions may feel laggy',
      detail: `Main-thread blocking is around ${formatDuration(tbt)}, which can delay taps and scrolling.`,
      severity: 'warn',
    });
    actions.push('Split or defer heavy script bundles so interaction is responsive sooner.');
  }

  if (bestPractices !== null && bestPractices < 0.9) {
    findings.push({
      title: 'Technical trust signals can improve',
      detail: `Best Practices score is ${Math.round(bestPractices * 100)}/100, indicating implementation issues that can impact reliability perception.`,
      severity: 'warn',
    });
  }

  if (accessibility !== null && accessibility < 0.9) {
    findings.push({
      title: 'Accessibility needs attention',
      detail: `Accessibility score is ${Math.round(accessibility * 100)}/100; some users may face friction navigating or reading content.`,
      severity: 'warn',
    });
    actions.push('Fix contrast, labels, and semantic structure to improve usability for all visitors.');
  }

  if (seo !== null && seo < 0.9) {
    findings.push({
      title: 'Search visibility has technical gaps',
      detail: `SEO score is ${Math.round(seo * 100)}/100, which can reduce discoverability.`,
      severity: 'warn',
    });
  }

  if (findings.length === 0) {
    findings.push({
      title: 'No major risk flags in this snapshot',
      detail: 'Core metrics are generally healthy, with only minor tuning opportunities.',
      severity: 'good',
    });
  }

  const uniqueActions = Array.from(new Set(actions)).slice(0, 4);

  return {
    findings: findings.slice(0, 5),
    actions: uniqueActions,
    businessImpact:
      performance !== null && performance < 0.7
        ? 'Likely impact: a meaningful share of mobile visitors leave before fully experiencing the product story.'
        : 'Likely impact: moderate friction during first visit, but stronger engagement potential after targeted optimizations.',
  };
};

const severityStyles: Record<SummarySeverity, { dot: string; text: string; bg: string; border: string }> = {
  good: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/25',
  },
  warn: {
    dot: 'bg-amber-500',
    text: 'text-amber-300',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/25',
  },
  bad: {
    dot: 'bg-rose-500',
    text: 'text-rose-300',
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/25',
  },
};

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
  const summary = buildPlainLanguageSummary(data);

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
        <section className="mb-12 border border-atelier-dark rounded-lg bg-atelier-dark/20 p-6 md:p-8">
          <div className="mb-5">
            <p className="font-sans text-xs uppercase tracking-widest text-atelier-cream-muted mb-2">
              Plain-language executive summary
            </p>
            <h2 className="font-serif text-2xl text-atelier-cream mb-3">
              What this means for a non-technical stakeholder
            </h2>
            <p className="text-sm md:text-base text-atelier-cream/90 font-sans leading-relaxed">
              {summary.businessImpact}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {summary.findings.map((finding, idx) => {
              const style = severityStyles[finding.severity];
              return (
                <div
                  key={`${finding.title}-${idx}`}
                  className={`border rounded-md p-4 ${style.border} ${style.bg}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <p className={`font-serif text-base ${style.text}`}>{finding.title}</p>
                  </div>
                  <p className="text-sm text-atelier-cream/85 font-sans leading-relaxed">
                    {finding.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {summary.actions.length > 0 && (
            <div>
              <h3 className="font-sans text-xs uppercase tracking-widest text-atelier-cream-muted mb-3">
                Highest-priority next steps
              </h3>
              <ul className="space-y-2">
                {summary.actions.map((action, idx) => (
                  <li
                    key={`${action}-${idx}`}
                    className="flex items-start gap-3 text-sm font-sans text-atelier-cream/90"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-atelier-orange flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
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
