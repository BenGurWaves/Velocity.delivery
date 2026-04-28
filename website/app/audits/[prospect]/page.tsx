import AuditClient from './AuditClient';

// Generate static params for known audits
export function generateStaticParams() {
  return [
    { prospect: 'xerjoff' },
  ];
}

export default async function AuditPage({ params }: { params: Promise<{ prospect: string }> }) {
  const { prospect } = await params;
  return <AuditClient prospect={prospect} />;
}
