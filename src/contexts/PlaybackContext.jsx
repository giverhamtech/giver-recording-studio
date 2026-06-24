
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase.js';

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

  const supportsMediaSession = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  const updateMediaSessionPositionState = useCallback((position, trackDuration, playbackRate = 1) => {
    if (!supportsMediaSession || typeof navigator.mediaSession.setPositionState !== 'function') return;

    const safeDuration = Number.isFinite(trackDuration) && trackDuration > 0 ? trackDuration : 0;
    const safePosition = Number.isFinite(position) && position >= 0 ? position : 0;

    if (safeDuration <= 0) {
      try {
        navigator.mediaSession.setPositionState();
      } catch {
        // iOS/Safari may throw on unsupported state updates.
      }
      return;
    }

    try {
      navigator.mediaSession.setPositionState({
        duration: safeDuration,
        playbackRate,
        position: Math.min(safePosition, safeDuration)
      });
    } catch {
      // Keep playback resilient if browser has partial Media Session support.
    }
  }, [supportsMediaSession]);

  const updateMediaSessionPlaybackState = useCallback((playing) => {
    if (!supportsMediaSession) return;
    try {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch {
      // Ignore unsupported playbackState assignment.
    }
  }, [supportsMediaSession]);

  const updateMediaSessionMetadata = useCallback((track) => {
    if (!supportsMediaSession || typeof MediaMetadata === 'undefined') return;

    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }

    const toAbsoluteUrl = (value) => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
      if (typeof window === 'undefined') return value;
      try {
        return new URL(value, window.location.origin).toString();
      } catch {
        return value;
      }
    };

    const artworkSrc = toAbsoluteUrl(track.artwork);
    const artwork = artworkSrc
      ? [
          { src: artworkSrc, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '384x384', type: 'image/jpeg' },
          { src: artworkSrc, sizes: '512x512', type: 'image/jpeg' }
        ]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Track',
      artist: track.artist || 'Giver Recording Studio',
      album: track.album || track.category || 'Giver Recording Studio',
      artwork
    });
  }, [supportsMediaSession]);

  const resetPlaybackState = useCallback(() => {
    setCurrentTrack(null);
    setQueueState([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setPlaybackStatus('idle');
    setCurrentTime(0);
    setDuration(0);
    setIsPlayerVisible(false);
    setIsMinimized(false);
    originalQueue.current = [];
  }, []);

  const stopAudio = useCallback((clearState = false) => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }

    if (clearState) {
      resetPlaybackState();
      updateMediaSessionMetadata(null, 0);
    } else {
      setIsPlaying(false);
      setPlaybackStatus('paused');
      setCurrentTime(0);
      setDuration(0);
    }
  }, [resetPlaybackState, updateMediaSessionMetadata]);

  useEffect(() => {
    const existingAudio = typeof window !== 'undefined' ? window.__giverStudioAudio : null;
    if (existingAudio) {
      existingAudio.pause();
      existingAudio.removeAttribute('src');
      existingAudio.load();
    }

    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    if (typeof window !== 'undefined') {
      window.__giverStudioAudio = audio;
    }

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(nextDuration);
      setCurrentTrack((prev) => (prev ? { ...prev, duration: nextDuration } : prev));
      updateMediaSessionPositionState(audio.currentTime, nextDuration, audio.playbackRate || 1);
    };
    const onPlaying = () => { setIsPlaying(true); setPlaybackStatus('playing'); };
    const onPause = () => { setIsPlaying(false); setPlaybackStatus('paused'); };
    const onWaiting = () => setPlaybackStatus('buffering');
    const onEmptied = () => {
      setCurrentTime(0);
      setDuration(0);
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('emptied', onEmptied);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('emptied', onEmptied);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();

      if (typeof window !== 'undefined' && window.__giverStudioAudio === audio) {
        delete window.__giverStudioAudio;
      }
    };
  }, [stopAudio, updateMediaSessionPositionState]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const incrementPlayCount = useCallback(async (songId) => {
    try {
      // Optional analytics; ignore if table/column or RLS prevents updates.
      // Update playCount if the column exists; otherwise no-op.
      if (!songId) return;
      const { error } = await supabase
        .from('beats')
        .update({ playCount: 0 })
        .eq('id', songId);

      if (error) {
        // ignore
      }
    } catch {
      // ignore
    }
  }, []);

  const playTrackFromQueue = useCallback((index) => {
    if (index < 0 || index >= queue.length) return;
    const track = queue[index];
    const audio = audioRef.current;
    if (!audio || !track?.url) return;

    setCurrentIndex(index);
    setCurrentTrack(track);
    setCurrentTime(0);
    setPlaybackStatus('buffering');

    audio.pause();
    audio.src = track.url;
    audio.load();
    audio.play().catch(e => {
      console.error("Playback failed:", e);
      setPlaybackStatus('paused');
      setIsPlaying(false);
    });

    incrementPlayCount(track.id);
    setIsPlayerVisible(true);
  }, [incrementPlayCount, queue]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(e => console.error(e));
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      updateMediaSessionPositionState(time, duration, audioRef.current.playbackRate || 1);
    }
  }, [duration, updateMediaSessionPositionState]);

  const seekBy = useCallback((offset) => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = Math.max(0, Math.min((audio.currentTime || 0) + offset, Number.isFinite(audio.duration) ? audio.duration : Number.MAX_SAFE_INTEGER));
    seek(targetTime);
  }, [seek]);

  const setVolume = useCallback((val) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
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
  }, [currentIndex, currentTrack, pause, playTrackFromQueue, queue.length, repeatMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onEnded = () => next();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [next]);

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

  const previous = useCallback(() => {
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
  }, [currentIndex, currentTime, currentTrack, playTrackFromQueue, queue.length, seek]);

  useEffect(() => {
    updateMediaSessionMetadata(currentTrack);
  }, [currentTrack, duration, updateMediaSessionMetadata]);

  useEffect(() => {
    updateMediaSessionPlaybackState(isPlaying);
    updateMediaSessionPositionState(currentTime, duration, audioRef.current?.playbackRate || 1);
  }, [currentTime, duration, isPlaying, updateMediaSessionPlaybackState, updateMediaSessionPositionState]);

  useEffect(() => {
    if (!supportsMediaSession) return;

    const safeSetHandler = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Some browsers throw for unsupported actions.
      }
    };

    safeSetHandler('play', () => resume());
    safeSetHandler('pause', () => pause());
    safeSetHandler('previoustrack', () => previous());
    safeSetHandler('nexttrack', () => next());
    safeSetHandler('seekbackward', (details) => seekBy(-(details?.seekOffset || 10)));
    safeSetHandler('seekforward', (details) => seekBy(details?.seekOffset || 10));

    return () => {
      safeSetHandler('play', null);
      safeSetHandler('pause', null);
      safeSetHandler('previoustrack', null);
      safeSetHandler('nexttrack', null);
      safeSetHandler('seekbackward', null);
      safeSetHandler('seekforward', null);
    };
  }, [next, pause, previous, resume, seekBy, supportsMediaSession]);

  const toggleMinimize = () => setIsMinimized(!isMinimized);
  const closePlayer = () => {
    stopAudio(true);
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
