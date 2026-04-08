import {
  paysList,
  exploitations,
  utilisateurs,
  entrepots,
  lotsGrains,
  mesures,
  alertes,
  Pays,
  Exploitation,
  Utilisateur,
  Entrepot,
  LotGrains,
  Mesure,
  Alerte } from
'../data/mockData';

// Simulate network delay
const delay = (ms: number = 500) =>
new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Auth
  login: async (mail: string, mdp: string) => {
    await delay(800);
    if (mail === 'admin@futurekawa.com' && mdp === 'password123') {
      return {
        token: 'mock-jwt-token-123',
        user: { nom: 'Admin', prenom: 'Super', mail }
      };
    }
    throw new Error('Identifiants invalides');
  },

  // Dashboard
  getDashboardSummary: async () => {
    await delay();
    const lotsStockes = lotsGrains.filter((l) => !l.datSortie).length;
    const lotsAlerte = lotsGrains.filter(
      (l) => l.statut === 'en alerte' && !l.datSortie
    ).length;
    const lotsPerimes = lotsGrains.filter(
      (l) => l.statut === 'périmé' && !l.datSortie
    ).length;
    const entrepotsActifs = entrepots.length;

    const summaryByCountry = paysList.map((pays) => {
      const exps = exploitations.filter((e) => e.idPays === pays.idPays);
      const ents = entrepots.filter((e) =>
      exps.some((exp) => exp.idExploitation === e.idExploitation)
      );
      const entsIds = ents.map((e) => e.idEntrepot);
      const lots = lotsGrains.filter(
        (l) => entsIds.includes(l.idEntrepot) && !l.datSortie
      );

      // Get latest measure for this country
      const countryMeasures = mesures.filter((m) =>
      entsIds.includes(m.idEntrepot)
      );
      const latestMeasure = countryMeasures.sort(
        (a, b) =>
        new Date(b.datMesure).getTime() - new Date(a.datMesure).getTime()
      )[0];

      return {
        pays,
        nbExploitations: exps.length,
        nbEntrepots: ents.length,
        nbLots: lots.length,
        lotsEnAlerte: lots.filter((l) => l.statut === 'en alerte').length,
        derniereMesure: latestMeasure?.datMesure || null
      };
    });

    return {
      metrics: { lotsStockes, lotsAlerte, lotsPerimes, entrepotsActifs },
      summaryByCountry
    };
  },

  getRecentAlerts: async () => {
    await delay();
    return alertes.slice(0, 5).map((a) => {
      const entrepot = entrepots.find((e) => e.idEntrepot === a.idEntrepot);
      return { ...a, nomEntrepot: entrepot?.nom || 'Inconnu' };
    });
  },

  // Pays
  getPays: async (id: string) => {
    await delay();
    return paysList.find((p) => p.idPays === id);
  },

  getPaysExploitations: async (idPays: string) => {
    await delay();
    const exps = exploitations.filter((e) => e.idPays === idPays);
    return exps.map((exp) => {
      const ents = entrepots.filter(
        (e) => e.idExploitation === exp.idExploitation
      );
      const entsIds = ents.map((e) => e.idEntrepot);
      const lots = lotsGrains.filter(
        (l) => entsIds.includes(l.idEntrepot) && !l.datSortie
      );

      // Determine global status
      let statutGlobal = 'conforme';
      if (lots.some((l) => l.statut === 'périmé')) statutGlobal = 'périmé';else
      if (lots.some((l) => l.statut === 'en alerte'))
      statutGlobal = 'en alerte';

      return {
        ...exp,
        nbEntrepots: ents.length,
        nbLots: lots.length,
        statutGlobal
      };
    });
  },

  getPaysMeasureHistory: async (idPays: string) => {
    await delay();
    const exps = exploitations.filter((e) => e.idPays === idPays);
    const entsIds = entrepots.
    filter((e) =>
    exps.some((exp) => exp.idExploitation === e.idExploitation)
    ).
    map((e) => e.idEntrepot);

    // Group by day for the last 7 days
    const now = new Date();
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayMeasures = mesures.filter(
        (m) =>
        entsIds.includes(m.idEntrepot) && m.datMesure.startsWith(dateStr)
      );

      const avgTemp = dayMeasures.length ?
      dayMeasures.reduce((sum, m) => sum + m.temperature, 0) /
      dayMeasures.length :
      null;

      history.push({ date: dateStr, avgTemp });
    }
    return history;
  },

  // Exploitation
  getExploitation: async (id: string) => {
    await delay();
    const exp = exploitations.find((e) => e.idExploitation === id);
    if (!exp) return null;
    const pays = paysList.find((p) => p.idPays === exp.idPays);
    return { ...exp, pays };
  },

  getExploitationEntrepots: async (idExploitation: string) => {
    await delay();
    const exp = exploitations.find((e) => e.idExploitation === idExploitation);
    const pays = paysList.find((p) => p.idPays === exp?.idPays);

    const ents = entrepots.filter((e) => e.idExploitation === idExploitation);
    return ents.map((ent) => {
      const lots = lotsGrains.filter(
        (l) => l.idEntrepot === ent.idEntrepot && !l.datSortie
      );
      const entMeasures = mesures.filter((m) => m.idEntrepot === ent.idEntrepot);
      const latestMeasure = entMeasures.sort(
        (a, b) =>
        new Date(b.datMesure).getTime() - new Date(a.datMesure).getTime()
      )[0];

      let statutConditions = 'conforme';
      if (latestMeasure && pays) {
        if (
        latestMeasure.temperature < pays.temperatureMin ||
        latestMeasure.temperature > pays.temperatureMax ||
        latestMeasure.humidite < pays.humiditeMin ||
        latestMeasure.humidite > pays.humiditeMax)
        {
          statutConditions = 'en alerte';
        }
      }

      return {
        ...ent,
        nbLots: lots.length,
        statutConditions,
        derniereMesure: latestMeasure
      };
    });
  },

  getExploitationUsers: async (idExploitation: string) => {
    await delay();
    return utilisateurs.filter((u) => u.idExploitation === idExploitation);
  },

  // Entrepot
  getEntrepot: async (id: string) => {
    await delay();
    const ent = entrepots.find((e) => e.idEntrepot === id);
    if (!ent) return null;
    const exp = exploitations.find(
      (e) => e.idExploitation === ent.idExploitation
    );
    const pays = paysList.find((p) => p.idPays === exp?.idPays);
    return { ...ent, exploitation: exp, pays };
  },

  getEntrepotMeasures: async (idEntrepot: string, days: number = 30) => {
    await delay();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return mesures.
    filter(
      (m) => m.idEntrepot === idEntrepot && new Date(m.datMesure) >= cutoff
    ).
    sort(
      (a, b) =>
      new Date(a.datMesure).getTime() - new Date(b.datMesure).getTime()
    );
  },

  getEntrepotLots: async (idEntrepot: string) => {
    await delay();
    return lotsGrains.
    filter((l) => l.idEntrepot === idEntrepot && !l.datSortie).
    sort(
      (a, b) => new Date(a.datSto).getTime() - new Date(b.datSto).getTime()
    );
  },

  // Lot
  getLot: async (id: string) => {
    await delay();
    const lot = lotsGrains.find((l) => l.idLotGrains === id);
    if (!lot) return null;
    const ent = entrepots.find((e) => e.idEntrepot === lot.idEntrepot);
    const exp = exploitations.find(
      (e) => e.idExploitation === ent?.idExploitation
    );
    const pays = paysList.find((p) => p.idPays === exp?.idPays);
    return { ...lot, entrepot: ent, exploitation: exp, pays };
  },

  getLotMeasures: async (idEntrepot: string, datSto: string) => {
    await delay();
    return mesures.
    filter(
      (m) =>
      m.idEntrepot === idEntrepot &&
      new Date(m.datMesure) >= new Date(datSto)
    ).
    sort(
      (a, b) =>
      new Date(a.datMesure).getTime() - new Date(b.datMesure).getTime()
    );
  },

  getLotAlerts: async (idLot: string) => {
    await delay();
    return alertes.filter((a) => a.idLotGrains === idLot);
  },

  // Alertes
  getAllAlerts: async (filters?: {pays?: string;type?: string;}) => {
    await delay();
    let filtered = [...alertes];

    // Enrich with names
    const enriched = filtered.map((a) => {
      const ent = entrepots.find((e) => e.idEntrepot === a.idEntrepot);
      const exp = exploitations.find(
        (e) => e.idExploitation === ent?.idExploitation
      );
      const pays = paysList.find((p) => p.idPays === exp?.idPays);
      return {
        ...a,
        nomEntrepot: ent?.nom,
        nomExploitation: exp?.nom,
        nomPays: pays?.nom,
        idPays: pays?.idPays
      };
    });

    if (filters?.pays) {
      return enriched.filter((a) => a.idPays === filters.pays);
    }
    if (filters?.type) {
      return enriched.filter((a) => a.type === filters.type);
    }

    return enriched;
  },

  // ==========================================
  // CRUD — Pays
  // ==========================================

  // 🔌 APPEL API : GET /api/pays — Liste de tous les pays
  getAllPays: async () => {
    await delay();
    return [...paysList];
  },

  // 🔌 APPEL API : POST /api/pays — Créer un nouveau pays
  createPays: async (data: {
    nom: string;
    temperatureMin: number;
    temperatureMax: number;
    humiditeMin: number;
    humiditeMax: number;
  }) => {
    await delay();
    const newPays: Pays = {
      idPays: `${Date.now()}`,
      ...data
    };
    paysList.push(newPays);
    return newPays;
  },

  // 🔌 APPEL API : PUT /api/pays/:id — Modifier un pays
  updatePays: async (
  id: string,
  data: {
    nom: string;
    temperatureMin: number;
    temperatureMax: number;
    humiditeMin: number;
    humiditeMax: number;
  }) =>
  {
    await delay();
    const index = paysList.findIndex((p) => p.idPays === id);
    if (index === -1) throw new Error('Pays non trouvé');
    paysList[index] = { ...paysList[index], ...data };
    return paysList[index];
  },

  // 🔌 APPEL API : DELETE /api/pays/:id — Supprimer un pays
  deletePays: async (id: string) => {
    await delay();
    const index = paysList.findIndex((p) => p.idPays === id);
    if (index === -1) throw new Error('Pays non trouvé');
    paysList.splice(index, 1);
    return true;
  },

  // ==========================================
  // CRUD — Exploitations
  // ==========================================

  // 🔌 APPEL API : GET /api/exploitations — Liste de toutes les exploitations
  getAllExploitations: async () => {
    await delay();
    return exploitations.map((exp) => {
      const pays = paysList.find((p) => p.idPays === exp.idPays);
      return { ...exp, nomPays: pays?.nom || 'Inconnu' };
    });
  },

  // 🔌 APPEL API : POST /api/exploitations — Créer une nouvelle exploitation
  createExploitation: async (data: {nom: string;idPays: string;}) => {
    await delay();
    const newExp: Exploitation = {
      idExploitation: `exp-${Date.now()}`,
      ...data
    };
    exploitations.push(newExp);
    return newExp;
  },

  // 🔌 APPEL API : PUT /api/exploitations/:id — Modifier une exploitation
  updateExploitation: async (
  id: string,
  data: {nom: string;idPays: string;}) =>
  {
    await delay();
    const index = exploitations.findIndex((e) => e.idExploitation === id);
    if (index === -1) throw new Error('Exploitation non trouvée');
    exploitations[index] = { ...exploitations[index], ...data };
    return exploitations[index];
  },

  // 🔌 APPEL API : DELETE /api/exploitations/:id — Supprimer une exploitation
  deleteExploitation: async (id: string) => {
    await delay();
    const index = exploitations.findIndex((e) => e.idExploitation === id);
    if (index === -1) throw new Error('Exploitation non trouvée');
    exploitations.splice(index, 1);
    return true;
  },

  // ==========================================
  // CRUD — Entrepôts
  // ==========================================

  // 🔌 APPEL API : GET /api/entrepots — Liste de tous les entrepôts
  getAllEntrepots: async () => {
    await delay();
    return entrepots.map((ent) => {
      const exp = exploitations.find(
        (e) => e.idExploitation === ent.idExploitation
      );
      const pays = paysList.find((p) => p.idPays === exp?.idPays);
      return {
        ...ent,
        nomExploitation: exp?.nom || 'Inconnu',
        nomPays: pays?.nom || 'Inconnu'
      };
    });
  },

  // 🔌 APPEL API : POST /api/entrepots — Créer un nouvel entrepôt
  createEntrepot: async (data: {
    nom: string;
    adresse: string;
    limiteQte: number;
    idExploitation: string;
  }) => {
    await delay();
    const newEnt: Entrepot = {
      idEntrepot: `ent-${Date.now()}`,
      ...data
    };
    entrepots.push(newEnt);
    return newEnt;
  },

  // 🔌 APPEL API : PUT /api/entrepots/:id — Modifier un entrepôt
  updateEntrepot: async (
  id: string,
  data: {
    nom: string;
    adresse: string;
    limiteQte: number;
    idExploitation: string;
  }) =>
  {
    await delay();
    const index = entrepots.findIndex((e) => e.idEntrepot === id);
    if (index === -1) throw new Error('Entrepôt non trouvé');
    entrepots[index] = { ...entrepots[index], ...data };
    return entrepots[index];
  },

  // 🔌 APPEL API : DELETE /api/entrepots/:id — Supprimer un entrepôt
  deleteEntrepot: async (id: string) => {
    await delay();
    const index = entrepots.findIndex((e) => e.idEntrepot === id);
    if (index === -1) throw new Error('Entrepôt non trouvé');
    entrepots.splice(index, 1);
    return true;
  }
};