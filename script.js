document.addEventListener('DOMContentLoaded', () => {

    /* --- ЛОГИКА ПЛЕЕРА --- */
    const audio = document.getElementById('audio-track');
    const playBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');

    if (playBtn && audio) {
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.value = progress;
                
                let mins = Math.floor(audio.currentTime / 60);
                let secs = Math.floor(audio.currentTime % 60);
                if (secs < 10) secs = '0' + secs;
                currentTimeEl.innerText = mins + ':' + secs;
            }
        });

        progressBar.addEventListener('input', () => {
            const time = (progressBar.value / 100) * audio.duration;
            audio.currentTime = time;
        });

        audio.addEventListener('ended', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            progressBar.value = 0;
        });
    }

    /* --- ЛОГИКА ТАЙМЕРА (До 26.09.2026 10:40) --- */
    // Месяцы в JS идут от 0 до 11 (Сентябрь — это 8)
    const targetDate = new Date(2026, 8, 26, 10, 40, 0).getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        const timerContainer = document.getElementById("dual-font-timer");

        if (diff <= 0) {
            if (timerContainer) timerContainer.innerHTML = "СОБЫТИЕ НАЧАЛОСЬ";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById("d-val").innerText = d < 10 ? "0" + d : d;
        document.getElementById("h-val").innerText = h < 10 ? "0" + h : h;
        document.getElementById("m-val").innerText = m < 10 ? "0" + m : m;
        document.getElementById("s-val").innerText = s < 10 ? "0" + s : s;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
});