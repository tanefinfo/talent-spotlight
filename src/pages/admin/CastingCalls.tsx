import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { castingCallsApi, CastingCall } from '@/lib/api';
import { Plus, Edit, Trash2, Loader2, Calendar, Users, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

export default function CastingCallsPage() {
  const navigate = useNavigate();
  const [castingCalls, setCastingCalls] = useState<CastingCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCastingCalls = async () => {
    try {
      const response = await castingCallsApi.getAll();
      setCastingCalls(response.data);
    } catch (error) {
      console.error('Failed to fetch casting calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCastingCalls();
  }, []);

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Casting Call?',
      text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      confirmButtonText: 'Yes, delete it',
      background: '#18181b',
      color: '#faf5f0',
    });

    if (result.isConfirmed) {
      try {
        await castingCallsApi.delete(id);
        setCastingCalls(castingCalls.filter(c => c.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'Casting call has been deleted.',
          icon: 'success',
          background: '#18181b',
          color: '#faf5f0',
          confirmButtonColor: '#c9a227',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete casting call.',
          icon: 'error',
          background: '#18181b',
          color: '#faf5f0',
          confirmButtonColor: '#c9a227',
        });
      }
    }
  };

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Casting Calls
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your casting opportunities
            </p>
          </div>
          <Link to="/admin/casting-calls/new">
            <Button variant="gold" className="gap-2">
              <Plus className="h-4 w-4" />
              New Casting Call
            </Button>
          </Link>
        </div>

        {/* Casting Calls Grid */}
        {castingCalls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {castingCalls.map((casting, index) => (
              <div
                key={casting.id}
                className="animate-fade-in rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:border-primary/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                      {casting.title}
                    </h3>
                    <StatusBadge status={casting.status || 'open'} />
                  </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {casting.description}
                </p>

                {casting.deadline && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {format(new Date(casting.deadline), 'MMM dd, yyyy')}</span>
                  </div>
                )}

                {casting.applications && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{casting.applications.length} applications</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => navigate(`/admin/casting-calls/${casting.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => navigate(`/admin/casting-calls/${casting.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(casting.id, casting.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              No Casting Calls Yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Create your first casting call to start receiving applications
            </p>
            <Link to="/admin/casting-calls/new" className="mt-4">
              <Button variant="gold">Create Casting Call</Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
