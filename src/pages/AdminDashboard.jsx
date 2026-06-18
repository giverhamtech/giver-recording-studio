
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

import CategoryManager from '@/components/admin/CategoryManager.jsx';
import SongManager from '@/components/admin/SongManager.jsx';
import FeaturedBeatsManager from '@/components/admin/FeaturedBeatsManager.jsx';
import DataDiagnostics from '@/components/admin/DataDiagnostics.jsx';
import useFounderProfile from '@/hooks/useFounderProfile.js';

import { Settings, Music, Tags, Inbox, UserCircle, Star, BarChart3, Globe, Lock, EyeOff, Trash2, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    songs: 0,
    featured: 0,
    public: 0,
    private: 0,
    unlisted: 0
  });
  
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [categoriesRes, songsRes, subsRes] = await Promise.all([
        pb.collection('categories').getList(1, 1, { $autoCancel: false }),
        pb.collection('songs').getFullList({ $autoCancel: false }),
        pb.collection('artistSubmissions').getList(1, 50, { sort: '-created', $autoCancel: false })
      ]);

      const publicCount = songsRes.filter(s => s.privacy === 'public').length;
      const privateCount = songsRes.filter(s => s.privacy === 'private').length;
      const unlistedCount = songsRes.filter(s => s.privacy === 'unlisted').length;
      const featuredCount = songsRes.filter(s => s.featured).length;

      setStats({
        categories: categoriesRes.totalItems,
        songs: songsRes.length,
        public: publicCount,
        private: privateCount,
        unlisted: unlistedCount,
        featured: featuredCount
      });

      setSubmissions(subsRes.items);
    } catch (error) {
      toast.error('Failed to load dashboard statistics from shared database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteSubmission = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await pb.collection('artistSubmissions').delete(id, { $autoCancel: false });
        toast.success('Submission deleted successfully');
        setSubmissions(submissions.filter(s => s.id !== id));
      } catch (error) {
        toast.error('Failed to delete submission');
      }
    }
  };

  const FounderManagement = () => {
    const { profile, isLoading: isFounderLoading, uploadImage, removeImage, getImageUrl } = useFounderProfile();
    const currentImage = getImageUrl();
    const [file, setFile] = useState(null);

    return (
      <Card className="bg-card border-border max-w-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Founder Profile Image</CardTitle>
          <CardDescription>Update the photo shown on the About page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <Input type="file" accept="image/*" className="bg-background" onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => file && uploadImage(file).then(() => setFile(null))} 
                  disabled={!file || isFounderLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Photo
                </Button>
                {currentImage && (
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
      </Helmet>
      
      <div className="min-h-screen bg-background pb-20">
        <Header />
        
        <main className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">System Administration</h1>
              <p className="text-muted-foreground">Manage your shared persistent database entries across all systems.</p>
            </div>
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
              <TabsTrigger value="featured" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Star className="w-4 h-4" /> Featured Area
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Inbox className="w-4 h-4" /> Submissions
              </TabsTrigger>
              <TabsTrigger value="diagnostics" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <ShieldAlert className="w-4 h-4" /> Diagnostics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <UserCircle className="w-4 h-4" /> Profile
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
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Featured</CardTitle>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? '-' : stats.featured}</div>
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

            <TabsContent value="featured" className="focus:outline-none">
              <FeaturedBeatsManager />
            </TabsContent>

            <TabsContent value="diagnostics" className="focus:outline-none">
              <DataDiagnostics />
            </TabsContent>

            <TabsContent value="submissions" className="focus:outline-none space-y-6">
              <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-6">
                <h2 className="text-2xl font-bold text-foreground">Artist Submissions</h2>
                <p className="text-muted-foreground">Review tracks submitted by independent artists via the public form.</p>
              </div>
              
              {submissions.length === 0 ? (
                <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
                  <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending submissions</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {submissions.map(sub => (
                    <Card key={sub.id} className="bg-background border-border overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                      <CardContent className="p-0">
                        <div className="p-5 pb-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-foreground line-clamp-1">{sub.songTitle}</h4>
                              <p className="text-primary font-medium">{sub.artistName}</p>
                            </div>
                            {sub.genre && <Badge variant="secondary" className="bg-secondary">{sub.genre}</Badge>}
                          </div>
                          
                          <div className="space-y-1.5 text-sm text-muted-foreground mb-4 bg-secondary/30 p-3 rounded-lg border border-border/50">
                            <p><span className="font-medium text-foreground">Email:</span> {sub.email}</p>
                            {sub.instagramHandle && <p><span className="font-medium text-foreground">IG:</span> {sub.instagramHandle}</p>}
                          </div>
                          
                          {sub.message && (
                            <p className="text-sm text-foreground/80 italic border-l-2 border-primary/50 pl-3">
                              "{sub.message}"
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-card p-4 border-t border-border flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {sub.audioFile ? (
                              <audio controls className="w-full h-10 [&::-webkit-media-controls-panel]:bg-background" src={pb.files.getURL(sub, sub.audioFile)} />
                            ) : (
                              <span className="text-xs text-destructive">No audio file</span>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSubmission(sub.id)} className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="focus:outline-none">
              <FounderManagement />
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
