import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { MAX_SCORE, ROUND_DURATION_MS, ROUND_GAUGES } from '../config/gauges';
import { buildRoundResult, evaluateGauge } from '../scoring';
import type { GaugeDefinition } from '../types';
import { createTextButton, type TextButton } from '../ui/createTextButton';

export class Game extends Scene
{
    private roundStartedAt = 0;
    private hasDeployed = false;
    private readonly barWidth = 520;
    private readonly barLeft = 330;
    private activeGaugeRows: {
        definition: GaugeDefinition;
        phase: number;
        speed: number;
        marker: Phaser.GameObjects.Rectangle;
        valueText: Phaser.GameObjects.Text;
        stateText: Phaser.GameObjects.Text;
    }[] = [];
    private timerText!: Phaser.GameObjects.Text;
    private summaryText!: Phaser.GameObjects.Text;
    private timerBar!: Phaser.GameObjects.Rectangle;
    private deployButton!: TextButton;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const { width, height } = this.scale;

        this.roundStartedAt = this.time.now;
        this.hasDeployed = false;
        this.activeGaugeRows = [];

        this.cameras.main.setBackgroundColor(0x020617);
        this.add.image(width / 2, height / 2, 'background').setAlpha(0.08);
        this.add.rectangle(width / 2, height / 2, width - 40, height - 40, 0x0f172a, 0.92)
            .setStrokeStyle(2, 0x1e293b, 1);

        this.add.text(70, 52, 'Fenetre de deploiement', {
            fontFamily: 'Arial',
            fontSize: '38px',
            color: '#f8fafc',
            fontStyle: 'bold'
        });

        this.summaryText = this.add.text(70, 100, `Objectif: verrouiller un deploy propre sur ${MAX_SCORE} points.`, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#cbd5e1'
        });

        this.timerText = this.add.text(width - 70, 58, '', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

        this.add.rectangle(width / 2, 118, width - 140, 14, 0x1e293b, 1).setOrigin(0.5);
        this.timerBar = this.add.rectangle(70, 118, width - 140, 14, 0x38bdf8, 1).setOrigin(0, 0.5);

        ROUND_GAUGES.forEach((definition, index) => {
            const rowY = 198 + (index * 98);
            const barCenterX = this.barLeft + (this.barWidth / 2);
            const barTopY = rowY + 34;
            const idealWidth = this.barWidth * (definition.idealEnd - definition.idealStart);
            const idealCenterX = this.barLeft + (this.barWidth * definition.idealStart) + (idealWidth / 2);

            this.add.text(70, rowY, definition.label, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#f8fafc',
                fontStyle: 'bold'
            });

            this.add.text(70, rowY + 32, definition.description, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#94a3b8'
            });

            this.add.rectangle(barCenterX, barTopY, this.barWidth, 18, 0x0f172a, 1)
                .setStrokeStyle(2, 0x334155, 1);
            this.add.rectangle(idealCenterX, barTopY, idealWidth, 18, definition.accentColor, 0.25);

            this.add.text(this.barLeft, barTopY + 22, definition.minLabel, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#64748b'
            }).setOrigin(0, 0);

            this.add.text(this.barLeft + this.barWidth, barTopY + 22, definition.maxLabel, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#64748b'
            }).setOrigin(1, 0);

            const marker = this.add.rectangle(this.barLeft, barTopY, 10, 30, definition.accentColor, 1)
                .setStrokeStyle(2, 0xf8fafc, 0.9);

            const valueText = this.add.text(width - 70, rowY + 2, '', {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#e2e8f0',
                fontStyle: 'bold'
            }).setOrigin(1, 0);

            const stateText = this.add.text(width - 70, rowY + 32, '', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#94a3b8'
            }).setOrigin(1, 0);

            this.activeGaugeRows.push({
                definition,
                phase: Phaser.Math.FloatBetween(0, Math.PI * 2),
                speed: Phaser.Math.FloatBetween(0.001, 0.0018),
                marker,
                valueText,
                stateText
            });
        });

        this.deployButton = createTextButton(this, {
            x: width / 2,
            y: height - 70,
            width: 280,
            height: 64,
            label: 'Deploy maintenant',
            onClick: () => this.deploy(true),
            fillColor: 0x16a34a,
            hoverColor: 0x15803d
        });

        this.input.keyboard?.once('keydown-SPACE', () => this.deploy(true));
        this.input.keyboard?.once('keydown-ENTER', () => this.deploy(true));

        EventBus.emit('current-scene-ready', this);
    }

    update ()
    {
        if (this.hasDeployed)
        {
            return;
        }

        const elapsed = this.time.now - this.roundStartedAt;
        const progress = Math.min(elapsed / ROUND_DURATION_MS, 1);
        const timeLeftSeconds = Math.max(0, (ROUND_DURATION_MS - elapsed) / 1000);

        this.timerText.setText(`T-${timeLeftSeconds.toFixed(1)}s`);
        this.timerBar.width = (this.scale.width - 140) * (1 - progress);

        const normalizedValues = this.getCurrentGaugeValues(elapsed);

        normalizedValues.forEach((normalizedValue, index) => {
            const row = this.activeGaugeRows[index];
            const gaugePreview = evaluateGauge(row.definition, normalizedValue);

            row.marker.x = this.barLeft + (this.barWidth * normalizedValue);
            row.valueText.setText(gaugePreview.valueLabel);
            row.stateText.setText(gaugePreview.verdict);
            row.stateText.setColor(gaugePreview.isIdeal ? '#4ade80' : gaugePreview.scoreRatio >= 0.72 ? '#facc15' : '#fda4af');
        });

        if (progress >= 1)
        {
            this.deploy(false);
        }
    }

    private getCurrentGaugeValues (elapsed: number)
    {
        return this.activeGaugeRows.map(({ phase, speed }) => {
            const oscillation = 0.5 + (0.5 * Math.sin((elapsed * speed) + phase));

            return Math.max(0, Math.min(1, oscillation));
        });
    }

    private deploy (manualDeploy: boolean)
    {
        if (this.hasDeployed)
        {
            return;
        }

        this.hasDeployed = true;
        this.deployButton.setDisabled(true);
        this.deployButton.setLabel(manualDeploy ? 'Deploy envoye' : 'Deploy force');

        const deployedAtMs = Math.min(this.time.now - this.roundStartedAt, ROUND_DURATION_MS);
        const normalizedValues = this.getCurrentGaugeValues(deployedAtMs);
        const roundResult = buildRoundResult(
            ROUND_GAUGES,
            normalizedValues,
            ROUND_DURATION_MS,
            deployedAtMs,
            manualDeploy
        );

        this.time.delayedCall(260, () => {
            this.scene.start('GameOver', roundResult);
        });
    }
}
