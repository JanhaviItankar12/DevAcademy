import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Lock } from 'lucide-react';

// Custom Video Player Component
const CustomVideoPlayer = ({ 
    src, 
    lectureId, 
    courseId,
    onProgressUpdate, 
    onEnded,
    isCompleted,
    lastWatchedTime = 0,
    videoLength = 0,
    refetchProgress
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [lastValidTime, setLastValidTime] = useState(lastWatchedTime);
    const [watchedSegments, setWatchedSegments] = useState([]);
    const [segmentStartTime, setSegmentStartTime] = useState(null);
    const [showSkipWarning, setShowSkipWarning] = useState(false);

    // Initialize with last watched time
    useEffect(() => {
        if (videoRef.current && lastWatchedTime > 0) {
            videoRef.current.currentTime = lastWatchedTime;
            setCurrentTime(lastWatchedTime);
            setLastValidTime(lastWatchedTime);
        }
    }, [lastWatchedTime]);

    // Track when video starts playing to start a segment
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            setIsPlaying(true);
            setSegmentStartTime(video.currentTime);
        };

        const handlePause = () => {
            setIsPlaying(false);
            if (segmentStartTime !== null) {
                const segment = {
                    startTime: segmentStartTime,
                    endTime: video.currentTime,
                    duration: video.currentTime - segmentStartTime
                };
                saveSegment(segment);
                setSegmentStartTime(null);
            }
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [segmentStartTime]);

    // Handle time updates and prevent skipping
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const time = Math.floor(video.currentTime);
            setCurrentTime(time);
            
            // Prevent skipping ahead more than 10 seconds from last valid time
            if (time > lastValidTime + 10) {
                video.currentTime = lastValidTime;
                setShowSkipWarning(true);
                setTimeout(() => setShowSkipWarning(false), 3000);
                
                // Log skip attempt to backend
                logSkipAttempt(lastValidTime, time);
                
                toast.error("Please watch sequentially. Skipping ahead is not allowed.");
            } else {
                setLastValidTime(time);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            if (videoLength === 0 && video.duration > 0) {
                // Update video length if not provided
                updateVideoLength(video.duration);
            }
        };

        const handleWaiting = () => setBuffering(true);
        const handleCanPlay = () => setBuffering(false);
        const handleEnded = () => {
            setIsPlaying(false);
            if (segmentStartTime !== null) {
                const segment = {
                    startTime: segmentStartTime,
                    endTime: duration,
                    duration: duration - segmentStartTime
                };
                saveSegment(segment);
                setSegmentStartTime(null);
            }
            onEnded();
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('ended', handleEnded);
        };
    }, [lastValidTime, segmentStartTime, duration, videoLength, onEnded]);

    // Save watched segment to backend
    const saveSegment = useCallback(async (segment) => {
        if (segment.duration < 2) return; // Ignore segments less than 2 seconds
        
        try {
            await updateLectureProgress({
                courseId,
                lectureId,
                body: { 
                    segment,
                    totalWatchedTime: currentTime,
                    videoLength: duration
                }
            }).unwrap();
            
            // Update local watched segments
            setWatchedSegments(prev => [...prev, segment]);
        } catch (error) {
            console.error('Error saving segment:', error);
        }
    }, [courseId, lectureId, currentTime, duration]);

    // Log skip attempts to backend
    const logSkipAttempt = useCallback(async (fromTime, toTime) => {
        try {
            await updateLectureProgress({
                courseId,
                lectureId,
                body: { 
                    skipAttempt: { fromTime, toTime, blocked: true }
                }
            }).unwrap();
        } catch (error) {
            console.error('Error logging skip attempt:', error);
        }
    }, [courseId, lectureId]);

    // Update video length in backend
    const updateVideoLength = useCallback(async (length) => {
        try {
            await updateLectureProgress({
                courseId,
                lectureId,
                body: { videoLength: length }
            }).unwrap();
        } catch (error) {
            console.error('Error updating video length:', error);
        }
    }, [courseId, lectureId]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(error => {
                console.error('Error playing video:', error);
                toast.error('Failed to play video');
            });
        } else {
            video.pause();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.muted) {
            video.muted = false;
            setIsMuted(false);
            setVolume(1);
        } else {
            video.muted = true;
            setIsMuted(true);
            setVolume(0);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const calculateWatchedPercentage = () => {
        if (duration === 0) return 0;
        
        // Calculate total watched time from segments
        const totalWatched = watchedSegments.reduce((sum, segment) => sum + segment.duration, 0);
        return (totalWatched / duration) * 100;
    };

    const watchedPercentage = calculateWatchedPercentage();

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-black"
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full h-full"
                preload="metadata"
                onClick={togglePlay}
                onContextMenu={(e) => {
                    e.preventDefault();
                    toast.error("Right-click is disabled to prevent skipping");
                }}
                playsInline
            />
            
            {/* Skip Warning */}
            {showSkipWarning && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                    <div className="flex items-center gap-2">
                        <Lock size={16} />
                        <span>Skipping ahead is not allowed</span>
                    </div>
                </div>
            )}
            
            {/* Progress Indicator */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(watchedPercentage)}% watched
            </div>
            
            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transition-opacity duration-300">
                {/* Progress Bar (View Only) */}
                <div 
                    className="mb-4 h-1.5 bg-gray-700 rounded-full overflow-hidden cursor-not-allowed relative"
                    title="Progress tracking enabled - seeking disabled"
                >
                    {/* Total watched segments */}
                    {watchedSegments.map((segment, index) => (
                        <div 
                            key={index}
                            className="absolute h-full bg-green-500"
                            style={{
                                left: `${(segment.startTime / duration) * 100}%`,
                                width: `${((segment.endTime - segment.startTime) / duration) * 100}%`
                            }}
                        />
                    ))}
                    
                    {/* Current playback position */}
                    <div 
                        className="absolute h-full w-1 bg-white -ml-0.5"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause Button */}
                        <button
                            onClick={togglePlay}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            disabled={buffering}
                        >
                            {buffering ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                                <Pause size={20} className="text-white" />
                            ) : (
                                <Play size={20} className="text-white" />
                            )}
                        </button>
                        
                        {/* Time Display */}
                        <div className="text-white text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Volume Control */}
                        <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX size={20} className="text-white" />
                            ) : (
                                <Volume2 size={20} className="text-white" />
                            )}
                        </button>
                        
                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            {isFullscreen ? (
                                <Minimize size={20} className="text-white" />
                            ) : (
                                <Maximize size={20} className="text-white" />
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Completion Status */}
                {isCompleted ? (
                    <div className="mt-3 text-center">
                        <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-1 rounded-full text-sm">
                            ✓ Lecture Completed
                        </div>
                    </div>
                ) : (
                    <div className="mt-3 text-center">
                        <div className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-1 rounded-full text-sm">
                            <Lock size={14} />
                            Watch {Math.max(0, 95 - Math.round(watchedPercentage))}% more to complete
                        </div>
                    </div>
                )}
            </div>
            
            {/* Buffering Indicator */}
            {buffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-lg">Buffering...</div>
                </div>
            )}
            
            {/* Disable right-click context menu */}
            <div 
                className="absolute inset-0"
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>
    );
};