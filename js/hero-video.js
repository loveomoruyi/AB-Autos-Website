(function () {
  "use strict";

  var CLIPS = [
    "video/car4.mp4",
    "video/car3.mp4",
    "video/car5.mp4",
    "video/car8.mp4",
    "video/car1.mp4",
    "video/car11.mp4"
  ];

  var CLIP_DURATION = 12;
  var PLAYBACK_RATE = 0.55;
  var FADE_DURATION = 1500;

  var videoA = document.getElementById("hero-video-a");
  var videoB = document.getElementById("hero-video-b");

  if (!videoA || !videoB) {
    console.error("Hero video elements not found!");
    return;
  }

  var clipIndex = 0;
  var clipTimer = null;
  var currentVideo = videoA;
  var nextVideo = videoB;
  var transitionInProgress = false;

  // Set playback rate
  videoA.playbackRate = PLAYBACK_RATE;
  videoB.playbackRate = PLAYBACK_RATE;

  // Remove loop - JS handles cycling
  videoA.removeAttribute("loop");

  function getNextClipIndex() {
    return (clipIndex + 1) % CLIPS.length;
  }

  function startClipTimer() {
    if (clipTimer) clearTimeout(clipTimer);
    var realDuration = (CLIP_DURATION / PLAYBACK_RATE) * 1000;
    clipTimer = setTimeout(crossfadeToNext, realDuration);
  }

  function crossfadeToNext() {
    if (transitionInProgress) return;
    transitionInProgress = true;

    var nextClipIndex = getNextClipIndex();
    var nextSrc = CLIPS[nextClipIndex];

    // Prepare next video (hidden, opacity 0 via CSS)
    nextVideo.src = nextSrc;
    nextVideo.playbackRate = PLAYBACK_RATE;
    nextVideo.load();

    var loadTimeout = setTimeout(function() {
      console.warn("Video load timeout:", nextSrc);
      transitionInProgress = false;
      // Skip this clip and try next
      clipIndex = nextClipIndex;
      startClipTimer();
    }, 5000);

    function onReady() {
      clearTimeout(loadTimeout);
      nextVideo.removeEventListener("canplay", onReady);
      doTransition(nextClipIndex);
    }

    if (nextVideo.readyState >= 3) {
      clearTimeout(loadTimeout);
      doTransition(nextClipIndex);
    } else {
      nextVideo.addEventListener("canplay", onReady, { once: true });
    }
  }

  function doTransition(nextClipIndex) {
    // Start playing next video (still invisible - opacity 0)
    nextVideo.play().then(function() {
      // Enable transitions on next video for smooth fade-in
      nextVideo.classList.add("fade-ready");
      
      // Small delay to ensure the browser has painted a frame
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          // Fade in next video by adding active class (opacity 0 -> 1 via CSS transition)
          nextVideo.classList.add("active");

          // After transition completes, clean up old video
          setTimeout(function() {
            // Remove active from current (it's now behind next video)
            currentVideo.classList.remove("active");
            currentVideo.classList.remove("fade-ready");
            currentVideo.pause();
            currentVideo.removeAttribute("src");
            currentVideo.load();

            // Update clip index
            clipIndex = nextClipIndex;

            // Swap video references
            var temp = currentVideo;
            currentVideo = nextVideo;
            nextVideo = temp;

            transitionInProgress = false;
            startClipTimer();
          }, FADE_DURATION + 200);
        });
      });
    }).catch(function(err) {
      console.warn("Crossfade play failed:", err);
      transitionInProgress = false;
      clipIndex = nextClipIndex;
      startClipTimer();
    });
  }

  // ---- Initialization ----
  // videoA should already be playing via HTML autoplay attribute
  // CSS makes it visible with #hero-video-a { opacity: 1 !important }

  function initializePlayback() {
    videoA.classList.add("active");
    startClipTimer();
    // Enable transitions after a short delay (first frame is painted)
    setTimeout(function() {
      videoA.classList.add("fade-ready");
      videoB.classList.add("fade-ready");
    }, 500);
  }

  if (!videoA.paused && videoA.readyState >= 2) {
    // Already playing
    initializePlayback();
  } else {
    // Try to play
    videoA.play().then(function() {
      initializePlayback();
    }).catch(function(err) {
      console.warn("Autoplay failed:", err);
      // Video is still visible via CSS (opacity:1 on #hero-video-a)
      // Set up user interaction handler
      document.addEventListener("click", function handler() {
        videoA.play().then(function() {
          initializePlayback();
        }).catch(function(){});
        document.removeEventListener("click", handler);
      }, { once: true });
      // Retry after delay
      setTimeout(function() {
        videoA.play().then(function() {
          initializePlayback();
        }).catch(function(){});
      }, 2000);
    });
  }
})();
