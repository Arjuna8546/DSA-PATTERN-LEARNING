import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const VIDEO_ID = 'sjkrrmBnpGE'

let apiPromise = null
function loadYouTubeAPI() {
    if (apiPromise) return apiPromise
    apiPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve(window.YT)
            return
        }
        const prevCallback = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prevCallback === 'function') prevCallback()
            resolve(window.YT)
        }
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            document.head.appendChild(tag)
        }
    })
    return apiPromise
}

// Mount this once at the App root (sibling of <Routes>) so playback
// survives navigation. The toggle button only renders on the "/" route.
export default function MusicPlayer() {
    const location = useLocation()
    const mountRef = useRef(null)
    const playerRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isReady, setIsReady] = useState(false)

    const showButton = location.pathname === '/'

    useEffect(() => {
        let cancelled = false

        loadYouTubeAPI().then((YT) => {
            if (cancelled || playerRef.current || !mountRef.current) return
            playerRef.current = new YT.Player(mountRef.current, {
                videoId: VIDEO_ID,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    modestbranding: 1,
                    fs: 0,
                    rel: 0,
                    playsinline: 1,
                    loop: 1,
                    playlist: VIDEO_ID, // required by YouTube for loop:1 to work on a single video
                },
                events: {
                    onReady: () => setIsReady(true),
                    onStateChange: (e) => {
                        if (e.data === YT.PlayerState.PLAYING) setIsPlaying(true)
                        else if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false)
                        // ENDED isn't handled here on purpose — loop:1 restarts it internally
                    },
                },
            })
        })

        return () => {
            cancelled = true
            // no destroy here — this component stays mounted for the app's lifetime
        }
    }, [])

    const toggle = () => {
        const player = playerRef.current
        if (!player || !isReady) return
        if (isPlaying) {
            player.pauseVideo()
        } else {
            player.playVideo()
        }
    }

    return (
        <>
            {/* Video is present only so the YouTube API can stream audio; kept off-screen and non-interactive */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                }}
            >
                <div ref={mountRef} />
            </div>

            {showButton && (
                <button
                    type="button"
                    onClick={toggle}
                    disabled={!isReady}
                    aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
                    title={isPlaying ? 'Pause music' : 'Play music'}
                    className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-signal-amber text-ink-950 shadow-lg shadow-black/25 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
            )}
        </>
    )
}

function PlayIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.74l-11-6.86A1 1 0 0 0 8 5.14Z" />
        </svg>
    )
}

function PauseIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4.5" height="14" rx="1" />
            <rect x="13.5" y="5" width="4.5" height="14" rx="1" />
        </svg>
    )
}