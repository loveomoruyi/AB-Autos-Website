// Hero Background Video Crossfade
// Only May 1st downloaded videos (unique, no duplicates)
// Bentley interior (car13) plays FIRST
const CLIPS = [
  'car13.mp4',
  'car4.mp4',
  'car3.mp4',
  'car5.mp4',
  'car8.mp4',
  'car1.mp4'
];

const PLAYBACK_RATE  = 0.3;
const CLIP_DURATION  = 12;
const FADE_DURATION  = 1500;

const wrapper = document.querySelector('.hero-video-wrapper');
if (wrapper) {
  const videos = [createVideo(), createVideo()];
  let active = 0;
  let clipIndex = 0;

  function createVideo() {
    const v = document.createElement('video');
    v.className = 'hero-bg-video';
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.style.opacity = '0';
    v.style.transition = 'opacity ' + FADE_DURATION + 'ms ease-in-out';
    wrapper.appendChild(v);
    return v;
  }

  function loadClip(videoEl, index) {
    videoEl.src = 'video/' + CLIPS[index % CLIPS.length];
    videoEl.playbackRate = PLAYBACK_RATE;
    videoEl.load();
  }

  function playNext() {
    const current = videos[active];
    const next = videos[1 - active];
    const nextIndex = (clipIndex + 1) % CLIPS.length;
    loadClip(next, nextIndex);

    next.addEventListener('canplaythrough', function onReady() {
      next.removeEventListener('canplaythrough', onReady);
      next.play().then(function() {
        next.playbackRate = PLAYBACK_RATE;
        next.style.opacity = '1';
        current.style.opacity = '0';
        setTimeout(function() {
          current.pause();
        }, FADE_DURATION);
        active = 1 - active;
        clipIndex = nextIndex;
      }).catch(function() {});
    }, { once: true });
  }

  loadClip(videos[0], 0);
  videos[0].addEventListener('canplaythrough', function onFirst() {
    videos[0].removeEventListener('canplaythrough', onFirst);
    videos[0].play().then(function() {
      videos[0].playbackRate = PLAYBACK_RATE;
      videos[0].style.opacity = '1';
    }).catch(function() {});
  }, { once: true });

  setInterval(playNext, CLIP_DURATION * 1000);
}
