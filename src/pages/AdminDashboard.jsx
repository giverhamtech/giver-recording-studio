
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/Header.jsx';
import { supabase } from '@/lib/supabase.js';
import { getPublicStorageUrl } from '@/lib/storage.js';

import { toast } from 'sonner';

import CategoryManager from '@/components/admin/CategoryManager.jsx';
import SongManager from '@/components/admin/SongManager.jsx';
import FeaturedBeatsManager from '@/components/admin/FeaturedBeatsManager.jsx';
import DataDiagnostics from '@/components/admin/DataDiagnostics.jsx';
import ProductionManager from '@/components/admin/ProductionManager.jsx';
import MessagesManager from '@/components/admin/MessagesManager.jsx';
import BookingsManager from '@/components/admin/BookingsManager.jsx';
import useFounderProfile from '@/hooks/useFounderProfile.js';
import { useSiteSettings } from '@/contexts/SiteSettingsContext.jsx';
import { SPOTLIGHT_SONGS_QUERY_KEY, SONGS_ADMIN_QUERY_KEY } from '@/lib/queryClient.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateSlug } from '@/lib/utils.js';

import { Settings, Music, Tags, Inbox, UserCircle, Star, BarChart3, Globe, Lock, EyeOff, Trash2, ShieldAlert, CheckCircle2, XCircle, Loader2, MessageSquare, CalendarCheck2, Disc3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const getSubmissionSongTitle = (sub) => sub?.songTitle ?? sub?.title ?? 'Untitled';
const getSubmissionArtistName = (sub) => sub?.artistName ?? sub?.artist_name ?? 'Unknown Artist';
const getSubmissionGenre = (sub) => sub?.genre ?? sub?.category ?? null;
const getSubmissionAudio = (sub) => sub?.audioFile ?? sub?.audio_file ?? null;
const getSubmissionCover = (sub) => sub?.coverImage ?? sub?.cover_image ?? null;
const getSubmissionStatus = (sub) => String(sub?.status || 'pending').toLowerCase();
const getSubmissionDescription = (sub) => sub?.description ?? sub?.message ?? null;
const getSubmissionEmail = (sub) => sub?.email ?? null;
const getSubmissionInstagram = (sub) => sub?.instagramHandle ?? sub?.instagram_handle ?? null;
const getSubmissionMessage = (sub) => sub?.message ?? null;
const isUuid = (value) => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const getStatusBadge = (status) => {
  if (status === 'approved') return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { siteSettings } = useSiteSettings();
  const [stats, setStats] = useState({
    categories: 0,
    songs: 0,
    spotlight: 0,
    public: 0,
    private: 0,
    unlisted: 0
  });
  
  const [submissions, setSubmissions] = useState([]);
  const [submissionsTable, setSubmissionsTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [submissionFilter, setSubmissionFilter] = useState('pending');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [isFinalizingApproval, setIsFinalizingApproval] = useState(false);
  const [isUpdatingSubmission, setIsUpdatingSubmission] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    title: '',
    categoryId: 'none',
    description: '',
    is_featured: false,
    privacy: 'public'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubmissions = async () => {
    const tables = ['artist_uploads', 'artistSubmissions', 'submissions'];

    for (const table of tables) {
      let query = supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (table === 'artist_uploads') {
        query = query.neq('status', 'founder_profile');
      }

      const response = await query;

      if (!response.error) {
        return { table, data: response.data || [] };
      }
    }

    return { table: null, data: [] };
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const [categoriesRes, songsRes, submissionsRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('songs').select('id, privacy, is_featured'),
        fetchSubmissions()
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (songsRes.error) throw songsRes.error;

      const songs = songsRes.data || [];
      const categoriesData = categoriesRes.data || [];
      const categoriesCount = categoriesData.length;

      const publicCount = songs.filter(s => s.privacy === 'public').length;
      const privateCount = songs.filter(s => s.privacy === 'private').length;
      const unlistedCount = songs.filter(s => s.privacy === 'unlisted').length;
      const featuredCount = songs.filter((s) => s.is_featured).length;

      setStats({
        categories: categoriesCount,
        songs: songs.length,
        public: publicCount,
        private: privateCount,
        unlisted: unlistedCount,
        spotlight: featuredCount
      });

      setSubmissions(submissionsRes.data || []);
      setSubmissionsTable(submissionsRes.table || null);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to load dashboard statistics from shared database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSubmissionStatus = async (submissionId, status) => {
    if (!submissionsTable) {
      toast.error('Submission feature is not configured in Supabase yet.');
      return false;
    }

    try {
      setIsUpdatingSubmission(true);
      const { data, error } = await supabase
        .from(submissionsTable)
        .update({ status })
        .eq('id', submissionId)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      setSubmissions((prev) => prev.map((sub) => (sub.id === submissionId ? (data || { ...sub, status }) : sub)));
      return true;
    } catch (error) {
      console.error('Submission status update error:', error);
      toast.error(`Failed to mark submission as ${status}`);
      return false;
    } finally {
      setIsUpdatingSubmission(false);
    }
  };

  const openApprovalModal = (submission) => {
    const genre = getSubmissionGenre(submission);
    const categoryFromGenre = categories.find((cat) => String(cat?.name || '').toLowerCase() === String(genre || '').toLowerCase());
    const maybeCategoryId = isUuid(genre) ? genre : null;

    setApprovalTarget(submission);
    setApprovalForm({
      title: getSubmissionSongTitle(submission),
      categoryId: maybeCategoryId || categoryFromGenre?.id || 'none',
      description: getSubmissionDescription(submission) || '',
      is_featured: false,
      privacy: 'public'
    });
    setApprovalModalOpen(true);
  };

  const finalizeApproval = async () => {
    if (!approvalTarget) return;

    const audioPath = getSubmissionAudio(approvalTarget);
    if (!audioPath) {
      toast.error('Cannot approve this submission because it has no audio file.');
      return;
    }

    const title = approvalForm.title?.trim();
    if (!title) {
      toast.error('Song title is required for approval.');
      return;
    }

    try {
      setIsFinalizingApproval(true);

      const payload = {
        title,
        artist: getSubmissionArtistName(approvalTarget),
        description: approvalForm.description?.trim() || null,
        category_id: approvalForm.categoryId === 'none' ? null : approvalForm.categoryId,
        privacy: approvalForm.privacy,
        is_featured: Boolean(approvalForm.is_featured),
        slug: generateSlug(title),
        audio_file: audioPath,
        cover_image: getSubmissionCover(approvalTarget) || null
      };

      const { data: insertData, error: insertError } = await supabase.from('songs').insert(payload).select('*').maybeSingle();
      if (insertError) throw insertError;
      console.log('Insert response:', insertData);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: SONGS_ADMIN_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SPOTLIGHT_SONGS_QUERY_KEY }),
        queryClient.refetchQueries({ queryKey: SONGS_ADMIN_QUERY_KEY })
      ]);

      const statusUpdated = await updateSubmissionStatus(approvalTarget.id, 'approved');
      if (!statusUpdated) {
        toast.error('Song was published, but submission status could not be updated.');
      } else {
        toast.success('Submission approved and published to Song Library.');
      }

      setApprovalModalOpen(false);
      setApprovalTarget(null);
      await fetchDashboardData();
    } catch (error) {
      console.log('Error:', error);
      console.error('Finalize approval error:', error);
      toast.error(error?.message || 'Failed to finalize approval');
    } finally {
      setIsFinalizingApproval(false);
    }
  };

  const handleRejectSubmission = async (submission) => {
    const status = getSubmissionStatus(submission);
    if (status === 'rejected') {
      toast.message('Submission is already rejected.');
      return;
    }
    const ok = await updateSubmissionStatus(submission.id, 'rejected');
    if (ok) toast.success('Submission marked as rejected');
  };

  const handleDeleteSubmission = async (id) => {
    if (!submissionsTable) {
      toast.error('Submission feature is not configured in Supabase yet.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        const { error: delErr } = await supabase.from(submissionsTable).delete().eq('id', id);

        if (delErr) throw delErr;

        toast.success('Submission deleted successfully');
        setSubmissions((prev) => prev.filter(s => s.id !== id));
      } catch (error) {
        toast.error('Failed to delete submission');
      }
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const status = getSubmissionStatus(sub);
    if (submissionFilter === 'pending') return status === 'pending';
    if (submissionFilter === 'approved') return status === 'approved';
    if (submissionFilter === 'rejected') return status === 'rejected';
    return true;
  });

  const FounderManagement = () => {
    const { profile, isAvailable, isLoading: isFounderLoading, uploadImage, removeImage, getImageUrl } = useFounderProfile();
    const currentImage = getImageUrl();
    const [file, setFile] = useState(null);

    return (
      <Card className="bg-card border-border max-w-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Founder Profile Image</CardTitle>
          <CardDescription>Update the photo shown on the About page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAvailable && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
              Founder profile feature is currently unavailable because no founder profile table exists in Supabase.
            </div>
          )}
          <div className="flex gap-6">
            <div className="w-32 h-40 bg-secondary rounded-lg overflow-hidden border border-border flex items-center justify-center shrink-0">
              {currentImage ? (
                <img src={currentImage} alt="Founder" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-4 flex-1">
              <div className="space-y-2">
                <Label>Upload New Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="bg-background"
                  disabled={!isAvailable}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => file && uploadImage(file).then(() => setFile(null))} 
                  disabled={!isAvailable || !file || isFounderLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Photo
                </Button>
                {currentImage && isAvailable && (
                  <Button variant="outline" onClick={removeImage} disabled={isFounderLoading} className="border-border hover:bg-destructive/10 hover:text-destructive">
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Giver Recording Studio</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <main className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-4">
              {siteSettings?.logo_url ? (
                <img
                  src={siteSettings.logo_url}
                  alt="Site logo"
                  className="w-14 h-14 rounded-lg object-contain border border-border bg-card p-1"
                />
              ) : null}
              <div className="p-3 bg-primary/10 rounded-xl">
              <Settings className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">System Administration</h1>
                <p className="text-muted-foreground">{siteSettings?.site_name || 'Giver Recording Studio'}{siteSettings?.tagline ? ` - ${siteSettings.tagline}` : ''}</p>
              </div>
            </div>
            <Link to="/admin/site-settings">
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                <Settings className="w-4 h-4 mr-2" /> Site Settings
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-card border border-border w-full flex-wrap h-auto p-1 justify-start gap-1 shadow-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <BarChart3 className="w-4 h-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="songs" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Music className="w-4 h-4" /> Song Library
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Tags className="w-4 h-4" /> Categories
              </TabsTrigger>
              <TabsTrigger value="spotlight" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Star className="w-4 h-4" /> Homepage Spotlight
              </TabsTrigger>
              <TabsTrigger value="productions" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Disc3 className="w-4 h-4" /> Productions
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Inbox className="w-4 h-4" /> Submissions
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <MessageSquare className="w-4 h-4" /> Messages
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <CalendarCheck2 className="w-4 h-4" /> Bookings
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <ShieldAlert className="w-4 h-4" /> Diagnostics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <UserCircle className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="site-settings" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Globe className="w-4 h-4" /> Site Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 focus:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-sm hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Songs</CardTitle>
                    <Music className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? '-' : stats.songs}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</CardTitle>
                    <Tags className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? '-' : stats.categories}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Spotlight</CardTitle>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? '-' : stats.spotlight}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Submissions</CardTitle>
                    <Inbox className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? '-' : submissions.length}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-card border-border shadow-sm lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Visibility Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-teal-500" />
                        <span className="font-medium">Public (Website)</span>
                      </div>
                      <span className="text-lg font-bold">{stats.public}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">Unlisted</span>
                      </div>
                      <span className="text-lg font-bold">{stats.unlisted}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-destructive" />
                        <span className="font-medium">Private (Admin)</span>
                      </div>
                      <span className="text-lg font-bold">{stats.private}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border-border shadow-sm lg:col-span-2 flex items-center justify-center p-8 text-center border-dashed">
                   <div>
                     <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                     <h3 className="text-lg font-semibold text-foreground">Analytics Dashboard Coming Soon</h3>
                     <p className="text-muted-foreground mt-2 max-w-sm">Detailed play counts, downloads, and listener trends will appear here in a future update.</p>
                   </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="songs" className="focus:outline-none">
              <SongManager />
            </TabsContent>

            <TabsContent value="categories" className="focus:outline-none">
              <CategoryManager />
            </TabsContent>

            <TabsContent value="spotlight" className="focus:outline-none">
              <FeaturedBeatsManager />
            </TabsContent>

            <TabsContent value="productions" className="focus:outline-none">
              <ProductionManager />
            </TabsContent>

            <TabsContent value="diagnostics" className="focus:outline-none">
              <DataDiagnostics />
            </TabsContent>

            <TabsContent value="submissions" className="focus:outline-none space-y-6">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-6">
                <h2 className="text-2xl font-bold text-foreground">Artist Submissions</h2>
                <p className="text-muted-foreground">Review tracks submitted by independent artists via the public form.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={submissionFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setSubmissionFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={submissionFilter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setSubmissionFilter('approved')}
                  >
                    Approved
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={submissionFilter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setSubmissionFilter('rejected')}
                  >
                    Rejected
                  </Button>
                </div>
                {!submissionsTable && (
                  <p className="text-amber-300 text-sm mt-2">
                    Submissions table is not available in this Supabase project yet.
                  </p>
                )}
              </div>
              
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
                  <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No {submissionFilter} submissions</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredSubmissions.map(sub => {
                    const status = getSubmissionStatus(sub);
                    const hasAudio = Boolean(getSubmissionAudio(sub));
                    return (
                    <Card key={sub.id} className="bg-background border-border overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                      <CardContent className="p-0">
                        <div className="p-5 pb-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-foreground line-clamp-1">{getSubmissionSongTitle(sub)}</h4>
                              <p className="text-primary font-medium">{getSubmissionArtistName(sub)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(status)}
                              {getSubmissionGenre(sub) && <Badge variant="secondary" className="bg-secondary">{getSubmissionGenre(sub)}</Badge>}
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 text-sm text-muted-foreground mb-4 bg-secondary/30 p-3 rounded-lg border border-border/50">
                            <p><span className="font-medium text-foreground">Email:</span> {getSubmissionEmail(sub) || 'N/A'}</p>
                            {getSubmissionInstagram(sub) && <p><span className="font-medium text-foreground">IG:</span> {getSubmissionInstagram(sub)}</p>}
                          </div>
                          
                          {getSubmissionMessage(sub) && (
                            <p className="text-sm text-foreground/80 italic border-l-2 border-primary/50 pl-3">
                              "{getSubmissionMessage(sub)}"
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-card p-4 border-t border-border flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {hasAudio ? (
                              <audio
                                controls
                                className="w-full h-10 [&::-webkit-media-controls-panel]:bg-background"
                                src={
                                  getSubmissionAudio(sub)
                                    ? getPublicStorageUrl({ bucket: 'song-files', path: getSubmissionAudio(sub) })
                                    : null
                                }
                              />
                            ) : (
                              <span className="text-xs text-destructive">No audio file</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={status === 'approved' || !hasAudio || isFinalizingApproval || isUpdatingSubmission}
                              onClick={() => openApprovalModal(sub)}
                              className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={status === 'rejected' || isFinalizingApproval || isUpdatingSubmission}
                              onClick={() => handleRejectSubmission(sub)}
                              className="border-destructive/40 text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSubmission(sub.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="focus:outline-none">
              <MessagesManager />
            </TabsContent>

            <TabsContent value="bookings" className="focus:outline-none">
              <BookingsManager />
            </TabsContent>

            <TabsContent value="settings" className="focus:outline-none">
              <FounderManagement />
            </TabsContent>

            <TabsContent value="site-settings" className="focus:outline-none">
              <Card className="bg-card border-border max-w-2xl shadow-sm">
                <CardHeader>
                  <CardTitle>Global Site Settings</CardTitle>
                  <CardDescription>Edit logo, contact links, footer text, and social URLs with real-time updates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/admin/site-settings">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Open Site Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
      </div>

      <Dialog open={approvalModalOpen} onOpenChange={(open) => !open && !isFinalizingApproval && setApprovalModalOpen(false)}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>Finalize Submission Approval</DialogTitle>
            <DialogDescription>
              Review and adjust metadata before publishing this submission directly to the song catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-title">Song Title</Label>
              <Input
                id="approval-title"
                value={approvalForm.title}
                onChange={(e) => setApprovalForm((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={approvalForm.categoryId}
                onValueChange={(value) => setApprovalForm((prev) => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="approval-description">Description</Label>
              <Textarea
                id="approval-description"
                value={approvalForm.description}
                onChange={(e) => setApprovalForm((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-background"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={approvalForm.privacy}
                  onValueChange={(value) => setApprovalForm((prev) => ({ ...prev, privacy: value }))}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={approvalForm.is_featured}
                    onChange={(e) => setApprovalForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Show in Homepage Spotlight
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovalModalOpen(false)}
              disabled={isFinalizingApproval}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={finalizeApproval}
              disabled={isFinalizingApproval}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isFinalizingApproval ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</> : 'Finalize Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
