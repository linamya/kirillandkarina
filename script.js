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

    /* --- ОТПРАВКА АНКЕТЫ В TELEGRAM ЧЕРЕЗ CLOUDFLARE --- */
    const rsvpForm = document.getElementById('rsvp-form');

    if (rsvpForm) {
        const WORKER_URL = 'https://falling-snow-b2dd.awsjfe.workers.dev/';
        const TG_TOKEN   = '8883583019:AAHr0ug-lnlrAa-GgAMVOQ36MMyI-s2d-i0';
        const CHAT_IDS   = ['5829248055', '1801013206'];

        rsvpForm.addEventListener('submit', async function(e) {
            // Жестко блокируем стандартный перезагруз формы
            e.preventDefault();
            e.stopPropagation();

            const submitBtn = this.querySelector('.submit-btn');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Отправить';

            if (submitBtn) {
                submitBtn.innerText = 'Отправка...';
                submitBtn.disabled = true;
            }

            try {
                const nameInput = document.getElementById('fullname');
                const name = nameInput ? nameInput.value.trim() : 'Не указано';

                const attendanceElement = this.querySelector('input[name="attendance"]:checked');
                let attendance = 'Не указано';
                if (attendanceElement) {
                    attendance = attendanceElement.value === 'yes' ? 'Да, с удовольствием!' : 'К сожалению, не смогу.';
                }

                const message = `<b>💌 Новая анкета на свадьбу!</b>\n\n` +
                                `👤 <b>Имя и фамилия:</b> ${name}\n` +
                                `❓ <b>Присутствие:</b> ${attendance}`;

                // Отправляем параллельно каждому получателю
                const requests = CHAT_IDS.map(async (chatId) => {
                    try {
                        const response = await fetch(WORKER_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                token: TG_TOKEN,
                                chat_id: chatId,
                                text: message
                            })
                        });
                        return response.ok; // true если 200 OK, false если 400/500
                    } catch (err) {
                        console.error(`Ошибка при отправке на ${chatId}:`, err);
                        return false;
                    }
                });

                const results = await Promise.all(requests);
                // Проверяем, прошла ли хотя бы одна успешная доставка
                const hasSuccess = results.some(res => res === true);

                if (hasSuccess) {
                    alert('Спасибо! Ваш ответ успешно отправлен.');
                    rsvpForm.reset();
                } else {
                    alert('Не удалось доставить сообщение. Убедитесь, что вы запустили бота (/start) в Telegram.');
                }

            } catch (error) {
                console.error('Общая ошибка формы:', error);
                alert('Произошла ошибка при отправке.');
            } finally {
                if (submitBtn) {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});
