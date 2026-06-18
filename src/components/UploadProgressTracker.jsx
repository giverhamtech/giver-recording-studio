
import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, FileAudio, Clock, AlertTriangle, Search } from 'lucide-react';

const UploadProgressTracker = ({ files }) => {
  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'success').length;
  const failedFiles = files.filter(f => f.status === 'error').length;
  const skippedFiles = files.filter(f => f.status === 'skipped').length;
  
  const overallProgress = totalFiles === 0 ? 0 : Math.round((files.reduce((acc, f) => acc + f.progress, 0) / (totalFiles * 100)) * 100);

  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Uploading Batch</h3>
          <p className="text-muted-foreground mt-1 flex flex-wrap gap-2 items-center">
            <span>{completedFiles} of {totalFiles} uploaded</span>
            {skippedFiles > 0 && <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-sm">({skippedFiles} duplicates skipped)</span>}
            {failedFiles > 0 && <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded text-sm">({failedFiles} failed)</span>}
          </p>
        </div>
        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          {overallProgress}%
        </div>
      </div>

      <div className="w-full h-4 bg-muted rounded-full overflow-hidden shadow-inner">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out relative"
          style={{ width: `${overallProgress}%` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripe_1s_linear_infinite]"></div>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {files.map((file) => (
          <div key={file.id} className={`p-4 rounded-lg border transition-colors ${
            file.status === 'skipped' ? 'bg-amber-500/5 border-amber-500/20' : 
            'bg-background border-border/50'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileAudio className={`w-5 h-5 shrink-0 ${file.status === 'skipped' ? 'text-amber-500/60' : 'text-primary/60'}`} />
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              </div>
              <div className="shrink-0 flex items-center gap-3 ml-4">
                <span className="text-xs font-semibold tabular-nums">{file.progress}%</span>
                {file.status === 'idle' && <Clock className="w-4 h-4 text-muted-foreground" />}
                {file.status === 'checking' && <Search className="w-4 h-4 text-accent animate-pulse" />}
                {file.status === 'uploading' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {file.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {file.status === 'skipped' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                {file.status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
              </div>
            </div>
            
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  file.status === 'success' ? 'bg-green-500' : 
                  file.status === 'error' ? 'bg-destructive' : 
                  file.status === 'skipped' ? 'bg-amber-500' :
                  file.status === 'checking' ? 'bg-accent' :
                  'bg-primary'
                }`} 
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
            
            {file.error && (
              <p className={`text-xs mt-2 ${file.status === 'skipped' ? 'text-amber-600 dark:text-amber-400' : 'text-destructive'}`}>
                {file.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgressTracker;
