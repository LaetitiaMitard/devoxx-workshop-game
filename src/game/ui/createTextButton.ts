import { GameObjects, Geom, Scene } from 'phaser';

interface TextButtonOptions
{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    onClick: () => void;
    fillColor?: number;
    hoverColor?: number;
    disabledFillColor?: number;
}

export interface TextButton
{
    container: GameObjects.Container;
    setDisabled: (disabled: boolean) => void;
    setLabel: (label: string) => void;
}

export const createTextButton = (scene: Scene, options: TextButtonOptions): TextButton =>
{
    const {
        x,
        y,
        width,
        height,
        label,
        onClick,
        fillColor = 0x2563eb,
        hoverColor = 0x3b82f6,
        disabledFillColor = 0x475569
    } = options;

    const background = scene.add.rectangle(0, 0, width, height, fillColor, 1)
        .setStrokeStyle(2, 0xe2e8f0, 0.45);
    const text = scene.add.text(0, 0, label, {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#f8fafc',
        fontStyle: 'bold'
    }).setOrigin(0.5);

    const container = scene.add.container(x, y, [background, text]);
    let isDisabled = false;

    container.setSize(width, height);
    container.setInteractive(
        new Geom.Rectangle(-width / 2, -height / 2, width, height),
        Geom.Rectangle.Contains
    );

    container.on('pointerover', () =>
    {
        if (!isDisabled)
        {
            background.setFillStyle(hoverColor, 1);
        }
    });

    container.on('pointerout', () =>
    {
        background.setFillStyle(isDisabled ? disabledFillColor : fillColor, 1);
    });

    container.on('pointerdown', () =>
    {
        if (!isDisabled)
        {
            background.setScale(0.98);
        }
    });

    container.on('pointerup', () =>
    {
        background.setScale(1);

        if (!isDisabled)
        {
            onClick();
        }
    });

    return {
        container,
        setDisabled: (disabled: boolean) =>
        {
            isDisabled = disabled;
            background.setFillStyle(disabled ? disabledFillColor : fillColor, 1);
            container.disableInteractive();

            if (!disabled)
            {
                container.setInteractive(
                    new Geom.Rectangle(-width / 2, -height / 2, width, height),
                    Geom.Rectangle.Contains
                );
            }
        },
        setLabel: (nextLabel: string) =>
        {
            text.setText(nextLabel);
        }
    };
};
