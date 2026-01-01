import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { applicationsApi, CastingApplication, ApplicationStatus } from '@/lib/api';
import { Loader2, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';

const statusFilters: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Hired', value: 'hired' },
  { label: 'Rejected', value: 'rejected' },
];

export default function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<CastingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    (searchParams.get('status') as ApplicationStatus) || 'all'
  );

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationsApi.getAll();
        setApplications(response.data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleStatusFilter = (status: ApplicationStatus | 'all') => {
    setStatusFilter(status);
    if (status === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    const castingCallId = searchParams.get('casting_call_id');
    if (castingCallId && app.casting_call_id !== Number(castingCallId)) return false;
    return true;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Applications
          </h1>
          <p className="mt-1 text-muted-foreground">
            Review and manage talent applications
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {statusFilters.map(filter => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(filter.value)}
              className={statusFilter === filter.value ? 'bg-gradient-gold' : ''}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredApplications.map((application, index) => (
              <Link
                key={application.id}
                to={`/admin/applications/${application.id}`}
                className="animate-fade-in group rounded-xl border border-border bg-gradient-card p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-gold/10"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Profile Image */}
                <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${application.image_path}`}
                    alt={application.full_name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.full_name)}&background=c9a227&color=0f0f12&size=400`;
                    }}
                  />
                  <div className="absolute right-2 top-2">
                    <StatusBadge status={application.status} />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                    {application.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {application.casting_call?.title || 'Casting Call'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{application.gender}</span>
                    <span>{format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="mt-4 flex items-center justify-center rounded-lg border border-border bg-secondary/50 py-2 text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <p className="text-lg text-muted-foreground">No applications found</p>
            {statusFilter !== 'all' && (
              <Button
                variant="link"
                onClick={() => handleStatusFilter('all')}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
