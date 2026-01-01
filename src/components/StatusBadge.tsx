import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/lib/api';

interface StatusBadgeProps {
  status: ApplicationStatus | 'open' | 'closed';
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  shortlisted: 'Shortlisted',
  hired: 'Hired',
  rejected: 'Rejected',
  open: 'Open',
  closed: 'Closed',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={status as any}>
      {statusLabels[status] || status}
    </Badge>
  );
}
