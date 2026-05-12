document.addEventListener("DOMContentLoaded", async () => {

    const API_URL = 'http://localhost:3000';

    function showError(containerId, message) {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `<p class="dash-error">⚠️ ${message}</p>`;
    }

    // ─── KPIs ─────────────────────────────────────────────────────────────────
    async function renderKPIs() {
        try {
            const [voltasRes, corredoresRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`)
            ]);

            const voltas = await voltasRes.json();
            const corredores = await corredoresRes.json();

            document.getElementById("kpi-position").textContent = `—`;
            document.getElementById("kpi-points").textContent   = `—`;
            document.getElementById("kpi-wins").textContent     = `—`;
            document.getElementById("kpi-podiums").textContent  = `—`;
            document.getElementById("kpi-laps").textContent     = voltas.length.toLocaleString("pt-BR");
            document.getElementById("kpi-dnfs").textContent     = `—`;

            document.querySelectorAll(".kpi-card").forEach(c => c.classList.remove("loading"));

        } catch (err) {
            console.error("[Dashboard] Erro KPIs:", err);
            showError("kpi-section", "Não foi possível carregar os KPIs.");
        }
    }

    // ─── TABELA DE VOLTAS ─────────────────────────────────────────────────────
    async function renderRaceResults() {
        try {
            const [voltasRes, corredoresRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`)
            ]);

            const voltas = await voltasRes.json();
            const corredores = await corredoresRes.json();

            const corredorMap = {};
            corredores.forEach(c => corredorMap[c.id] = c.nome);

            const tbody = document.getElementById("results-tbody");
            if (!tbody) return;

            if (!voltas.length) {
                tbody.innerHTML = `<tr><td colspan="4" class="loading-row">Nenhuma volta registrada.</td></tr>`;
                return;
            }

            tbody.innerHTML = voltas.map((v, i) => `
                <tr>
                    <td class="td-round">${i + 1}</td>
                    <td class="td-gp">
                        <span class="gp-name-cell">${corredorMap[v.corredores_id] || 'Desconhecido'}</span>
                        <span class="gp-circuit">${new Date(v.data).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td class="td-points">${parseFloat(v.tempo).toFixed(2)}s</td>
                </tr>
            `).join("");

        } catch (err) {
            console.error("[Dashboard] Erro resultados:", err);
            showError("results-section", "Não foi possível carregar os resultados.");
        }
    }

    // ─── COMPARATIVO DE CORREDORES ────────────────────────────────────────────
    async function renderDriverComparison() {
        try {
            const [voltasRes, corredoresRes] = await Promise.all([
                fetch(`${API_URL}/voltas`),
                fetch(`${API_URL}/corredores`)
            ]);

            const voltas = await voltasRes.json();
            const corredores = await corredoresRes.json();

            const container = document.getElementById("driver-comparison");
            if (!container) return;

            if (!corredores.length) {
                container.innerHTML = `<p class="loading-row">Nenhum corredor cadastrado.</p>`;
                return;
            }

            const stats = corredores.map(c => {
                const minhasVoltas = voltas.filter(v => v.corredores_id === c.id);
                const tempos = minhasVoltas.map(v => parseFloat(v.tempo));
                const melhor = tempos.length ? Math.min(...tempos).toFixed(2) : '—';
                const media  = tempos.length ? (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(2) : '—';
                return { ...c, totalVoltas: minhasVoltas.length, melhorTempo: melhor, mediaTempo: media };
            });

            container.innerHTML = `
                <div class="comp-header">
                    ${stats.map(s => `<span class="comp-driver-name">${s.nome}</span>`).join('<span class="comp-vs">VS</span>')}
                </div>
                <table class="results-table" style="width:100%; margin-top: 1rem;">
                    <thead>
                        <tr>
                            <th>Corredor</th>
                            <th>Turma</th>
                            <th>Total de Voltas</th>
                            <th>Melhor Tempo</th>
                            <th>Tempo Médio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(s => `
                            <tr>
                                <td>${s.nome}</td>
                                <td>${s.turma || '—'}</td>
                                <td>${s.totalVoltas}</td>
                                <td>${s.melhorTempo}${s.melhorTempo !== '—' ? 's' : ''}</td>
                                <td>${s.mediaTempo}${s.mediaTempo !== '—' ? 's' : ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

        } catch (err) {
            console.error("[Dashboard] Erro comparativo:", err);
            showError("comparison-section", "Não foi possível carregar o comparativo.");
        }
    }

    await Promise.allSettled([
        renderKPIs(),
        renderRaceResults(),
        renderDriverComparison()
    ]);

    const tsEl = document.getElementById("last-updated");
    if (tsEl) tsEl.textContent = new Date().toLocaleString("pt-BR");
});

// ═══════════════════════════════════════════════════════════════════════════
// MODAL — TEMPOS DE VOLTA DO USUÁRIO LOGADO
// ═══════════════════════════════════════════════════════════════════════════

const API_URL = 'http://localhost:3000';

/**
 * Abre o modal e carrega os tempos de volta do usuário logado.
 * O usuário logado é lido do localStorage (chave "usuario"),
 * esperando um objeto com pelo menos { id, nome }.
 */
async function openLapTimesModal() {
    const modal = document.getElementById('lap-times-modal');
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';

    // Recupera usuário do localStorage
    let usuario = null;
    try {
        const raw = localStorage.getItem('usuario');
        usuario = raw ? JSON.parse(raw) : null;
    } catch (e) {
        usuario = null;
    }

    if (!usuario || !usuario.id) {
        document.getElementById('modal-user-label').textContent = 'Nenhum usuário logado';
        document.getElementById('modal-tbody').innerHTML =
            `<tr><td colspan="4" class="dash-error">⚠️ Faça login para ver seus tempos.</td></tr>`;
        resetModalStats();
        return;
    }

    document.getElementById('modal-user-label').textContent =
        `Piloto: ${usuario.nome || usuario.email || 'Usuário #' + usuario.id}`;

    // Mostra estado de carregamento
    document.getElementById('modal-tbody').innerHTML =
        `<tr><td colspan="4" class="loading-row">Carregando voltas...</td></tr>`;
    resetModalStats();

    try {
        // Busca TODAS as voltas e filtra pelo corredor_id do usuário logado
        const res = await fetch(`${API_URL}/voltas`);
        if (!res.ok) throw new Error('Erro na requisição');
        const todasVoltas = await res.json();

        // Filtra voltas do usuário logado
        // Suporta tanto usuario.id === corredores_id quanto usuario.corredores_id
        const meuId = usuario.corredores_id || usuario.id;
        const minhasVoltas = todasVoltas.filter(v =>
            String(v.corredores_id) === String(meuId)
        );

        renderModalStats(minhasVoltas);
        renderModalTable(minhasVoltas);

    } catch (err) {
        console.error('[Modal] Erro ao buscar voltas:', err);
        document.getElementById('modal-tbody').innerHTML =
            `<tr><td colspan="4" class="dash-error">⚠️ Não foi possível carregar os tempos.</td></tr>`;
    }
}

/** Fecha o modal ao clicar fora ou no botão fechar */
function closeLapTimesModal(event) {
    // Se clicou dentro da modal-box, não fecha
    if (event && event.target !== document.getElementById('lap-times-modal')) return;
    const modal = document.getElementById('lap-times-modal');
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';
}

/** Zera os cards de estatísticas do modal */
function resetModalStats() {
    ['mstat-total', 'mstat-best', 'mstat-avg', 'mstat-last'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
    });
    const badge = document.getElementById('modal-lap-count');
    if (badge) badge.textContent = '0 voltas';
}

/** Preenche os cards de estatísticas com os dados das voltas */
function renderModalStats(voltas) {
    const badge = document.getElementById('modal-lap-count');
    if (badge) badge.textContent = `${voltas.length} volta${voltas.length !== 1 ? 's' : ''}`;

    document.getElementById('mstat-total').textContent = voltas.length;

    if (!voltas.length) return;

    const tempos = voltas.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));

    const melhor = Math.min(...tempos);
    const media  = tempos.reduce((a, b) => a + b, 0) / tempos.length;

    // Última volta por data
    const sorted = [...voltas].sort((a, b) => new Date(b.data) - new Date(a.data));
    const ultimo = parseFloat(sorted[0].tempo);

    document.getElementById('mstat-best').textContent = `${melhor.toFixed(2)}s`;
    document.getElementById('mstat-avg').textContent  = `${media.toFixed(2)}s`;
    document.getElementById('mstat-last').textContent = `${ultimo.toFixed(2)}s`;
}

/** Renderiza a tabela de voltas no modal */
function renderModalTable(voltas) {
    const tbody = document.getElementById('modal-tbody');
    if (!tbody) return;

    if (!voltas.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="loading-row">Nenhuma volta registrada para este piloto.</td></tr>`;
        return;
    }

    // Ordena por data decrescente (mais recente primeiro)
    const sorted = [...voltas].sort((a, b) => new Date(b.data) - new Date(a.data));
    const tempos  = sorted.map(v => parseFloat(v.tempo)).filter(t => !isNaN(t));
    const melhor  = Math.min(...tempos);

    tbody.innerHTML = sorted.map((v, i) => {
        const tempo    = parseFloat(v.tempo);
        const isBest   = tempo === melhor;
        const dataFmt  = new Date(v.data).toLocaleDateString('pt-BR');

        let statusHtml = '';
        if (isBest) {
            statusHtml = `<span class="lap-badge lap-badge--best">🏆 Melhor</span>`;
        } else if (i === 0) {
            statusHtml = `<span class="lap-badge lap-badge--recent">🕐 Recente</span>`;
        } else {
            statusHtml = `<span class="lap-badge lap-badge--normal">✓</span>`;
        }

        return `
            <tr class="${isBest ? 'row-best-lap' : ''}">
                <td class="td-round">${sorted.length - i}</td>
                <td>${dataFmt}</td>
                <td class="td-points ${isBest ? 'td-best' : ''}">${tempo.toFixed(2)}s</td>
                <td>${statusHtml}</td>
            </tr>
        `;
    }).join('');
}

// Fecha modal com ESC
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('lap-times-modal');
        if (modal && modal.classList.contains('modal--open')) {
            modal.classList.remove('modal--open');
            document.body.style.overflow = '';
        }
    }
});