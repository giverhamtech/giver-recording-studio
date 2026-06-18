
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import pb from '@/lib/firebaseClient.js';

const PlaybackContext = createContext();

export const usePlayback = () => useContext(PlaybackContext);

export const PlaybackProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueueState] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState('idle'); // idle, playing, paused, buffering
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [repeatMode, setRepeatModeState] = useState('off'); // off, one, all
  const [shuffle, setShuffle] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const audioRef = useRef(null);
  const originalQueue = useRef([]);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onPlaying = () => { setIsPlaying(true); setPlaybackStatus('playing'); };
    const onPause = () => { setIsPlaying(false); setPlaybackStatus('paused'); };
    const onWaiting = () => setPlaybackStatus('buffering');

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const next = useCallback(() => {
    if (queue.length === 0 || !currentTrack) return;
    
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    let nextIdx = currentIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        pause();
        return;
      }
    }
    playTrackFromQueue(nextIdx);
  }, [queue, currentIndex, currentTrack, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onEnded = () => next();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [next]);

  const incrementPlayCount = async (songId) => {
    try {
      if(songId) {
        await pb.collection('songs').update(songId, { "playCount+": 1 }, { $autoCancel: false });
      }
    } catch (error) {
      // Ignore permission denied on play count
    }
  };

  const playTrackFromQueue = (index) => {
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    setCurrentIndex(index);
    setCurrentTrack(track);
    setCurrentTime(0);
    setPlaybackStatus('buffering');
    
    audioRef.current.src = track.url;
    audioRef.current.play().catch(e => {
      console.error("Playback failed:", e);
      setPlaybackStatus('paused');
      setIsPlaying(false);
    });

    incrementPlayCount(track.id);
    setIsPlayerVisible(true);
  };

  const setQueue = (tracks) => {
    setQueueState(tracks);
    originalQueue.current = tracks;
  };

  const play = (track, newQueue = null) => {
    if (newQueue) {
      setQueueState(newQueue);
      originalQueue.current = newQueue;
      const idx = newQueue.findIndex(t => t.id === track.id);
      playTrackFromQueue(idx !== -1 ? idx : 0);
    } else {
      const idx = queue.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        if (currentTrack?.id === track.id) {
          resume();
        } else {
          playTrackFromQueue(idx);
        }
      } else {
        // Play single track without replacing whole queue if not provided, just append
        const newQ = [track];
        setQueueState(newQ);
        originalQueue.current = newQ;
        playTrackFromQueue(0);
      }
    }
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const resume = () => {
    audioRef.current?.play().catch(e => console.error(e));
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (val) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleRepeat = () => {
    const modes = ['off', 'one', 'all'];
    setRepeatModeState(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    
    if (newShuffle && queue.length > 0) {
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      // Keep current track at index 0
      const currentIdx = shuffled.findIndex(t => t.id === currentTrack?.id);
      if (currentIdx > -1) {
        const temp = shuffled[0];
        shuffled[0] = shuffled[currentIdx];
        shuffled[currentIdx] = temp;
      }
      setQueueState(shuffled);
      setCurrentIndex(0);
    } else if (!newShuffle && originalQueue.current.length > 0) {
      setQueueState(originalQueue.current);
      const idx = originalQueue.current.findIndex(t => t.id === currentTrack?.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    }
  };

  const previous = () => {
    if (queue.length === 0 || !currentTrack) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    playTrackFromQueue(prevIdx);
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const closePlayer = () => {
    pause();
    setIsPlayerVisible(false);
  };

  const value = {
    currentTrack,
    currentSong: currentTrack, // Backward compatibility
    queue,
    currentIndex,
    isPlaying,
    playbackStatus,
    currentTime,
    playbackPosition: currentTime, // Backward compatibility
    duration,
    volume,
    repeatMode,
    shuffle,
    isPlayerVisible,
    isMinimized,
    play,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    changeVolume: setVolume, // Backward compatibility
    toggleRepeat,
    setRepeatMode: setRepeatModeState, // Backward compatibility
    toggleShuffle,
    setShuffleMode: toggleShuffle, // Backward compatibility
    setQueue,
    toggleMinimize,
    closePlayer
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
};
