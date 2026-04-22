<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './game/EventBus';
import StartGame from './game/main';
import Phaser from 'phaser';

// Save the current scene instance
const scene = ref<Phaser.Scene | null>(null);
const game = ref<Phaser.Game | null>(null);

const emit = defineEmits(['current-active-scene']);
const handleCurrentSceneReady = (sceneInstance: Phaser.Scene) => {

    emit('current-active-scene', sceneInstance);

    scene.value = sceneInstance;

};

onMounted(() => {

    game.value = StartGame('game-container');

    EventBus.on('current-scene-ready', handleCurrentSceneReady);

});

onUnmounted(() => {

    EventBus.off('current-scene-ready', handleCurrentSceneReady);

    if (game.value)
    {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>

<template>
    <div id="game-container"></div>
</template>
