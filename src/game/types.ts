export interface GaugeDefinition
{
    id: string;
    label: string;
    description: string;
    minLabel: string;
    maxLabel: string;
    idealStart: number;
    idealEnd: number;
    weight: number;
    accentColor: number;
    formatValue: (normalizedValue: number) => string;
}

export interface GaugeResult
{
    id: string;
    label: string;
    description: string;
    minLabel: string;
    maxLabel: string;
    accentColor: number;
    normalizedValue: number;
    valueLabel: string;
    score: number;
    maxScore: number;
    scoreRatio: number;
    isIdeal: boolean;
    verdict: string;
}

export interface RoundResult
{
    totalScore: number;
    maxScore: number;
    results: GaugeResult[];
    deployedAtMs: number;
    durationMs: number;
    manualDeploy: boolean;
}
