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

    /* --- ОТПРАВКА АНКЕТЫ В TELEGRAM ЧЕРЕЗ CLOUDFLARE --- */
    const rsvpForm = document.getElementById('rsvp-form');

    if (rsvpForm) {
        const WORKER_URL = 'https://falling-snow-b2dd.awsjfe.workers.dev/';
        const TG_TOKEN   = '8883583019:AAHr0ug-lnlrAa-GgAMVOQ36MMyI-s2d-i0';
        const CHAT_IDS   = ['5829248055', '1801013206'];

        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Отправка...';
            submitBtn.disabled = true;

            const name = document.getElementById('fullname').value.trim();
            const attendanceElement = this.querySelector('input[name="attendance"]:checked');
            let attendance = 'Не указано';
            
            if (attendanceElement) {
                attendance = attendanceElement.value === 'yes' ? 'Да, с удовольствием!' : 'К сожалению, не смогу.';
            }

            const message = `<b>💌 Новая анкета на свадьбу!</b>\n\n` +
                            `👤 <b>Имя и фамилия:</b> ${name}\n` +
                            `❓ <b>Присутствие:</b> ${attendance}`;

            // Отправляем каждому ID независимо друг от друга
            const requests = CHAT_IDS.map(chatId => {
                return fetch(WORKER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: TG_TOKEN,
                        chat_id: chatId,
                        text: message
                    })
                }).then(res => res.json().catch(() => ({}))); 
            });

            Promise.all(requests)
                .then(results => {
                    // Если хотя бы одна отправка прошла успешно — считаем форму отправленной
                    alert('Спасибо! Ваш ответ успешно отправлен.');
                    rsvpForm.reset();
                })
                .catch(error => {
                    console.error('Ошибка отправки:', error);
                    alert('Произошла ошибка при отправке.');
                })
                .finally(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
