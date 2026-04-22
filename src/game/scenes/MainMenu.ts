import { EventBus } from '../EventBus';
import { ROUND_DURATION_MS, ROUND_GAUGES } from '../config/gauges';
import { Scene } from 'phaser';
import { createTextButton } from '../ui/createTextButton';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2, 'background').setAlpha(0.12);
        this.add.rectangle(width / 2, height / 2, width - 64, height - 64, 0x0f172a, 0.9)
            .setStrokeStyle(2, 0x38bdf8, 0.45);

        this.add.text(width / 2, 88, 'Mini-jeu Devoxx', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#38bdf8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 136, 'Deploy au bon moment', {
            fontFamily: 'Arial',
            fontSize: '56px',
            color: '#f8fafc',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 192, 'Observe les jauges. Clique une fois sur Deploy. Le score depend du timing.', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#cbd5e1',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(120, 258, 'Regles de la manche', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#f8fafc',
            fontStyle: 'bold'
        });

        const rules = [
            `1. Une manche dure ${ROUND_DURATION_MS / 1000} secondes.`,
            '2. Cinq jauges bougent en permanence en parallele.',
            '3. Clique au meilleur moment pour verrouiller le deploiement.',
            '4. Chaque jauge rapporte des points selon sa proximite avec la zone ideale.'
        ];

        rules.forEach((rule, index) => {
            this.add.text(120, 304 + (index * 34), rule, {
                fontFamily: 'Arial',
                fontSize: '21px',
                color: '#e2e8f0'
            });
        });

        this.add.text(120, 470, 'Jauges retenues', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#f8fafc',
            fontStyle: 'bold'
        });

        ROUND_GAUGES.forEach((gauge, index) => {
            this.add.circle(138, 520 + (index * 34), 6, gauge.accentColor, 1);
            this.add.text(156, 510 + (index * 34), `${gauge.label} - ${gauge.description}`, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#cbd5e1'
            });
        });

        const startGame = () => {
            this.scene.start('Game');
        };

        createTextButton(this, {
            x: width / 2,
            y: height - 112,
            width: 320,
            height: 68,
            label: 'Lancer la manche',
            onClick: startGame,
            fillColor: 0x2563eb,
            hoverColor: 0x1d4ed8
        });

        this.add.text(width / 2, height - 56, 'Astuce: Espace ou Entree demarre aussi la partie.', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', startGame);
        this.input.keyboard?.once('keydown-ENTER', startGame);

        EventBus.emit('current-scene-ready', this);
    }
}
