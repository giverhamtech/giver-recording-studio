
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Send, Music2, UploadCloud, FileAudio, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import EnhancedAudioCard from '@/components/EnhancedAudioCard.jsx';
import useLastCategory from '@/hooks/useLastCategory.js';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection.js';
import pb from '@/lib/firebaseClient.js';
import { toast } from 'sonner';
import { CATEGORIES, CATEGORY_IMAGES } from '@/config/beatCategories.js';

const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const ArtistSubmissionPage = () => {
  const { lastCategory, setLastCategory } = useLastCategory();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [previewCoverUrl, setPreviewCoverUrl] = useState(null);
  const [approvedSubmissions, setApprovedSubmissions] = useState([]);
  const { checkForDuplicate } = useDuplicateDetection();
  
  const [formData, setFormData] = useState({
    artistName: '',
    songTitle: '',
    genre: '',
    instagramHandle: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    if (lastCategory && !formData.genre) {
      setFormData(prev => ({ ...prev, genre: lastCategory }));
    }
  }, [lastCategory, formData.genre]);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const records = await pb.collection('artistSubmissions').getList(1, 50, {
          filter: 'status="approved"',
          sort: '-created',
          $autoCancel: false
        });
        setApprovedSubmissions(records.items);
      } catch (error) {
        console.error('Failed to fetch approved submissions:', error);
      }
    };
    fetchApproved();
  }, []);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setPreviewAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewAudioUrl(null);
    }
  }, [audioFile]);

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setPreviewCoverUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewCoverUrl(null);
    }
  }, [coverFile]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleGenreChange = (val) => {
    setFormData(prev => ({ ...prev, genre: val }));
    setLastCategory(val);
  };

  const handleAudioChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!isSupportedAudioFile(selected)) {
        toast.error('Unsupported audio format. Use MP3, WAV, M4A, AAC, FLAC or OGG.');
        e.target.value = null;
        setAudioFile(null);
        return;
      }
      if (selected.size > 20 * 1024 * 1024) {
        toast.error('Audio file size must be under 20MB');
        e.target.value = null;
        setAudioFile(null);
        return;
      }
      setAudioFile(selected);
    }
  };

  const handleCoverChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('Cover image size must be under 5MB');
        e.target.value = null;
        setCoverFile(null);
        return;
      }
      setCoverFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.artistName || !formData.songTitle || !formData.email || !audioFile) {
      toast.error('Please fill in all required fields and upload an audio file.');
      return;
    }

    setIsSubmitting(true);

    const { isDuplicate, reason } = await checkForDuplicate(formData.songTitle, audioFile);
    if (isDuplicate) {
      const proceed = window.confirm(`Possible Duplicate Detected: ${reason}.\nDo you want to submit anyway?`);
      if (!proceed) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const submissionData = new FormData();
      submissionData.append('artistName', formData.artistName);
      submissionData.append('songTitle', formData.songTitle);
      submissionData.append('email', formData.email);
      submissionData.append('audioFile', audioFile);
      
      if (coverFile) submissionData.append('coverImage', coverFile);
      if (formData.genre) submissionData.append('genre', formData.genre);
      if (formData.instagramHandle) submissionData.append('instagramHandle', formData.instagramHandle);
      if (formData.message) submissionData.append('message', formData.message);
      submissionData.append('status', 'pending');

      await pb.collection('artistSubmissions').create(submissionData, { $autoCancel: false });
      
      toast.success('Your song has been successfully submitted! We will contact you soon.');
      
      // Reset form but explicitly keep the genre to fulfill the UI requirement
      setFormData(prev => ({
        ...prev,
        artistName: '',
        songTitle: '',
        instagramHandle: '',
        email: '',
        message: ''
      }));
      setAudioFile(null);
      setCoverFile(null);
      
      // Reset raw DOM elements
      const audioInput = document.getElementById('audioFile');
      if (audioInput) audioInput.value = '';
      const coverInput = document.getElementById('coverFile');
      if (coverInput) coverInput.value = '';

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayCoverUrl = previewCoverUrl || CATEGORY_IMAGES['Artist Submissions'];

  // Generate playlist array for audio context
  const currentPlaylist = approvedSubmissions
    .filter(s => s.audioFile)
    .map(s => ({
      id: `submission:${s.id}`,
      title: s.songTitle,
      artist: s.artistName,
      category: s.genre,
      artwork: s.coverImage ? pb.files.getURL(s, s.coverImage) : CATEGORY_IMAGES[s.genre] || CATEGORY_IMAGES['Artist Submissions'],
      url: pb.files.getURL(s, s.audioFile)
    }));

  return (
    <>
      <Helmet>
        <title>Submit Your Music - Giver Recording Studio</title>
        <meta name="description" content="Submit your tracks to Giver Recording Studio for review, mixing, mastering, or promotional consideration." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/30 pointer-events-none"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Music2 className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                  SUBMIT YOUR <span className="text-primary">MUSIC</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
                  Send us your unreleased tracks or demos for review, production feedback, or potential collaboration opportunities.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-7"
              >
                <Card className="bg-card border-border shadow-xl">
                  <CardContent className="p-6 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="artistName">Artist Name *</Label>
                          <Input 
                            id="artistName" 
                            name="artistName" 
                            value={formData.artistName}
                            onChange={handleChange}
                            placeholder="Your stage name"
                            className="bg-background border-border text-foreground"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="songTitle">Song Title *</Label>
                          <Input 
                            id="songTitle" 
                            name="songTitle" 
                            value={formData.songTitle}
                            onChange={handleChange}
                            placeholder="Track name"
                            className="bg-background border-border text-foreground"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className="bg-background border-border text-foreground"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="genre">Genre</Label>
                          <Select onValueChange={handleGenreChange} value={formData.genre}>
                            <SelectTrigger className="bg-background border-border text-foreground">
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.filter(c => c !== 'Artist Submissions').map(g => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagramHandle">Instagram Handle</Label>
                        <Input 
                          id="instagramHandle" 
                          name="instagramHandle" 
                          value={formData.instagramHandle}
                          onChange={handleChange}
                          placeholder="@username (optional)"
                          className="bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="audioFile">Upload Audio *</Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/30 transition-colors bg-background h-32 flex items-center justify-center">
                            <input 
                              type="file" 
                              id="audioFile" 
                              name="audioFile" 
                              accept="audio/*" 
                              onChange={handleAudioChange}
                              className="sr-only"
                              required={!audioFile}
                            />
                            <Label htmlFor="audioFile" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                              {audioFile ? (
                                <>
                                  <FileAudio className="w-6 h-6 text-primary" />
                                  <span className="font-medium text-sm text-foreground truncate max-w-[200px]">{audioFile.name}</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                  <span className="font-medium text-sm text-foreground">Click to upload audio</span>
                                </>
                              )}
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="coverFile">Custom Cover Art (Optional)</Label>
                          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-muted/30 transition-colors bg-background h-32 flex items-center justify-center">
                            <input 
                              type="file" 
                              id="coverFile" 
                              name="coverFile" 
                              accept="image/*" 
                              onChange={handleCoverChange}
                              className="hidden"
                            />
                            <Label htmlFor="coverFile" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                              {coverFile ? (
                                <>
                                  <ImageIcon className="w-6 h-6 text-primary" />
                                  <span className="font-medium text-sm text-foreground truncate max-w-[200px]">{coverFile.name}</span>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                  <span className="font-medium text-sm text-foreground">Click to upload image</span>
                                </>
                              )}
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message / Notes (optional)</Label>
                        <Textarea 
                          id="message" 
                          name="message" 
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us a bit about this track, your goals, or specific feedback you are looking for..."
                          className="min-h-[120px] bg-background border-border text-foreground"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            Submit Track
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-5"
              >
                <div className="sticky top-28">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Preview</h3>
                  {previewAudioUrl ? (
                    <EnhancedAudioCard 
                      trackId="submission:preview"
                      source="submission-preview"
                      title={formData.songTitle || 'Untitled Track'}
                      artist={formData.artistName || 'Unknown Artist'}
                      genre={formData.genre || 'Artist Submissions'}
                      coverUrl={displayCoverUrl}
                      audioUrl={previewAudioUrl}
                      playlist={[{
                        id: 'submission:preview',
                        title: formData.songTitle || 'Untitled Track',
                        artist: formData.artistName || 'Unknown Artist',
                        category: formData.genre || 'Artist Submissions',
                        artwork: displayCoverUrl,
                        url: previewAudioUrl,
                      }]}
                    />
                  ) : (
                    <Card className="bg-card border-border border-dashed">
                      <CardContent className="p-10 flex flex-col items-center justify-center text-center h-[400px]">
                        <Music2 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">Upload an audio file to preview your submission card.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {approvedSubmissions.length > 0 && (
          <section className="py-20 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                  Approved Submissions
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Check out the latest tracks submitted by independent artists that made the cut.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {approvedSubmissions.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <EnhancedAudioCard 
                      trackId={`submission:${sub.id}`}
                      source="submission"
                      title={sub.songTitle}
                      artist={sub.artistName}
                      genre={sub.genre || 'Artist Submissions'}
                      coverUrl={sub.coverImage ? pb.files.getURL(sub, sub.coverImage) : CATEGORY_IMAGES[sub.genre] || CATEGORY_IMAGES['Artist Submissions']}
                      audioUrl={sub.audioFile ? pb.files.getURL(sub, sub.audioFile) : null}
                      playlist={currentPlaylist}
                      extraInfo={
                        <div className="text-xs text-muted-foreground space-y-1">
                          {sub.instagramHandle && <p>IG: {sub.instagramHandle}</p>}
                        </div>
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </>
  );
};

export default ArtistSubmissionPage;
