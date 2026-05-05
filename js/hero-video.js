(function () {
var videoSources = [
    "video/car4.mp4",
    "video/car2.mp4",
    "video/car3.mp4",
    "video/car5.mp4",
    "video/car7.mp4",
    "video/car8.mp4"
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
    console.log("Crossfading to video " + (currentVideoIndex + 1) + ": " + videoSources[currentVideoIndex]);

    nextVideo.src = videoSources[currentVideoIndex];
    nextVideo.load();
    nextVideo.playbackRate = PLAYBACK_RATE;

    nextVideo.oncanplay = function () {
        nextVideo.oncanplay = null;
        nextVideo.play().then(function () {
            nextVideo.classList.add("active");
            activeVideo.classList.remove("active");

            setTimeout(function () {
                var temp = activeVideo;
                activeVideo = nextVideo;
                nextVideo = temp;

                nextVideo.pause();
                nextVideo.removeAttribute("src");
                nextVideo.load();

                startClipTimer();
            }, FADE_DURATION + 100);
        }).catch(function (err) {
            console.warn("Video play failed:", err);
        });
    };
}

videoA.addEventListener("ended", function () {
    if (activeVideo === videoA) {
        crossfadeToNext();
    }
});

videoB.addEventListener("ended", function () {
    if (activeVideo === videoB) {
        crossfadeToNext();
    }
});

[videoA, videoB].forEach(function(v) {
    v.addEventListener("loadedmetadata", function () {
        v.playbackRate = PLAYBACK_RATE;
    });
    v.addEventListener("ratechange", function () {
        if (v.playbackRate !== PLAYBACK_RATE) {
            v.playbackRate = PLAYBACK_RATE;
        }
    });
});

videoA.src = videoSources[0];
playedIndices.push(0);
videoA.load();
videoA.playbackRate = PLAYBACK_RATE;
videoA.play().then(function () {
    startClipTimer();
}).catch(function (err) {
    console.warn("Initial video play failed:", err);
    document.addEventListener("click", function handler() {
        videoA.play();
        document.removeEventListener("click", handler);
    }, { once: true });
});

console.log("AB Autoz Hero Video: Initialized crossfade with " + videoSources.length + " videos, playbackRate=" + PLAYBACK_RATE);
})();
