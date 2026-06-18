
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.aiff', '.wma'];

export const getSupportedFormats = () => SUPPORTED_EXTENSIONS;

export const getFormatError = (file) => {
  if (!file) return 'No file provided';
  
  const name = file.name.toLowerCase();
  const ext = name.substring(name.lastIndexOf('.'));
  
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return `Unsupported format (${ext}). Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size is 20MB.`;
  }
  
  // Note: MIME type validation can be unreliable across different browsers for exotic audio formats,
  // so we rely primarily on extension and size, with a loose check on type.
  if (file.type && !file.type.startsWith('audio/') && !file.type.startsWith('video/mp4')) {
    // Some .m4a files are identified as video/mp4. We warn but don't strictly block if extension matches.
    console.warn(`Unexpected MIME type for audio file: ${file.type}`);
  }

  return null;
};

export const validateAudioFile = (file) => {
  const error = getFormatError(file);
  return {
    isValid: !error,
    error
  };
};
