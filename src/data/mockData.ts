export interface Pays {
  idPays: string;
  nom: string;
  temperatureMin: number;
  temperatureMax: number;
  humiditeMin: number;
  humiditeMax: number;
}

export interface Exploitation {
  idExploitation: string;
  idPays: string;
  nom: string;
}

export interface Utilisateur {
  idUtilisateur: string;
  idExploitation: string;
  nom: string;
  prenom: string;
  mail: string;
}

export interface Entrepot {
  idEntrepot: string;
  idExploitation: string;
  nom: string;
  adresse: string;
  limiteQte: number;
}

export type StatutLot = 'conforme' | 'en alerte' | 'périmé';

export interface LotGrains {
  idLotGrains: string;
  idEntrepot: string;
  datSto: string;
  statut: StatutLot;
  datSortie?: string;
}

export interface Mesure {
  idMesure: string;
  idEntrepot: string;
  temperature: number;
  humidite: number;
  datMesure: string;
}

export type TypeAlerte =
'Température hors plage' |
'Humidité hors plage' |
'Lot périmé' |
'Lot proche péremption';

export interface Alerte {
  idAlerte: string;
  idMesure?: string;
  idLotGrains?: string;
  idEntrepot: string;
  type: TypeAlerte;
  valeurMesuree?: number;
  dateAlerte: string;
  statut: 'en cours' | 'traitée';
}

// --- MOCK DATA ---

export const paysList: Pays[] = [
{
  idPays: '1',
  nom: 'Brésil',
  temperatureMin: 18,
  temperatureMax: 25,
  humiditeMin: 60,
  humiditeMax: 70
},
{
  idPays: '2',
  nom: 'Équateur',
  temperatureMin: 15,
  temperatureMax: 22,
  humiditeMin: 65,
  humiditeMax: 75
},
{
  idPays: '3',
  nom: 'Colombie',
  temperatureMin: 17,
  temperatureMax: 24,
  humiditeMin: 60,
  humiditeMax: 70
}];


export const exploitations: Exploitation[] = [
{ idExploitation: 'exp-1', idPays: '1', nom: 'Fazenda Santa Inês' },
{ idExploitation: 'exp-2', idPays: '1', nom: 'Sitio São Francisco' },
{ idExploitation: 'exp-3', idPays: '2', nom: 'Finca El Paraíso' },
{ idExploitation: 'exp-4', idPays: '3', nom: 'Hacienda La Esmeralda' },
{ idExploitation: 'exp-5', idPays: '3', nom: 'Finca Los Arboles' }];


export const utilisateurs: Utilisateur[] = [
{
  idUtilisateur: 'u-1',
  idExploitation: 'exp-1',
  nom: 'Silva',
  prenom: 'João',
  mail: 'joao@futurekawa.com'
},
{
  idUtilisateur: 'u-2',
  idExploitation: 'exp-3',
  nom: 'Mendoza',
  prenom: 'Carlos',
  mail: 'carlos@futurekawa.com'
}];


export const entrepots: Entrepot[] = [
{
  idEntrepot: 'ent-1',
  idExploitation: 'exp-1',
  nom: 'Entrepôt Principal Sul',
  adresse: 'Route 45, Minas Gerais',
  limiteQte: 5000
},
{
  idEntrepot: 'ent-2',
  idExploitation: 'exp-1',
  nom: 'Entrepôt Nord',
  adresse: 'Route 46, Minas Gerais',
  limiteQte: 3000
},
{
  idEntrepot: 'ent-3',
  idExploitation: 'exp-3',
  nom: 'Bodega Central',
  adresse: 'Quito, Secteur Sud',
  limiteQte: 4000
},
{
  idEntrepot: 'ent-4',
  idExploitation: 'exp-4',
  nom: 'Almacén Antioquia',
  adresse: 'Medellín, Zone Industrielle',
  limiteQte: 6000
}];


// Generate lots
const generateLots = (): LotGrains[] => {
  const lots: LotGrains[] = [];
  const now = new Date();

  entrepots.forEach((ent) => {
    // 5 to 15 lots per warehouse
    const numLots = Math.floor(Math.random() * 10) + 5;
    for (let i = 0; i < numLots; i++) {
      // Random age between 10 and 400 days
      const ageDays = Math.floor(Math.random() * 390) + 10;
      const datSto = new Date(
        now.getTime() - ageDays * 24 * 60 * 60 * 1000
      ).toISOString();

      let statut: StatutLot = 'conforme';
      if (ageDays > 365) statut = 'périmé';else
      if (Math.random() > 0.8) statut = 'en alerte'; // Random alert status

      lots.push({
        idLotGrains: `lot-${ent.idEntrepot}-${i}`,
        idEntrepot: ent.idEntrepot,
        datSto,
        statut
      });
    }
  });
  return lots;
};

export const lotsGrains: LotGrains[] = generateLots();

// Generate measures for the last 30 days
const generateMesures = (): Mesure[] => {
  const mesures: Mesure[] = [];
  const now = new Date();

  entrepots.forEach((ent) => {
    const exp = exploitations.find(
      (e) => e.idExploitation === ent.idExploitation
    );
    const pays = paysList.find((p) => p.idPays === exp?.idPays);

    if (!pays) return;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      // Generate 4 measures per day
      for (let j = 0; j < 4; j++) {
        const measureDate = new Date(
          date.getTime() + j * 6 * 60 * 60 * 1000
        ).toISOString();

        // Add some random noise, occasionally going out of bounds
        const isOutlier = Math.random() > 0.95;
        const tempNoise = isOutlier ?
        Math.random() > 0.5 ?
        5 :
        -5 :
        Math.random() * 2 - 1;
        const humNoise = isOutlier ?
        Math.random() > 0.5 ?
        10 :
        -10 :
        Math.random() * 4 - 2;

        const baseTemp = (pays.temperatureMin + pays.temperatureMax) / 2;
        const baseHum = (pays.humiditeMin + pays.humiditeMax) / 2;

        mesures.push({
          idMesure: `mes-${ent.idEntrepot}-${i}-${j}`,
          idEntrepot: ent.idEntrepot,
          temperature: Number((baseTemp + tempNoise).toFixed(1)),
          humidite: Number((baseHum + humNoise).toFixed(1)),
          datMesure: measureDate
        });
      }
    }
  });
  return mesures;
};

export const mesures: Mesure[] = generateMesures();

// Generate alerts based on lots and measures
const generateAlertes = (): Alerte[] => {
  const alertes: Alerte[] = [];
  let alertId = 1;

  // Expired lots alerts
  lotsGrains.
  filter((l) => l.statut === 'périmé').
  forEach((lot) => {
    alertes.push({
      idAlerte: `al-${alertId++}`,
      idLotGrains: lot.idLotGrains,
      idEntrepot: lot.idEntrepot,
      type: 'Lot périmé',
      dateAlerte: new Date().toISOString(),
      statut: 'en cours'
    });
  });

  // Out of bounds measures alerts (just taking a few recent ones)
  const recentMesures = mesures.slice(-100);
  recentMesures.forEach((m) => {
    const ent = entrepots.find((e) => e.idEntrepot === m.idEntrepot);
    const exp = exploitations.find(
      (e) => e.idExploitation === ent?.idExploitation
    );
    const pays = paysList.find((p) => p.idPays === exp?.idPays);

    if (!pays) return;

    if (
    m.temperature < pays.temperatureMin ||
    m.temperature > pays.temperatureMax)
    {
      alertes.push({
        idAlerte: `al-${alertId++}`,
        idMesure: m.idMesure,
        idEntrepot: m.idEntrepot,
        type: 'Température hors plage',
        valeurMesuree: m.temperature,
        dateAlerte: m.datMesure,
        statut: Math.random() > 0.5 ? 'en cours' : 'traitée'
      });
    }

    if (m.humidite < pays.humiditeMin || m.humidite > pays.humiditeMax) {
      alertes.push({
        idAlerte: `al-${alertId++}`,
        idMesure: m.idMesure,
        idEntrepot: m.idEntrepot,
        type: 'Humidité hors plage',
        valeurMesuree: m.humidite,
        dateAlerte: m.datMesure,
        statut: Math.random() > 0.5 ? 'en cours' : 'traitée'
      });
    }
  });

  return alertes.sort(
    (a, b) =>
    new Date(b.dateAlerte).getTime() - new Date(a.dateAlerte).getTime()
  );
};

export const alertes: Alerte[] = generateAlertes();