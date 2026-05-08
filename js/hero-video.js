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
  var clipIndex = 0;
  var clipTimer = null;
  var currentVideo = videoA;
  var nextVideo = videoB;
  var transitionInProgress = false;

  videoA.playbackRate = PLAYBACK_RATE;
  videoB.playbackRate = PLAYBACK_RATE;
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

    clipIndex = getNextClipIndex();
    var nextSrc = CLIPS[clipIndex];

    nextVideo.src = nextSrc;
    nextVideo.playbackRate = PLAYBACK_RATE;
    nextVideo.load();

    var loadTimeout = setTimeout(function() {
      console.warn("Video load timeout for:", nextSrc);
      transitionInProgress = false;
      crossfadeToNext();
    }, 5000);

    function onCanPlay() {
      clearTimeout(loadTimeout);
      nextVideo.removeEventListener("canplay", onCanPlay);
      performCrossfade();
    }

    if (nextVideo.readyState >= 3) {
      clearTimeout(loadTimeout);
      performCrossfade();
    } else {
      nextVideo.addEventListener("canplay", onCanPlay, { once: true });
    }
  }

  function performCrossfade() {
    nextVideo.play().then(function() {
      currentVideo.classList.remove("active");
      currentVideo.classList.add("outgoing");

      nextVideo.style.visibility = "visible";
      nextVideo.classList.add("active");

      setTimeout(function() {
        currentVideo.classList.remove("outgoing", "fade-ready");
        currentVideo.pause();
        currentVideo.removeAttribute("src");
        currentVideo.load();
        currentVideo.style.visibility = "hidden";
        currentVideo.style.opacity = "0";

        var temp = currentVideo;
        currentVideo = nextVideo;
        nextVideo = temp;

        currentVideo.classList.add("fade-ready");

        transitionInProgress = false;
        startClipTimer();
      }, FADE_DURATION + 100);

    }).catch(function(err) {
      console.warn("Video play failed during crossfade:", err);
      transitionInProgress = false;
      startClipTimer();
    });
  }

  function enableTransitions() {
    videoA.classList.add("fade-ready");
    videoB.classList.add("fade-ready");
  }

  function initializePlayback() {
    videoA.classList.add("active");
    startClipTimer();
    setTimeout(enableTransitions, 300);
  }

  if (!videoA.paused && videoA.readyState >= 3) {
    initializePlayback();
  } else {
    var playPromise = videoA.play();
    if (playPromise !== undefined) {
      playPromise.then(function() {
        initializePlayback();
      }).catch(function(err) {
        console.warn("Initial autoplay failed:", err);
        setTimeout(enableTransitions, 1000);
        document.addEventListener("click", function handler() {
          videoA.play().then(function() {
            initializePlayback();
          }).catch(function() {});
          document.removeEventListener("click", handler);
        }, { once: true });
        setTimeout(function() {
          videoA.play().then(function() {
            initializePlayback();
          }).catch(function() {});
        }, 2000);
      });
    }
  }
})();
