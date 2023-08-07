<script setup>
import { ref } from 'vue'
import { isValidFiles } from '@/utils/validation'

const isDraggingOver = ref(false)
const data = ref({ files: [] })
const filenames = ref([])
const res = ref(null)
const error = ref(null)
const loading = ref(false)

function dragEnter() {
  isDraggingOver.value = true
}
function dragLeave() {
  isDraggingOver.value = false
}
function handleDrop(event) {
  isDraggingOver.value = false

  const files = event.dataTransfer.files
  const filesAry = Array.from(files)

  filesAry.forEach((file) => {
    data.value.files.push(file)
    filenames.value.push(file.name)
  })
}
function handleDialog(event) {
  isDraggingOver.value = false

  const filesAry = Array.from(event.target.files)
  filesAry.forEach((file) => {
    data.value.files.push(file)
    filenames.value.push(file.name)
  })
}

async function submitForm() {
  loading.value = true
  filenames.value = []

  if (isValidFiles(data.value.files)) {
    await postData()
  } else {
    loading.value = false
    data.value.files = []
    filenames.value = []
    error.value = 'エラーがあります。確認して下さい'
  }
}

async function postData() {
  const formData = new FormData()

  formData.append('marketo[mktoId]', document.getElementById('mktoId').value)
  formData.append('marketo[email]', document.getElementById('Email').value)
  data.value.files.forEach((file) => {
    formData.append('marketo[files][]', file)
  })

  try {
    const response = await fetch('http://localhost:3000/api/marketo', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    res.value = await response.json()
    console.info('送信完了')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const fileInput = ref(null)

function openFileDialog() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>{{ isDraggingOver }}</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="loading">送信中...</div>
    <div
      class="dropzone"
      :class="isDraggingOver ? 'isDraggingOver' : ''"
      @dragover.prevent
      @drop.prevent
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @drop="handleDrop"
    >
      <span>ここにファイルをドラッグ&ドロップして下さい</span>
      <span>または</span>
      <button type="button" @click="openFileDialog">ファイルを選択</button>
    </div>

    <ul>
      <li v-for="(filename, key) in filenames" v-bind:key="key">
        {{ filename }}
      </li>
    </ul>
    <input
      @change="handleDialog"
      id="fileInput"
      ref="fileInput"
      type="file"
      accept=".pdf,.xls,.xlsx,.doc,.docx"
      multiple
    />
    <button type="submit" class="submit">送信する</button>
  </form>
</template>

<style lang="scss" scoped>
.dropzone {
  width: 400px;
  height: 200px;
  border: 3px dashed gray;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &.isDraggingOver {
    background-color: lightgray;
  }
}

#fileInput {
  display: none;
}
</style>
