import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { applicationsApi, CastingApplication } from '@/lib/api';
import { 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  UserCheck, 
  Star, 
  XCircle,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<CastingApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplication = async () => {
    try {
      const response = await applicationsApi.getOne(Number(id));
      setApplication(response.data);
    } catch (error) {
      console.error('Failed to fetch application:', error);
      navigate('/admin/applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id, navigate]);

  const handleStatusUpdate = async (action: 'shortlist' | 'hire' | 'reject') => {
    if (!application) return;

    const actionLabels = {
      shortlist: { title: 'Shortlist', past: 'shortlisted' },
      hire: { title: 'Hire', past: 'hired' },
      reject: { title: 'Reject', past: 'rejected' },
    };

    const result = await Swal.fire({
      title: `${actionLabels[action].title} this applicant?`,
      text: `Are you sure you want to ${action} ${application.full_name}?`,
      icon: action === 'reject' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'reject' ? '#ef4444' : '#c9a227',
      cancelButtonColor: '#27272a',
      confirmButtonText: `Yes, ${action}`,
      background: '#18181b',
      color: '#faf5f0',
    });

    if (result.isConfirmed) {
      setIsUpdating(true);
      try {
        await applicationsApi[action](application.id);
        await fetchApplication();
        Swal.fire({
          title: 'Success!',
          text: `Applicant has been ${actionLabels[action].past}.`,
          icon: 'success',
          background: '#18181b',
          color: '#faf5f0',
          confirmButtonColor: '#c9a227',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error: any) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || `Failed to ${action} applicant`,
          icon: 'error',
          background: '#18181b',
          color: '#faf5f0',
          confirmButtonColor: '#c9a227',
        });
      } finally {
        setIsUpdating(false);
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

  if (!application) return null;

  const storageUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/applications')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground">
                {application.full_name}
              </h1>
              <StatusBadge status={application.status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              Applied for: {application.casting_call?.title || 'Casting Call'}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Image */}
            <div className="overflow-hidden rounded-xl border border-border bg-gradient-card shadow-card">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={`${storageUrl}/storage/${application.image_path}`}
                  alt={application.full_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.full_name)}&background=c9a227&color=0f0f12&size=800`;
                  }}
                />
              </div>
            </div>

            {/* Experience Story */}
            <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                Experience Story
              </h2>
              <p className="whitespace-pre-wrap text-foreground/90">
                {application.experience_story}
              </p>
            </div>

            {/* Audition Videos */}
            {application.videos && application.videos.length > 0 && (
              <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
                <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
                  Audition Videos ({application.videos.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {application.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="relative aspect-video overflow-hidden rounded-lg bg-muted"
                    >
                      <video
                        src={video.video_url || `${storageUrl}/storage/${video.video_path}`}
                        controls
                        className="h-full w-full object-cover"
                        poster={`https://ui-avatars.com/api/?name=Video+${index + 1}&background=27272a&color=faf5f0&size=400`}
                      >
                        Your browser does not support video playback.
                      </video>
                      <div className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                        <Play className="mr-1 inline h-3 w-3" />
                        Video {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{application.phone}</p>
                  </div>
                </div>
                {application.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{application.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{application.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize text-foreground">
                    {application.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applied</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(application.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Videos</span>
                  <span className="font-medium text-foreground">
                    {application.videos?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {application.status !== 'hired' && application.status !== 'rejected' && (
                <>
                  {application.status !== 'shortlisted' && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-info/30 text-info hover:bg-info/10"
                      onClick={() => handleStatusUpdate('shortlist')}
                      disabled={isUpdating}
                    >
                      <Star className="h-4 w-4" />
                      Shortlist
                    </Button>
                  )}
                  <Button
                    variant="success"
                    className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90"
                    onClick={() => handleStatusUpdate('hire')}
                    disabled={isUpdating}
                  >
                    <UserCheck className="h-4 w-4" />
                    Hire Talent
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    onClick={() => handleStatusUpdate('reject')}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              {application.status === 'hired' && (
                <div className="rounded-lg bg-success/10 p-4 text-center">
                  <UserCheck className="mx-auto mb-2 h-8 w-8 text-success" />
                  <p className="font-medium text-success">Talent Hired</p>
                </div>
              )}
              {application.status === 'rejected' && (
                <div className="rounded-lg bg-destructive/10 p-4 text-center">
                  <XCircle className="mx-auto mb-2 h-8 w-8 text-destructive" />
                  <p className="font-medium text-destructive">Application Rejected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
