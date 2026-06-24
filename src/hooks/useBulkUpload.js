
import { useState, useCallback } from 'react';
import pb from '@/lib/firebaseClient.js';
import useLastCategory from './useLastCategory.js';
import { useDuplicateDetection } from './useDuplicateDetection.js';

const SUPPORTED_AUDIO_EXT = /\.(mp3|wav|m4a|aac|flac|ogg)$/i;
const isSupportedAudioFile = (file) => {
  if (!file) return false;
  return file.type.startsWith('audio/') || SUPPORTED_AUDIO_EXT.test(file.name || '');
};

const getAudioDuration = (file) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
    audio.addEventListener('error', () => {
      resolve(0);
      URL.revokeObjectURL(url);
    });
  });
};

const useBulkUpload = (collectionName = 'beats') => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [skippedFiles, setSkippedFiles] = useState([]);
  const { getLastCategory, setLastCategory } = useLastCategory();
  const [selectedCategory, setSelectedCategory] = useState(getLastCategory() || '');
  
  const { checkForDuplicate } = useDuplicateDetection();

  const addFiles = useCallback(async (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => 
      isSupportedAudioFile(file)
    );

    const fileObjects = await Promise.all(validFiles.map(async (file) => {
      const duration = await getAudioDuration(file);
      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        duration,
        progress: 0,
        status: 'idle', // idle, checking, uploading, success, error, skipped
        error: null
      };
    }));

    setFiles(prev => [...prev, ...fileObjects]);
  }, []);

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setUploadedRecords([]);
    setFailedUploads([]);
    setSkippedFiles([]);
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLastCategory(category);
  };

  const uploadFiles = async (extraData = {}) => {
    if (!selectedCategory && collectionName !== 'productions') throw new Error('Please select a category first.');
    if (files.length === 0) throw new Error('No files to upload.');
    
    setIsUploading(true);
    const newUploadedRecords = [];
    const newFailedUploads = [];
    const newSkippedFiles = [];
    let uploadedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      if (fileObj.status === 'success' || fileObj.status === 'skipped') continue;

      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'checking' } : f));
      
      const title = fileObj.name.replace(/\.[^/.]+$/, ""); // Remove extension

      // 1. Check for duplicates
      const { isDuplicate, reason } = await checkForDuplicate(title, fileObj.file);
      
      if (isDuplicate) {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'skipped', error: `Skipped: ${reason}`, progress: 100 } : f));
        newSkippedFiles.push({ file: fileObj, reason });
        skippedCount++;
        continue;
      }

      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 10 } : f));

      try {
        const formData = new FormData();
        formData.append('title', title);
        
        if (collectionName === 'beats') {
          formData.append('category', selectedCategory);
          formData.append('mp3_file', fileObj.file);
        } else if (collectionName === 'productions') {
          formData.append('genre', selectedCategory || 'Instrumentals');
          formData.append('audioFile', fileObj.file);
          formData.append('artist', extraData.artist || 'Unknown Artist');
        }

        // Simulate progress for visual feedback
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === fileObj.id && f.progress < 90) {
              return { ...f, progress: f.progress + 15 };
            }
            return f;
          }));
        }, 150);

        const record = await pb.collection(collectionName).create(formData, { $autoCancel: false });
        
        clearInterval(progressInterval);

        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f));
        newUploadedRecords.push(record);
        uploadedCount++;

      } catch (error) {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f));
        newFailedUploads.push({ file: fileObj, error: error.message });
      }
    }

    setUploadedRecords(prev => [...prev, ...newUploadedRecords]);
    setFailedUploads(prev => [...prev, ...newFailedUploads]);
    setSkippedFiles(prev => [...prev, ...newSkippedFiles]);
    setIsUploading(false);

    return {
      uploadedCount,
      skippedCount,
      skippedFiles: newSkippedFiles
    };
  };

  return {
    files,
    isUploading,
    uploadedRecords,
    failedUploads,
    skippedFiles,
    selectedCategory,
    handleCategoryChange,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    setUploadedRecords
  };
};

export default useBulkUpload;
