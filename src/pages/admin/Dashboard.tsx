import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { castingCallsApi, applicationsApi, CastingCall, CastingApplication } from '@/lib/api';
import { 
  Film, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  totalCastings: number;
  activeCastings: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  hiredTalents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCastings: 0,
    activeCastings: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    hiredTalents: 0,
  });
  const [recentApplications, setRecentApplications] = useState<CastingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [castingsRes, applicationsRes] = await Promise.all([
          castingCallsApi.getAll(),
          applicationsApi.getAll(),
        ]);

        const castings: CastingCall[] = castingsRes.data;
        const applications: CastingApplication[] = applicationsRes.data;

        setStats({
          totalCastings: castings.length,
          activeCastings: castings.filter(c => c.status === 'open').length,
          totalApplications: applications.length,
          pendingApplications: applications.filter(a => a.status === 'pending').length,
          shortlistedApplications: applications.filter(a => a.status === 'shortlisted').length,
          hiredTalents: applications.filter(a => a.status === 'hired').length,
        });

        setRecentApplications(applications.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Total Casting Calls',
      value: stats.totalCastings,
      icon: Film,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Active Castings',
      value: stats.activeCastings,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Pending Review',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Shortlisted',
      value: stats.shortlistedApplications,
      icon: UserCheck,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      label: 'Hired Talents',
      value: stats.hiredTalents,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your talent management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="animate-fade-in rounded-xl border border-border bg-gradient-card p-6 shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Applications */}
          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Recent Applications
              </h2>
              <Link to="/admin/applications">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/admin/applications/${app.id}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                        <img
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${app.image_path}`}
                          alt={app.full_name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.full_name)}&background=c9a227&color=0f0f12`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{app.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.casting_call?.title || 'Casting Call'}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      app.status === 'pending' ? 'bg-warning/20 text-warning' :
                      app.status === 'shortlisted' ? 'bg-info/20 text-info' :
                      app.status === 'hired' ? 'bg-success/20 text-success' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {app.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No applications yet
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border border-border bg-gradient-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/admin/casting-calls/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-14">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Film className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Create Casting Call</p>
                    <p className="text-sm text-muted-foreground">Post a new casting opportunity</p>
                  </div>
                </Button>
              </Link>
              <Link to="/admin/applications?status=pending" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-14">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Review Pending</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.pendingApplications} applications awaiting review
                    </p>
                  </div>
                </Button>
              </Link>
              <Link to="/admin/applications?status=shortlisted" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-14">
                  <div className="rounded-lg bg-info/10 p-2">
                    <UserCheck className="h-5 w-5 text-info" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Shortlisted</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.shortlistedApplications} candidates shortlisted
                    </p>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
