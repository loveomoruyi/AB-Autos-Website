// Background Music Player for AB Autoz
(function() {
    // SVG icons for speaker on/off
    var speakerOn = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.08"></path></svg>';
    var speakerOff = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

    // Determine if this is the homepage
    var path = window.location.pathname;
    var isHomepage = (path === '/' || path === '/index.html' || path.endsWith('/index.html') || path === '' || path.match(/\/?(index\.html)?$/));

    // Create audio element
    var audio = document.createElement('audio');
    audio.id = 'bg-music';
    audio.loop = true;
    audio.volume = 0.3;
    audio.src = 'https://cdn.pixabay.com/audio/2022/10/11/audio_3489e1de09.mp3';
    audio.preload = 'auto';
    document.body.appendChild(audio);

    // Create toggle button
    var btn = document.createElement('button');
    btn.id = 'music-toggle';
    btn.innerHTML = speakerOff;
    btn.title = 'Toggle Background Music';
    btn.style.cssText = 'position:fixed;bottom:30px;right:30px;z-index:99999;width:55px;height:55px;border-radius:50%;border:2px solid #d4af37;background:rgba(0,0,0,0.85);color:#d4af37;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.3s ease;box-shadow:0 4px 15px rgba(212,175,55,0.3);';
    btn.onmouseenter = function() { this.style.background = 'rgba(212,175,55,0.2)'; this.style.transform = 'scale(1.1)'; this.style.boxShadow = '0 4px 20px rgba(212,175,55,0.5)'; };
    btn.onmouseleave = function() { this.style.background = 'rgba(0,0,0,0.85)'; this.style.transform = 'scale(1)'; this.style.boxShadow = '0 4px 15px rgba(212,175,55,0.3)'; };
    document.body.appendChild(btn);

    var isPlaying = false;

    // Toggle function
    function toggleMusic() {
        if (isPlaying) {
            audio.pause();
            btn.innerHTML = speakerOff;
            isPlaying = false;
            sessionStorage.setItem('abautoz-music', 'off');
        } else {
            audio.play().then(function() {
                btn.innerHTML = speakerOn;
                isPlaying = true;
                sessionStorage.setItem('abautoz-music', 'on');
            }).catch(function(e) {
                console.log('Audio play failed:', e);
            });
        }
    }

    btn.addEventListener('click', toggleMusic);

    // Auto-play logic
    var savedState = sessionStorage.getItem('abautoz-music');

    if (savedState === 'on') {
        // User previously turned music on, respect that across pages
        audio.play().then(function() {
            btn.innerHTML = speakerOn;
            isPlaying = true;
        }).catch(function(e) {
            console.log('Auto-play blocked:', e);
        });
    } else if (savedState === 'off') {
        // User explicitly turned it off, keep it off
        isPlaying = false;
    } else if (isHomepage) {
        // First visit on homepage - auto-play
        audio.play().then(function() {
            btn.innerHTML = speakerOn;
            isPlaying = true;
            sessionStorage.setItem('abautoz-music', 'on');
        }).catch(function(e) {
            console.log('Auto-play blocked by browser:', e);
            var startOnInteraction = function() {
                audio.play().then(function() {
                    btn.innerHTML = speakerOn;
                    isPlaying = true;
                    sessionStorage.setItem('abautoz-music', 'on');
                }).catch(function() {});
                document.removeEventListener('click', startOnInteraction);
                document.removeEventListener('touchstart', startOnInteraction);
                document.removeEventListener('keydown', startOnInteraction);
            };
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('touchstart', startOnInteraction);
            document.addEventListener('keydown', startOnInteraction);
        });
    }
    // For non-homepage with no saved state: music stays OFF (default)
})();
