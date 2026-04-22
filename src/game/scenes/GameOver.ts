import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import type { RoundResult } from '../types';
import { createTextButton } from '../ui/createTextButton';

export class GameOver extends Scene
{
    private roundResult: RoundResult | null = null;

    constructor ()
    {
        super('GameOver');
    }

    init (data: RoundResult)
    {
        this.roundResult = data;
    }

    create ()
    {
        const { width, height } = this.scale;
        const result = this.roundResult ?? {
            totalScore: 0,
            maxScore: 100,
            results: [],
            deployedAtMs: 0,
            durationMs: 12000,
            manualDeploy: false
        };

        this.cameras.main.setBackgroundColor(0x020617);
        this.add.image(width / 2, height / 2, 'background').setAlpha(0.08);
        this.add.rectangle(width / 2, height / 2, width - 64, height - 64, 0x0f172a, 0.92)
            .setStrokeStyle(2, 0x38bdf8, 0.38);

        this.add.text(width / 2, 88, 'Resultat du deploy', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 146, `${result.totalScore} / ${result.maxScore}`, {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#38bdf8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 214, this.getFinalVerdict(result.totalScore, result.maxScore), {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#e2e8f0'
        }).setOrigin(0.5);

        this.add.text(width / 2, 250, result.manualDeploy
            ? `Deploy declenche a ${(result.deployedAtMs / 1000).toFixed(1)}s.`
            : 'Le chrono est arrive a zero: deploy automatique en mode panique.',
        {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        result.results.forEach((gaugeResult, index) => {
            const rowY = 332 + (index * 68);

            this.add.rectangle(width / 2, rowY, width - 180, 54, 0x111827, 0.95)
                .setStrokeStyle(1, gaugeResult.accentColor, 0.55);
            this.add.text(112, rowY - 14, gaugeResult.label, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#f8fafc',
                fontStyle: 'bold'
            });
            this.add.text(112, rowY + 10, gaugeResult.valueLabel, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#94a3b8'
            });
            this.add.text(width - 220, rowY - 12, gaugeResult.verdict, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#e2e8f0'
            }).setOrigin(1, 0);
            this.add.text(width - 112, rowY - 12, `${gaugeResult.score}/${gaugeResult.maxScore}`, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#f8fafc',
                fontStyle: 'bold'
            }).setOrigin(1, 0);
        });

        const restart = () => {
            this.scene.start('MainMenu');
        };

        createTextButton(this, {
            x: width / 2,
            y: height - 84,
            width: 300,
            height: 66,
            label: 'Rejouer',
            onClick: restart,
            fillColor: 0x2563eb,
            hoverColor: 0x1d4ed8
        });

        this.input.keyboard?.once('keydown-SPACE', restart);
        this.input.keyboard?.once('keydown-ENTER', restart);

        EventBus.emit('current-scene-ready', this);
    }

    private getFinalVerdict (score: number, maxScore: number)
    {
        const ratio = score / maxScore;

        if (ratio >= 0.9)
        {
            return 'Mise en prod zen. Meme le SRE sourit.';
        }

        if (ratio >= 0.72)
        {
            return 'Deploy propre. On garde quand meme un oeil sur les dashboards.';
        }

        if (ratio >= 0.45)
        {
            return 'Ca passe, mais prepare le message Slack au cas ou.';
        }

        return "Rollback mental immediat. Le stand t'a vu.";
    }
}
