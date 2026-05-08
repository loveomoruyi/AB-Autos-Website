(function () {
var videoSources = [
    "video/car4.mp4",
    "video/car3.mp4",
    "video/car5.mp4",
    "video/car8.mp4",
    "video/car1.mp4",
    "video/car13.mp4"
];

var PLAYBACK_RATE = 0.55;
var MAX_CLIP_DURATION = 12;
var FADE_DURATION = 1500;
var currentVideoIndex = 0;
var playedIndices = [];
var clipTimer = null;
var transitionInProgress = false;

var videoA = document.getElementById("hero-video-a");
var videoB = document.getElementById("hero-video-b");

if (!videoA || !videoB) return;

var activeVideo = videoA;
var nextVideo = videoB;

// Only set playbackRate - don't touch muted/playsinline attributes 
// as Chrome needs the HTML muted attribute for autoplay policy
videoA.playbackRate = PLAYBACK_RATE;
videoB.playbackRate = PLAYBACK_RATE;

function getNextVideoIndex() {
    var nextIndex = (currentVideoIndex + 1) % videoSources.length;
    return nextIndex;
}

function startClipTimer() {
    clearTimeout(clipTimer);
    var realDuration = MAX_CLIP_DURATION / PLAYBACK_RATE;
    clipTimer = setTimeout(function () {
        if (!activeVideo.paused && !activeVideo.ended && !transitionInProgress) {
            crossfadeToNext();
        }
    }, realDuration * 1000);
}

function crossfadeToNext() {
    if (transitionInProgress) return;
    transitionInProgress = true;
    clearTimeout(clipTimer);

    var nextIndex = getNextVideoIndex();
    currentVideoIndex = nextIndex;

    nextVideo.src = videoSources[currentVideoIndex];
    nextVideo.load();
    nextVideo.playbackRate = PLAYBACK_RATE;

    var loadTimeout = setTimeout(function() {
        console.warn("Video load timeout, restarting active video");
        transitionInProgress = false;
        nextVideo.removeAttribute("src");
        activeVideo.currentTime = 0;
        activeVideo.play().catch(function(){});
        startClipTimer();
    }, 5000);

    nextVideo.onerror = function() {
        clearTimeout(loadTimeout);
        console.warn("Video load error for " + videoSources[currentVideoIndex] + ", skipping");
        transitionInProgress = false;
        nextVideo.removeAttribute("src");
        setTimeout(function() {
            crossfadeToNext();
        }, 500);
    };

    nextVideo.oncanplay = function () {
        clearTimeout(loadTimeout);
        nextVideo.oncanplay = null;
        nextVideo.onerror = null;

        nextVideo.play().then(function () {
            nextVideo.style.visibility = "visible";
            nextVideo.classList.add("active");
            activeVideo.classList.remove("active");

            setTimeout(function () {
                activeVideo.pause();
                activeVideo.style.visibility = "hidden";
                activeVideo.removeAttribute("src");

                var temp = activeVideo;
                activeVideo = nextVideo;
                nextVideo = temp;

                transitionInProgress = false;
                startClipTimer();
            }, FADE_DURATION + 100);
        }).catch(function(e) {
            console.warn("Crossfade play failed:", e);
            clearTimeout(loadTimeout);
            transitionInProgress = false;
            activeVideo.currentTime = 0;
            activeVideo.play().catch(function(){});
            startClipTimer();
        });
    };
}

playedIndices.push(0);

function enableTransitions() {
    videoA.classList.add("fade-ready");
    videoB.classList.add("fade-ready");
}

videoA.play().then(function () {
    startClipTimer();
    setTimeout(enableTransitions, 200);
}).catch(function (err) {
    console.warn("Initial video play failed:", err);
    setTimeout(enableTransitions, 1000);
    document.addEventListener("click", function handler() {
        videoA.play().then(function() { startClipTimer(); });
        document.removeEventListener("click", handler);
    }, { once: true });
});

})();
