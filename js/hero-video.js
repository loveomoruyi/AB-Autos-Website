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
var MIN_VIDEOS_BEFORE_REPEAT = 5;
var currentVideoIndex = 0;
var playedIndices = [];
var clipTimer = null;

var videoA = document.getElementById("hero-video-a");
var videoB = document.getElementById("hero-video-b");

if (!videoA || !videoB) return;

var activeVideo = videoA;
var nextVideo = videoB;

[videoA, videoB].forEach(function(v) {
    v.removeAttribute("loop");
    v.playbackRate = PLAYBACK_RATE;
    v.muted = true;
    v.playsInline = true;
});

function getNextVideoIndex() {
    if (playedIndices.length >= videoSources.length) {
        playedIndices = [];
    }
    var nextIndex = (currentVideoIndex + 1) % videoSources.length;
    var attempts = 0;
    while (playedIndices.indexOf(nextIndex) !== -1 && attempts < videoSources.length) {
        nextIndex = (nextIndex + 1) % videoSources.length;
        attempts++;
    }
    return nextIndex;
}

function startClipTimer() {
    clearTimeout(clipTimer);
    var clipDuration = MAX_CLIP_DURATION;
    if (videoSources[currentVideoIndex].indexOf("car7") !== -1) {
        clipDuration = 8;
    }
    var realDuration = clipDuration / PLAYBACK_RATE;
    clipTimer = setTimeout(function () {
        if (!activeVideo.paused && !activeVideo.ended) {
            crossfadeToNext();
        }
    }, realDuration * 1000);
}

function crossfadeToNext() {
    clearTimeout(clipTimer);
    var nextIndex = getNextVideoIndex();
    currentVideoIndex = nextIndex;
    playedIndices.push(currentVideoIndex);

    nextVideo.src = videoSources[currentVideoIndex];
    nextVideo.load();
    nextVideo.playbackRate = PLAYBACK_RATE;

    nextVideo.oncanplay = function () {
        nextVideo.oncanplay = null;
        nextVideo.play().then(function () {
            nextVideo.style.visibility = "visible";
            nextVideo.classList.add("active");
            activeVideo.classList.remove("active");

            setTimeout(function () {
                activeVideo.pause();
                activeVideo.style.visibility = "hidden";
                activeVideo.removeAttribute("src");
                activeVideo.load();

                var temp = activeVideo;
                activeVideo = nextVideo;
                nextVideo = temp;

                startClipTimer();
            }, FADE_DURATION + 100);
        }).catch(function(e) {
            console.warn("Crossfade play failed:", e);
        });
    };
}

// INITIALIZATION - Do NOT re-set src, HTML already has car4.mp4 loaded
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
