
import { getFormatError } from './audioFormatValidator.js';

export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const extractDuration = (file) => {
  return new Promise((resolve) => {
    // Using Web Audio API / HTMLAudioElement to parse duration
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve(0); // Fallback if format cannot be parsed by browser
    });
  });
};

export const validateAudioFormat = (file) => {
  const error = getFormatError(file);
  return { isValid: !error, error };
};

export const extractMetadata = async (file) => {
  const duration = await extractDuration(file);
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  
  return {
    duration,
    formattedDuration: formatDuration(duration),
    fileName: file.name,
    title: nameWithoutExt,
    size: file.size,
    mimeType: file.type || 'audio/unknown'
  };
};
