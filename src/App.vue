<script setup lang="ts">
import PhaserGame from './PhaserGame.vue';
</script>

<template>
    <main class="app-shell">
        <section class="app-panel">
            <div class="app-header">
                <p class="app-eyebrow">Stand Devoxx</p>
                <h1>Deploy au bon moment</h1>
                <p class="app-subtitle">Observe les signaux, clique une fois, puis assume les consequences.</p>
            </div>
            <PhaserGame />
        </section>
    </main>
</template>
