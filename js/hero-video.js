/* =========================================
   AB Autos - Hero Video Crossfade System
   Sequence: car13 > car4 > car3 > car5 > car8 > car1
   ========================================= */

(function () {
  'use strict';

  var CLIPS = ['car13.mp4', 'car4.mp4', 'car3.mp4', 'car5.mp4', 'car8.mp4', 'car1.mp4'];
  var PLAYBACK_RATE = 0.7;
  var CLIP_DURATION = 10;
  var FADE_DURATION = 1500;

  var videoA = document.getElementById('hero-video-a');
  var videoB = document.getElementById('hero-video-b');

  if (!videoA || !videoB) return;

  var videos = [videoA, videoB];
  var active = 0;
  var clipIndex = 0;

  videos.forEach(function (v) {
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.loop = false;
    v.playbackRate = PLAYBACK_RATE;
  });

  function enableTransitions() {
    videos.forEach(function (v) {
      v.style.transition = 'opacity ' + FADE_DURATION + 'ms ease-in-out';
    });
  }

  function loadClip(videoEl, index) {
    var src = 'video/' + CLIPS[index % CLIPS.length];
    videoEl.src = src;
    videoEl.playbackRate = PLAYBACK_RATE;
    videoEl.load();
  }

  function playNext() {
    var current = videos[active];
    var next = videos[1 - active];
    var nextClipIndex = (clipIndex + 1) % CLIPS.length;

    loadClip(next, nextClipIndex);

    function onReady() {
      next.removeEventListener('canplaythrough', onReady);
      next.play().then(function () {
        next.playbackRate = PLAYBACK_RATE;
        next.style.opacity = '1';
        current.style.opacity = '0';
        setTimeout(function () {
          current.pause();
        }, FADE_DURATION);
        active = 1 - active;
        clipIndex = nextClipIndex;
      }).catch(function (e) {
        console.warn('Video play failed:', e);
      });
    }

    next.addEventListener('canplaythrough', onReady, { once: true });
    setTimeout(function () {
      if (next.readyState >= 3) {
        onReady();
      }
    }, 3000);
  }

  loadClip(videoA, 0);

  function onFirstReady() {
    videoA.removeEventListener('canplaythrough', onFirstReady);
    videoA.play().then(function () {
      videoA.playbackRate = PLAYBACK_RATE;
      videoA.style.opacity = '1';
      setTimeout(function() { enableTransitions(); setInterval(playNext, CLIP_DURATION * 1000); }, 200);
    }).catch(function (e) {
      console.warn('First video play failed:', e);
    });
  }

  videoA.addEventListener('canplaythrough', onFirstReady, { once: true });

  if (videoA.readyState >= 3) {
    onFirstReady();
  }

})();
