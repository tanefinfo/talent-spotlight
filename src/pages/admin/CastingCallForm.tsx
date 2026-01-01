import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { castingCallsApi, CastingCall, CastingCallInput } from '@/lib/api';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

export default function CastingCallForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [formData, setFormData] = useState<CastingCallInput>({
    title: '',
    description: '',
    requirements: '',
    deadline: '',
    status: 'open',
  });

  useEffect(() => {
    if (isEditing) {
      const fetchCasting = async () => {
        try {
          const response = await castingCallsApi.getOne(Number(id));
          const casting: CastingCall = response.data;
          setFormData({
            title: casting.title,
            description: casting.description,
            requirements: casting.requirements || '',
            deadline: casting.deadline ? format(new Date(casting.deadline), 'yyyy-MM-dd') : '',
            status: casting.status,
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load casting call',
            background: '#18181b',
            color: '#faf5f0',
            confirmButtonColor: '#c9a227',
          });
          navigate('/admin/casting-calls');
        } finally {
          setIsFetching(false);
        }
      };
      fetchCasting();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing) {
        await castingCallsApi.update(Number(id), formData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Casting call has been updated successfully.',
          background: '#18181b',
          color: '#faf5f0',
          confirmButtonColor: '#c9a227',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await castingCallsApi.create(formData);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Casting call has been created successfully.',
          background: '#18181b',
          color: '#faf5f0',
          confirmButtonColor: '#c9a227',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      navigate('/admin/casting-calls');
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save casting call',
        background: '#18181b',
        color: '#faf5f0',
        confirmButtonColor: '#c9a227',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/casting-calls')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Casting Call' : 'New Casting Call'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEditing ? 'Update casting call details' : 'Create a new casting opportunity'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-border bg-gradient-card p-6 shadow-card"
        >
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Lead Actor for Feature Film"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description *
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, project, and what you're looking for..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements" className="text-sm font-medium text-foreground">
              Requirements
            </label>
            <Textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List any specific requirements (age, experience, skills, etc.)"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-medium text-foreground">
                Application Deadline
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-11 w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/casting-calls')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
