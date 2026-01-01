import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { castingCallsApi, CastingCall } from '@/lib/api';
import { ArrowLeft, Calendar, Edit, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function CastingCallDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [casting, setCasting] = useState<CastingCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCasting = async () => {
      try {
        const response = await castingCallsApi.getOne(Number(id));
        setCasting(response.data);
      } catch (error) {
        console.error('Failed to fetch casting call:', error);
        navigate('/admin/casting-calls');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCasting();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!casting) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/casting-calls')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  {casting.title}
                </h1>
                <StatusBadge status={casting.status || 'open'} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {casting.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Deadline: {format(new Date(casting.deadline), 'MMM dd, yyyy')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {casting.applications?.length || 0} applications
                </span>
              </div>
            </div>
          </div>
          <Link to={`/admin/casting-calls/${casting.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-foreground/90">
                {casting.description}
              </p>
            </div>

            {/* Requirements */}
            {casting.requirements && (
              <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
                <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                  Requirements
                </h2>
                <p className="whitespace-pre-wrap text-foreground/90">
                  {casting.requirements}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                Quick Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Applications</span>
                  <span className="font-medium text-foreground">
                    {casting.applications?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-warning">
                    {casting.applications?.filter(a => a.status === 'pending').length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shortlisted</span>
                  <span className="font-medium text-info">
                    {casting.applications?.filter(a => a.status === 'shortlisted').length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hired</span>
                  <span className="font-medium text-success">
                    {casting.applications?.filter(a => a.status === 'hired').length || 0}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/admin/applications?casting_call_id=${casting.id}`}
              className="block"
            >
              <Button variant="gold" className="w-full gap-2">
                <Users className="h-4 w-4" />
                View Applications
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
