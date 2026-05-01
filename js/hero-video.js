/* ====== Hero Background Video - Slow Motion Cycling ====== */
(function() {
  var videoSources = [
    'video/car1.mp4',
    'video/car2.mp4',
    'video/car3.mp4',
    'video/car4.mp4',
    'video/car5.mp4'
  ];

  var currentIndex = 0;
  var heroVideo = document.getElementById('hero-video');

  if (!heroVideo) return;

  // Set slow-motion playback rate (0.5 = half speed)
  heroVideo.playbackRate = 0.5;
    heroVideo.loop = true;

  // Add active class to show video
  heroVideo.classList.add('active');

  // Function to switch to next video with fade transition
  function switchVideo() {
    currentIndex = (currentIndex + 1) % videoSources.length;

    // Fade out current video
    heroVideo.classList.remove('active');

    setTimeout(function() {
      heroVideo.src = videoSources[currentIndex];
      heroVideo.playbackRate = 0.5;
    heroVideo.loop = true;
      heroVideo.load();
      heroVideo.play().then(function() {
        heroVideo.classList.add('active');
      }).catch(function(err) {
        console.log('Video play error:', err);
        heroVideo.classList.add('active');
      });
    }, 1200); // Wait for fade out transition
  }

  // When video ends, switch to next
  heroVideo.addEventListener('ended', switchVideo);

  // Also set a timer as fallback - switch every 15 seconds
  setInterval(function() {
    if (!heroVideo.paused && heroVideo.currentTime > 10) {
      switchVideo();
    }
  }, 15000);

  // Ensure slow-motion rate persists
  heroVideo.addEventListener('play', function() {
    if (heroVideo.playbackRate !== 0.5) {
      heroVideo.playbackRate = 0.5;
    heroVideo.loop = true;
    }
  });

  // Handle load errors gracefully - skip to next video
  heroVideo.addEventListener('error', function() {
    console.log('Video error, skipping to next');
    currentIndex = (currentIndex + 1) % videoSources.length;
    heroVideo.src = videoSources[currentIndex];
    heroVideo.playbackRate = 0.5;
    heroVideo.loop = true;
    heroVideo.load();
    heroVideo.play().catch(function(){});
    heroVideo.classList.add('active');
  });

  console.log('Hero video player initialized with ' + videoSources.length + ' videos');
})();
