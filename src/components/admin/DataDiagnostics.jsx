
import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Wrench, RefreshCw, FileWarning, Search, ListChecks } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const slugify = (text) => text?.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/\-\-+/g, '-') || 'untitled';

const DataDiagnostics = () => {
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [stats, setStats] = useState({ total: 0, checked: 0 });

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('songs').getFullList({ $autoCancel: false });
      setStats({ total: records.length, checked: records.length });
      
      const foundIssues = [];

      records.forEach(song => {
        const songIssues = [];
        
        // Check 1: Privacy explicitly set
        if (!song.privacy) {
          songIssues.push({ type: 'missing_privacy', desc: 'Privacy field is empty (defaults to hidden)' });
        }

        // Check 2: Audio File
        if (!song.audioFile) {
          songIssues.push({ type: 'missing_audio', desc: 'No audio file attached' });
        }

        // Check 3: Category
        if (!song.category) {
          songIssues.push({ type: 'missing_category', desc: 'Uncategorized track' });
        }

        // Check 4: Slug
        if (!song.slug) {
          songIssues.push({ type: 'missing_slug', desc: 'Missing URL slug' });
        }

        if (songIssues.length > 0) {
          foundIssues.push({ song, issues: songIssues });
        }
      });

      setIssues(foundIssues);
      
      if (foundIssues.length === 0) {
        toast.success("Audit complete! No critical data inconsistencies found.");
      } else {
        toast.warning(`Audit complete. Found issues in ${foundIssues.length} tracks.`);
      }

    } catch (error) {
      console.error('Audit failed:', error);
      toast.error('Failed to run audit');
    } finally {
      setIsLoading(false);
    }
  };

  const fixAllIssues = async () => {
    setIsFixing(true);
    let fixedCount = 0;

    for (const item of issues) {
      try {
        const updates = {};
        
        item.issues.forEach(iss => {
          if (iss.type === 'missing_privacy') updates.privacy = 'public';
          if (iss.type === 'missing_slug') updates.slug = slugify(item.song.title) + '-' + Math.random().toString(36).substring(2, 6);
        });

        if (Object.keys(updates).length > 0) {
          await pb.collection('songs').update(item.song.id, updates, { $autoCancel: false });
          fixedCount++;
        }
      } catch (err) {
        console.error(`Failed to fix song ${item.song.id}:`, err);
      }
    }

    setIsFixing(false);
    toast.success(`Successfully fixed ${fixedCount} records.`);
    runAudit(); // re-audit
  };

  useEffect(() => {
    runAudit();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            Data Integrity Audit
          </h2>
          <p className="text-muted-foreground mt-1">Scan catalog for missing metadata, broken links, and inconsistencies.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={runAudit} disabled={isLoading || isFixing} className="border-border hover:bg-secondary">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Re-scan Catalog
          </Button>
          <Button onClick={fixAllIssues} disabled={isLoading || isFixing || issues.length === 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Wrench className="w-4 h-4 mr-2" />
            Auto-Fix Issues
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-muted-foreground" />
              Audit Results
            </CardTitle>
            <CardDescription>
              Scanned {stats.checked} records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground animate-pulse">Running diagnostics...</div>
            ) : issues.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold text-foreground mb-2">System Healthy</h3>
                <p className="text-muted-foreground">All {stats.checked} tracks pass the data integrity checks.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {issues.map(item => (
                  <div key={item.song.id} className="bg-background border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground truncate mr-2">{item.song.title}</h4>
                      <Badge variant="destructive" className="shrink-0">{item.issues.length} Issues</Badge>
                    </div>
                    <ul className="space-y-1.5">
                      {item.issues.map((iss, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                          <FileWarning className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {iss.desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="w-5 h-5 text-primary" />
              Testing & Verification Checklist
            </CardTitle>
            <CardDescription>
              Manual testing steps for public playback and batch upload verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground border-b border-border pb-1">1. Batch Upload Functional Test</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Upload 5 mixed audio files (.mp3, .wav) via Batch Upload modal.</li>
                <li>Verify files exceeding 20MB are rejected cleanly.</li>
                <li>Verify selected category applies correctly to all uploaded tracks.</li>
                <li>Ensure modal displays progress bars per file without blocking.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground border-b border-border pb-1">2. Public Catalog & Pagination</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Navigate to /beats (Public Beats Page).</li>
                <li>Verify batch-uploaded tracks appear mixed with individual uploads.</li>
                <li>Click 'Load More' (if applicable) to ensure pagination displays subsequent records.</li>
                <li>Filter by the category applied during batch upload.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground border-b border-border pb-1">3. Playback & Download</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Play a batch-uploaded track; verify persistent player stays active across navigation.</li>
                <li>Scrub the timeline and adjust volume.</li>
                <li>Click Download. Ensure Email Capture Modal appears (if enabled) and file downloads completely.</li>
                <li>Verify Play and Download counts increment in the Song Library.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground border-b border-border pb-1">4. Share & Featured UI</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>Click Share icon and select 'Copy Link' - open in incognito to verify Route /beat/:slug.</li>
                <li>In Song Library, toggle 'Featured' on a batch-uploaded track.</li>
                <li>Navigate to Home page and verify the track displays correctly in Featured section with artwork.</li>
              </ul>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataDiagnostics;
