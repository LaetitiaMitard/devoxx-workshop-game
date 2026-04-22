import type { GaugeDefinition, GaugeResult, RoundResult } from './types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const scoreVerdict = (scoreRatio: number, isIdeal: boolean) =>
{
    if (isIdeal)
    {
        return 'Nickel';
    }

    if (scoreRatio >= 0.72)
    {
        return 'Ca passe';
    }

    if (scoreRatio >= 0.4)
    {
        return 'Tendu';
    }

    return 'Incident';
};

export const evaluateGauge = (definition: GaugeDefinition, normalizedValue: number): GaugeResult =>
{
    const safeValue = clamp(normalizedValue, 0, 1);
    const distanceToIdeal = safeValue < definition.idealStart
        ? definition.idealStart - safeValue
        : safeValue > definition.idealEnd
            ? safeValue - definition.idealEnd
            : 0;
    const maxDistance = Math.max(definition.idealStart, 1 - definition.idealEnd, 0.001);
    const scoreRatio = distanceToIdeal === 0 ? 1 : clamp(1 - (distanceToIdeal / maxDistance), 0, 1);
    const score = Math.round(scoreRatio * definition.weight);

    return {
        id: definition.id,
        label: definition.label,
        description: definition.description,
        minLabel: definition.minLabel,
        maxLabel: definition.maxLabel,
        accentColor: definition.accentColor,
        normalizedValue: safeValue,
        valueLabel: definition.formatValue(safeValue),
        score,
        maxScore: definition.weight,
        scoreRatio,
        isIdeal: distanceToIdeal === 0,
        verdict: scoreVerdict(scoreRatio, distanceToIdeal === 0)
    };
};

export const buildRoundResult = (
    definitions: GaugeDefinition[],
    normalizedValues: number[],
    durationMs: number,
    deployedAtMs: number,
    manualDeploy: boolean
): RoundResult =>
{
    const results = definitions.map((definition, index) => evaluateGauge(definition, normalizedValues[index] ?? 0));
    const maxScore = definitions.reduce((total, definition) => total + definition.weight, 0);
    const totalScore = results.reduce((total, result) => total + result.score, 0);

    return {
        totalScore,
        maxScore,
        results,
        deployedAtMs,
        durationMs,
        manualDeploy
    };
};
