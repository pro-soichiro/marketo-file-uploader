<script setup>
import TheHeader from './components/TheHeader.vue'
import FileDropzone from './components/FileDropzone.vue'
</script>

<template>
  <main>
    <TheHeader />
    <h1>経歴書アップロード</h1>
    <FileDropzone />
  </main>
</template>

<style scoped>
h1 {
  font-size: 2rem;
  font-weight: 500;
  text-align: center;
}
</style>
