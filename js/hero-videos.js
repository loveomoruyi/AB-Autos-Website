/* ==========================================
   AB Autos - Hero Video Crossfade System
   Sequence: Bentley interior first, then other luxury cars
   Seamless fade transitions - no black frames
   ========================================== */

(function () {
     'use strict';

   var CLIPS = [
          '13460847_2160_3840_60fps.mp4',
          '13461041_2160_3840_60fps.mp4',
          '11898534_1080_1920_30fps.mp4',
          '13035250_1920_1080_24fps.mp4',
          '13171246_1920_1080_60fps.mp4',
          '15483080_1080_1920_30fps.mp4',
          '6872070-uhd_3840_2160_25fps.mp4'
        ];

   var PLAYBACK_RATE = 0.7;
     var FADE_DURATION = 1500;
     var CLIP_DURATION = 10;

   var videoA = document.getElementById('hero-video-a');
     var videoB = document.getElementById('hero-video-b');

   if (!videoA || !videoB) return;

   var videos = [videoA, videoB];
     var active = 0;
     var clipIndex = 0;
     var transitioning = false;

   videos.forEach(function (v) {
          v.muted = true;
          v.playsInline = true;
          v.preload = 'auto';
          v.loop = false;
          v.playbackRate = PLAYBACK_RATE;
          v.style.opacity = '0';
          v.style.transition = 'opacity ' + FADE_DURATION + 'ms ease-in-out';
   });

   function loadClip(videoEl, index) {
          var src = 'video/' + CLIPS[index % CLIPS.length];
          videoEl.src = src;
          videoEl.playbackRate = PLAYBACK_RATE;
          videoEl.load();
   }

   function playNext() {
          if (transitioning) return;
          transitioning = true;

       var current = videos[active];
          var next = videos[1 - active];
          var nextClipIndex = (clipIndex + 1) % CLIPS.length;

       loadClip(next, nextClipIndex);

       function doTransition() {
                next.play().then(function () {
                           next.playbackRate = PLAYBACK_RATE;
                           next.style.opacity = '1';
                           current.style.opacity = '0';

                                         setTimeout(function () {
                                                      current.pause();
                                                      current.removeAttribute('src');
                                                      current.load();
                                                      active = 1 - active;
                                                      clipIndex = nextClipIndex;
                                                      transitioning = false;
                                                      scheduleNextTransition();
                                         }, FADE_DURATION + 100);
                }).catch(function (e) {
                           console.warn('Video play failed:', e);
                           transitioning = false;
                           setTimeout(playNext, 1000);
                });
       }

       if (next.readyState >= 3) {
                doTransition();
       } else {
                var fallbackTimer = setTimeout(function () {
                           doTransition();
                }, 2500);

            next.addEventListener('canplay', function onCanPlay() {
                       next.removeEventListener('canplay', onCanPlay);
                       clearTimeout(fallbackTimer);
                       doTransition();
            });
       }
   }

   function scheduleNextTransition() {
          var current = videos[active];
          var transitionScheduled = false;

       function triggerTransition() {
                if (transitionScheduled) return;
                transitionScheduled = true;
                current.removeEventListener('timeupdate', onTimeUpdate);
                current.removeEventListener('ended', onEnded);
                clearTimeout(safetyTimer);
                playNext();
       }

       function onTimeUpdate() {
                if (!current.duration || isNaN(current.duration)) return;
                var timeRemaining = current.duration - current.currentTime;
                var elapsed = current.currentTime;
                if (elapsed >= (CLIP_DURATION * PLAYBACK_RATE) - (FADE_DURATION / 1000) || timeRemaining <= (FADE_DURATION / 1000) + 0.3) {
                           triggerTransition();
                }
       }

       function onEnded() {
                triggerTransition();
       }

       var safetyTimer = setTimeout(function () {
                triggerTransition();
       }, (CLIP_DURATION + 2) * 1000);

       current.addEventListener('timeupdate', onTimeUpdate);
          current.addEventListener('ended', onEnded);
   }

   loadClip(videoA, 0);

   function onFirstReady() {
          videoA.removeEventListener('canplay', onFirstReady);
          videoA.play().then(function () {
                   videoA.playbackRate = PLAYBACK_RATE;
                   videoA.style.opacity = '1';
                   setTimeout(function () {
                              scheduleNextTransition();
                   }, 300);
          }).catch(function (e) {
                   console.warn('First video play failed:', e);
          });
   }

   videoA.addEventListener('canplay', onFirstReady, { once: true });

   if (videoA.readyState >= 3) {
          onFirstReady();
   }

   setTimeout(function () {
          if (videoA.style.opacity !== '1') {
                   onFirstReady();
          }
   }, 5000);
})();
