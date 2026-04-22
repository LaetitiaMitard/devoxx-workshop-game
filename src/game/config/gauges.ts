import type { GaugeDefinition } from '../types';

const WEEK_DAYS = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche'
];

const clampNormalized = (value: number) => Math.max(0, Math.min(1, value));

const interpolateNumber = (min: number, max: number, normalizedValue: number) =>
{
    const safeNormalized = clampNormalized(normalizedValue);

    return Math.round(min + ((max - min) * safeNormalized));
};

const pickDiscreteValue = (values: string[], normalizedValue: number) =>
{
    const index = Math.round(clampNormalized(normalizedValue) * (values.length - 1));

    return values[index];
};

export const ROUND_DURATION_MS = 12000;
export const ROUND_GAUGES: GaugeDefinition[] = [
    {
        id: 'weekday',
        label: 'Jour de la semaine',
        description: 'Le mardi-jeudi, personne ne panique encore.',
        minLabel: 'Lundi noir',
        maxLabel: 'Dimanche YOLO',
        idealStart: 0.18,
        idealEnd: 0.52,
        weight: 20,
        accentColor: 0x38bdf8,
        formatValue: (normalizedValue) => pickDiscreteValue(WEEK_DAYS, normalizedValue)
    },
    {
        id: 'hour',
        label: 'Heure de deploiement',
        description: "Le ventre plein vaut mieux qu'un vendredi 18h.",
        minLabel: 'Trop tot',
        maxLabel: 'Beaucoup trop tard',
        idealStart: 0.42,
        idealEnd: 0.58,
        weight: 20,
        accentColor: 0xf97316,
        formatValue: (normalizedValue) =>
        {
            const hour = interpolateNumber(7, 22, normalizedValue);

            return `${hour.toString().padStart(2, '0')}:00`;
        }
    },
    {
        id: 'teammates',
        label: 'Collabs presents',
        description: 'Assez pour aider, pas assez pour faire un comite.',
        minLabel: 'Open space vide',
        maxLabel: 'Tout le plateau regarde',
        idealStart: 0.5,
        idealEnd: 0.76,
        weight: 20,
        accentColor: 0x34d399,
        formatValue: (normalizedValue) => `${interpolateNumber(2, 26, normalizedValue)} personnes`
    },
    {
        id: 'alerts',
        label: 'Alertes ouvertes',
        description: 'Moins il y en a, plus le coeur ralentit.',
        minLabel: 'Silence radio',
        maxLabel: 'Pager en fusion',
        idealStart: 0.02,
        idealEnd: 0.18,
        weight: 20,
        accentColor: 0xf43f5e,
        formatValue: (normalizedValue) => `${interpolateNumber(0, 12, normalizedValue)} alertes`
    },
    {
        id: 'coffee',
        label: 'Niveau de cafe',
        description: 'Assez de caffeine pour tenir, pas de tremblements.',
        minLabel: 'Deca involontaire',
        maxLabel: 'Main qui tremble',
        idealStart: 0.58,
        idealEnd: 0.82,
        weight: 20,
        accentColor: 0xeab308,
        formatValue: (normalizedValue) => `${interpolateNumber(15, 100, normalizedValue)} %`
    }
];

export const MAX_SCORE = ROUND_GAUGES.reduce((total, gauge) => total + gauge.weight, 0);
