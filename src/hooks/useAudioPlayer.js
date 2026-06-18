
import { usePlayback } from '@/contexts/PlaybackContext.jsx';

export const useAudioPlayer = (audioUrl) => {
  const playback = usePlayback();
  
  const isPlayingLocal = playback.currentTrack?.url === audioUrl && playback.isPlaying;
  
  const togglePlayPause = () => {
    if (isPlayingLocal) {
      playback.pause();
    } else {
      playback.play({ url: audioUrl });
    }
  };

  const seek = (time) => {
    if (playback.currentTrack?.url === audioUrl) {
      playback.seek(time);
    }
  };

  const changeVolume = (newVolume) => {
    playback.setVolume(newVolume);
  };

  return {
    isPlaying: isPlayingLocal,
    currentTime: playback.currentTrack?.url === audioUrl ? playback.currentTime : 0,
    duration: playback.currentTrack?.url === audioUrl ? playback.duration : 0,
    volume: playback.volume,
    togglePlayPause,
    seek,
    changeVolume
  };
};
