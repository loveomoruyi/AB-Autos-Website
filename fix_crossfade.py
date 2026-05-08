#!/usr/bin/env python3
import os
import re

os.chdir(os.path.expanduser('~/AB-Autos-Website'))

# STEP 1: Fix the CSS
with open('css/style.css', 'r') as f:
    css = f.read()

print("Current CSS hero-bg-video rules:")
for match in re.finditer(r'(\.hero-bg-video[^{]*\{[^}]+\}|#hero-video-[ab][^{]*\{[^}]+\})', css):
    print(f"  {match.group(0)[:150]}")

patterns_to_remove = [
    r'\.hero-bg-video\.active\s*\{[^}]+\}',
    r'\.hero-bg-video\.fade-ready\s*\{[^}]+\}',
    r'#hero-video-a\s*\{[^}]+\}',
    r'#hero-video-b\s*\{[^}]+\}',
]

for pattern in patterns_to_remove:
    match = re.search(pattern, css)
    if match:
        print(f"  Removing: {match.group(0)[:80]}...")
        css = css.replace(match.group(0), '')

css = re.sub(r'\.hero-bg-video\.outgoing\s*\{[^}]+\}', '', css)

new_rules = """
/* First video: visible immediately, no transition on load */
#hero-video-a {
  opacity: 1;
  z-index: 2;
  transition: none;
}

/* Second video: hidden until needed */
#hero-video-b {
  opacity: 0;
  z-index: 1;
  visibility: hidden;
}

/* Active video: visible and on top */
.hero-bg-video.active {
  opacity: 1;
  z-index: 3;
  visibility: visible;
}

/* Outgoing video: stays visible but behind active, no transition on opacity */
.hero-bg-video.outgoing {
  opacity: 1;
  z-index: 2;
  visibility: visible;
  transition: none !important;
}

/* Enable smooth fade-in transitions after initial load */
.hero-bg-video.fade-ready {
  transition: opacity 1.5s ease-in-out;
}

/* Override: outgoing should never transition opacity (stays at 1 until swap) */
.hero-bg-video.outgoing.fade-ready {
  transition: none !important;
}
"""

base_rule_match = re.search(r'(\.hero-bg-video\s*\{[^}]+\})', css)
if base_rule_match:
    insert_point = base_rule_match.end()
    css = css[:insert_point] + new_rules + css[insert_point:]
    print("\nCSS: Inserted new rules after base .hero-bg-video")
else:
    print("\nCSS: ERROR - Could not find base .hero-bg-video rule!")
    css += new_rules
    print("CSS: Appended rules at end")

css = re.sub(r'\n{4,}', '\n\n\n', css)

with open('css/style.css', 'w') as f:
    f.write(css)
print("CSS: Written to file")

# STEP 2: Fix the JavaScript
new_js = '''(function () {
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
'''

with open('js/hero-video.js', 'w') as f:
    f.write(new_js)
print("JS: Completely rewritten with proper crossfade logic")

# STEP 3: Fix the HTML
with open('index.html', 'r') as f:
    html = f.read()

video_a_match = re.search(r'<video id="hero-video-a"[^>]*>.*?</video>', html, re.DOTALL)
if video_a_match:
    print(f"\nCurrent video-a tag: {video_a_match.group(0)[:200]}")

old_video_a = video_a_match.group(0) if video_a_match else ''

new_video_a = '''<video id="hero-video-a" class="hero-bg-video active" autoplay muted playsinline preload="auto">
          <source src="video/car4.mp4" type="video/mp4">
        </video>'''

if old_video_a:
    html = html.replace(old_video_a, new_video_a)
    print("HTML: Updated video-a tag")
else:
    print("HTML: ERROR - Could not find video-a tag!")

video_b_match = re.search(r'<video id="hero-video-b"[^>]*>.*?</video>', html, re.DOTALL)
if video_b_match:
    old_video_b = video_b_match.group(0)
    new_video_b = '''<video id="hero-video-b" class="hero-bg-video" muted playsinline preload="none">
        </video>'''
    html = html.replace(old_video_b, new_video_b)
    print("HTML: Updated video-b tag")

if 'hero-video.js' in html:
    html = re.sub(
        r'<script\s+src="js/hero-video\.js"[^>]*>',
        '<script src="js/hero-video.js" defer>',
        html
    )
    print("HTML: Ensured hero-video.js has defer attribute")

with open('index.html', 'w') as f:
    f.write(html)
print("HTML: Written to file")

print("\n=== All crossfade fixes applied! ===")
