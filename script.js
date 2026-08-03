document.addEventListener('DOMContentLoaded', function() {

    /* --- ЛОГИКА ПЛЕЕРА --- */
    const audio = document.getElementById('audio-track');
    const playBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');

    if (playBtn && audio) {
        playBtn.addEventListener('click', function() {
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

        audio.addEventListener('timeupdate', function() {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.value = progress;
                
                let mins = Math.floor(audio.currentTime / 60);
                let secs = Math.floor(audio.currentTime % 60);
                if (secs < 10) secs = '0' + secs;
                currentTimeEl.innerText = mins + ':' + secs;
            }
        });

        progressBar.addEventListener('input', function() {
            const time = (progressBar.value / 100) * audio.duration;
            audio.currentTime = time;
        });

        audio.addEventListener('ended', function() {
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

        const dEl = document.getElementById("d-val");
        const hEl = document.getElementById("h-val");
        const mEl = document.getElementById("m-val");
        const sEl = document.getElementById("s-val");

        if (dEl) dEl.innerText = d < 10 ? "0" + d : d;
        if (hEl) hEl.innerText = h < 10 ? "0" + h : h;
        if (mEl) mEl.innerText = m < 10 ? "0" + m : m;
        if (sEl) sEl.innerText = s < 10 ? "0" + s : s;
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    /* --- ОТПРАВКА АНКЕТЫ В TELEGRAM --- */
    const rsvpForm = document.getElementById('rsvp-form');

    if (rsvpForm) {
        rsvpForm.onsubmit = function(event) {
            // Отменяем стандартную отправку HTML-формы, чтобы страница НЕ перезагружалась
            event.preventDefault();

            const WORKER_URL = 'https://falling-snow-b2dd.awsjfe.workers.dev/';
            const TG_TOKEN   = '8883583019:AAHr0ug-lnlrAa-GgAMVOQ36MMyI-s2d-i0';
            const CHAT_IDS   = ['5829248055', '1801013206'];

            const submitBtn = rsvpForm.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.innerText = 'Отправка...';
                submitBtn.disabled = true;
            }

            const nameInput = document.getElementById('fullname');
            const name = nameInput ? nameInput.value.trim() : 'Не указано';

            const attendanceElement = rsvpForm.querySelector('input[name="attendance"]:checked');
            let attendance = 'Не указано';
            if (attendanceElement) {
                attendance = attendanceElement.value === 'yes' ? 'Да, с удовольствием!' : 'К сожалению, не смогу.';
            }

            const message = `<b>💌 Новая анкета на свадьбу!</b>\n\n` +
                            `👤 <b>Имя и фамилия:</b> ${name}\n` +
                            `❓ <b>Присутствие:</b> ${attendance}`;

            // Отправляем запросы по очереди всем получателям
            let completed = 0;
            CHAT_IDS.forEach(function(chatId) {
                fetch(WORKER_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: TG_TOKEN,
                        chat_id: chatId,
                        text: message
                    })
                })
                .then(function(res) {
                    return res.json().catch(function() { return {}; });
                })
                .then(function(data) {
                    completed++;
                    if (completed === CHAT_IDS.length) {
                        alert('Спасибо! Ваш ответ успешно отправлен.');
                        rsvpForm.reset();
                        if (submitBtn) {
                            submitBtn.innerText = 'Отправить';
                            submitBtn.disabled = false;
                        }
                    }
                })
                .catch(function(err) {
                    completed++;
                    if (completed === CHAT_IDS.length) {
                        alert('Спасибо! Ответ отправлен.');
                        rsvpForm.reset();
                        if (submitBtn) {
                            submitBtn.innerText = 'Отправить';
                            submitBtn.disabled = false;
                        }
                    }
                });
            });

            return false;
        };
    }
});
