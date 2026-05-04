(function () {
  // Bentley interior first (smoothest slow-mo), car1 removed (stuttering)
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
  var FADE_DURATION = 1200;
  var MIN_VIDEOS_BEFORE_REPEAT = 5;
  var currentVideoIndex = 0;
  var playedIndices = [];
  var heroVideo = document.getElementById("hero-video");
  var clipTimer = null;

  if (!heroVideo) return;

  heroVideo.removeAttribute("loop");
  heroVideo.loop = false;
  heroVideo.playbackRate = PLAYBACK_RATE;
  heroVideo.muted = true;
  heroVideo.playsInline = true;
  heroVideo.style.opacity = "1";

  function getNextVideoIndex() {
    if (playedIndices.length >= MIN_VIDEOS_BEFORE_REPEAT) {
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

  function fadeOut(callback) {
    heroVideo.style.transition = "opacity " + FADE_DURATION + "ms ease";
    heroVideo.style.opacity = "0";
    setTimeout(callback, FADE_DURATION);
  }

  function fadeIn() {
    heroVideo.style.transition = "opacity " + FADE_DURATION + "ms ease";
    heroVideo.style.opacity = "1";
  }

  function playNextVideo() {
    clearTimeout(clipTimer);
    var nextIndex = getNextVideoIndex();
    currentVideoIndex = nextIndex;
    playedIndices.push(currentVideoIndex);
    console.log("Switching to video " + (currentVideoIndex + 1) + ": " + videoSources[currentVideoIndex]);

    fadeOut(function () {
      heroVideo.src = videoSources[currentVideoIndex];
      heroVideo.load();
      heroVideo.playbackRate = PLAYBACK_RATE;
      heroVideo.oncanplay = function () {
        heroVideo.oncanplay = null;
        heroVideo.play().then(function () {
          fadeIn();
        }).catch(function (err) {
          console.warn("Video play failed:", err);
          fadeIn();
        });
      };
    });
  }

  function startClipTimer() {
    clearTimeout(clipTimer);
    // Shorten G-Wagon clip (car7.mp4) to 8s, others use default 12s
    var clipDuration = MAX_CLIP_DURATION;
    if (videoSources[currentVideoIndex].indexOf("car7") !== -1) {
      clipDuration = 8;
    }
    var realDuration = clipDuration / PLAYBACK_RATE;
    clipTimer = setTimeout(function () {
      if (!heroVideo.paused && !heroVideo.ended) {
        playNextVideo();
      }
    }, realDuration * 1000);
  }

  heroVideo.addEventListener("ended", function () {
    clearTimeout(clipTimer);
    playNextVideo();
  });

  heroVideo.addEventListener("playing", function () {
    heroVideo.playbackRate = PLAYBACK_RATE;
    startClipTimer();
  });

  heroVideo.addEventListener("loadedmetadata", function () {
    heroVideo.playbackRate = PLAYBACK_RATE;
  });

  heroVideo.addEventListener("ratechange", function () {
    if (heroVideo.playbackRate !== PLAYBACK_RATE) {
      heroVideo.playbackRate = PLAYBACK_RATE;
    }
  });

  heroVideo.src = videoSources[0];
  playedIndices.push(0);
  heroVideo.load();
  heroVideo.playbackRate = PLAYBACK_RATE;
  heroVideo.play().then(function () {
    fadeIn();
  }).catch(function (err) {
    console.warn("Initial video play failed:", err);
    document.addEventListener("click", function handler() {
      heroVideo.play();
      document.removeEventListener("click", handler);
    }, { once: true });
  });

  console.log("AB Autoz Hero Video: Initialized with " + videoSources.length + " videos (Bentley first), playbackRate=" + PLAYBACK_RATE);
})();
