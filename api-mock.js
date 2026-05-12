/**
 * api-mock.js — CAMADA DE DADOS (DATA LAYER)
 * ============================================
 * Esta camada simula as respostas de uma API REST real.
 * Quando o backend estiver pronto, substitua cada função por uma chamada fetch():
 *
 * EXEMPLO DE SUBSTITUIÇÃO:
 *   async getTeamStats() {
 *     const response = await fetch('/api/v1/team/stats', { headers: { 'Authorization': `Bearer ${token}` } });
 *     if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
 *     return response.json();
 *   }
 *
 * Todos os métodos são async para garantir compatibilidade direta com a API real.
 */
 
const API = (() => {
 
    // ─── DADOS MOCKADOS ───────────────────────────────────────────────────────
    // Estrutura idêntica ao contrato esperado do backend (JSON Schema).
    // Alterar apenas os valores aqui não quebra nenhum componente de UI.
 
    const _data = {
        teamStats: {
            totalLaps: 1847,
            totalRaces: 12,
            podiums: 4,
            wins: 2,
            dnfs: 3,
            constructorsPosition: 3,
            constructorsPoints: 287,
            lastUpdated: new Date().toISOString()
        },
 
        drivers: [
            {
                id: "hugo-garcia",
                name: "Hugo Garcia",
                number: 11,
                points: 168,
                championshipPosition: 4,
                wins: 2,
                podiums: 3,
                fastestLaps: 4,
                lapsCompleted: 923,
                avgFinish: 3.8
            },
            {
                id: "erick-rocha",
                name: "Erick Rocha",
                number: 27,
                points: 119,
                championshipPosition: 7,
                wins: 0,
                podiums: 1,
                fastestLaps: 2,
                lapsCompleted: 924,
                avgFinish: 5.7
            }
        ],
 
        raceResults: [
            { round: 1,  gp: "Bahrein",       circuit: "Sakhir",           hugoPos: 2,   erickPos: 5,   points: 37, hugoFastest: false, erickFastest: false },
            { round: 2,  gp: "Arábia Saudita", circuit: "Jeddah",           hugoPos: 1,   erickPos: null, points: 25, hugoFastest: true,  erickFastest: false },
            { round: 3,  gp: "Austrália",      circuit: "Melbourne",        hugoPos: 4,   erickPos: 6,   points: 22, hugoFastest: false, erickFastest: false },
            { round: 4,  gp: "Japão",          circuit: "Suzuka",           hugoPos: 3,   erickPos: 4,   points: 30, hugoFastest: false, erickFastest: true  },
            { round: 5,  gp: "China",          circuit: "Shanghai",         hugoPos: 1,   erickPos: 8,   points: 29, hugoFastest: true,  erickFastest: false },
            { round: 6,  gp: "Miami",          circuit: "Miami",            hugoPos: null, erickPos: 3,   points: 15, hugoFastest: false, erickFastest: false },
            { round: 7,  gp: "Mônaco",         circuit: "Monte Carlo",      hugoPos: 5,   erickPos: 7,   points: 18, hugoFastest: false, erickFastest: false },
            { round: 8,  gp: "Canadá",         circuit: "Montreal",         hugoPos: 6,   erickPos: 2,   points: 26, hugoFastest: false, erickFastest: true  },
            { round: 9,  gp: "Espanha",        circuit: "Barcelona",        hugoPos: 4,   erickPos: 9,   points: 20, hugoFastest: true,  erickFastest: false },
            { round: 10, gp: "Áustria",        circuit: "Spielberg",        hugoPos: 7,   erickPos: 5,   points: 16, hugoFastest: false, erickFastest: false },
            { round: 11, gp: "Grã-Bretanha",   circuit: "Silverstone",      hugoPos: 8,   erickPos: 4,   points: 17, hugoFastest: false, erickFastest: true  },
            { round: 12, gp: "Hungria",        circuit: "Hungaroring",      hugoPos: 2,   erickPos: 6,   points: 32, hugoFastest: true,  erickFastest: false }
        ],
 
        constructorsStandings: [
            { position: 1, team: "Apex Motorsport",  points: 412, isWindspeed: false },
            { position: 2, team: "Titan Racing",     points: 334, isWindspeed: false },
            { position: 3, team: "Windspeed Racing", points: 287, isWindspeed: true  },
            { position: 4, team: "Helios F1",        points: 198, isWindspeed: false },
            { position: 5, team: "Vortex GP",        points: 143, isWindspeed: false }
        ],
 
        nextRace: {
            gp: "Bélgica",
            circuit: "Circuit de Spa-Francorchamps",
            round: 13,
            date: (() => {
                // Gera data 14 dias no futuro dinamicamente (substituir por dado real do backend)
                const d = new Date();
                d.setDate(d.getDate() + 14);
                return d.toISOString();
            })()
        }
    };
 
    // ─── MÉTODOS PÚBLICOS ─────────────────────────────────────────────────────
 
    return {
        /**
         * Retorna estatísticas gerais da equipe na temporada.
         * @returns {Promise<Object>}
         */
        async getTeamStats() {
            // TODO: return fetch('/api/v1/team/stats').then(r => r.json());
            return structuredClone(_data.teamStats);
        },
 
        /**
         * Retorna stats individuais de todos os pilotos.
         * @returns {Promise<Array>}
         */
        async getDriverStats() {
            // TODO: return fetch('/api/v1/drivers').then(r => r.json());
            return structuredClone(_data.drivers);
        },
 
        /**
         * Retorna resultados de todas as corridas da temporada.
         * @returns {Promise<Array>}
         */
        async getRaceResults() {
            // TODO: return fetch('/api/v1/races/results').then(r => r.json());
            return structuredClone(_data.raceResults);
        },
 
        /**
         * Retorna classificação do campeonato de construtores.
         * @returns {Promise<Array>}
         */
        async getConstructorsStandings() {
            // TODO: return fetch('/api/v1/standings/constructors').then(r => r.json());
            return structuredClone(_data.constructorsStandings);
        },
 
        /**
         * Retorna dados da próxima corrida.
         * @returns {Promise<Object>}
         */
        async getNextRace() {
            // TODO: return fetch('/api/v1/races/next').then(r => r.json());
            return structuredClone(_data.nextRace);
        }
    };
})();
 