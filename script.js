/**
 * script.js — LÓGICA PRINCIPAL (index.html)
 * ==========================================
 * Depende de: api-mock.js (deve ser carregado antes deste script)
 */

document.addEventListener("DOMContentLoaded", () => {

    // ─── NAVBAR / HAMBURGER ───────────────────────────────────────────────────
    const hamburger = document.querySelector(".hamburger");
    const navLinks  = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!href || !href.startsWith("#")) return;

            e.preventDefault();

            if (navLinks && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
            }

            const target = document.querySelector(href);
            if (!target) return;

            window.scrollTo({
                top: target.getBoundingClientRect().top + window.pageYOffset - 60,
                behavior: "smooth"
            });
        });
    });

    // ─── CONTADOR REGRESSIVO (PRÓXIMA CORRIDA) ────────────────────────────────
    async function initCountdown() {
        try {
            const nextRace = await API.getNextRace();
            const raceDate = new Date(nextRace.date).getTime();

            // Atualiza o nome do GP e Circuito
            const gpLabel = document.querySelector(".fanzone-section .gp-name");
            if (gpLabel) gpLabel.textContent = `GP ${nextRace.gp} — ${nextRace.circuit}`;

            const daysEl    = document.getElementById("days");
            const hoursEl   = document.getElementById("hours");
            const minutesEl = document.getElementById("minutes");
            const secondsEl = document.getElementById("seconds");

            // Só inicia o intervalo se os elementos existirem na página
            if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

            const tick = setInterval(() => {
                const now = new Date().getTime();
                const distance = raceDate - now;

                // Se a contagem terminar
                if (distance < 0) {
                    clearInterval(tick);
                    [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = "00");
                    
                    const subtitle = document.querySelector(".fanzone-section .fanzone-subtitle");
                    if (subtitle) {
                        subtitle.textContent = "É HORA DA CORRIDA! LUZES APAGADAS!";
                        subtitle.style.color = "var(--primary-red)";
                        subtitle.style.fontWeight = "bold";
                    }
                    return;
                }

                // LÓGICA MATEMÁTICA CORRIGIDA
                // 1000ms * 60s * 60m * 24h = 86.400.000 ms em um dia
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                const pad = n => String(n).padStart(2, "0");

                daysEl.textContent    = pad(days);
                hoursEl.textContent   = pad(hours);
                minutesEl.textContent = pad(minutes);
                secondsEl.textContent = pad(seconds);
            }, 1000);

        } catch (err) {
            console.error("[Windspeed] Erro ao carregar próxima corrida:", err);
        }
    }

    // ─── CONTADOR DE VOLTAS — ANIMAÇÃO DE INCREMENTO ─────────────────────────
    function animateCounter(el, target, duration = 2000) {
        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cúbico
            el.textContent = Math.floor(eased * target).toLocaleString("pt-BR");
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    async function initLapCounters() {
        try {
            const stats = await API.getTeamStats();

            const counterMap = {
                "stat-laps":    stats.totalLaps,
                "stat-races":   stats.totalRaces,
                "stat-podiums": stats.podiums,
                "stat-wins":    stats.wins
            };

            const section = document.getElementById("stats");
            if (!section) return;

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    obs.unobserve(entry.target);

                    Object.entries(counterMap).forEach(([id, value]) => {
                        const el = document.getElementById(id);
                        if (el) animateCounter(el, value);
                    });
                });
            }, { threshold: 0.2 });

            observer.observe(section);

        } catch (err) {
            console.error("[Windspeed] Erro ao carregar estatísticas:", err);
        }
    }

    // ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────
    initCountdown();
    initLapCounters();
}); 