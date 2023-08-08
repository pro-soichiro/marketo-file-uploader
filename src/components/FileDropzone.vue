<script setup>
import { ref } from 'vue'
import {
  isValidFileCount,
  isValidExtension,
  isValidSize,
  isValidFileName
} from '@/utils/validation'

const isDraggingOver = ref(false)
const data = ref({ files: [] })
const filenames = ref([])
const error = ref([])
const loading = ref(false)

const fileInput = ref(null)

function openFileDialog() {
  fileInput.value?.click()
}

function dragEnter() {
  isDraggingOver.value = true
}

function dragLeave() {
  isDraggingOver.value = false
}

function handleFiles(event) {
  isDraggingOver.value = false
  const files =
    event.type === 'change' ? Array.from(event.target.files) : Array.from(event.dataTransfer.files)

  for (const file of files) {
    if (!isValidExtension(file.name)) {
      alert(`許可されていないファイル形式です: ${file.name}`)
      return
    }

    if (!isValidSize(file.size)) {
      alert('ファイルサイズの最大値は3MBまでです。')
      return
    }

    if (!isValidFileName(file.name)) {
      alert('ファイル名に使用できない文字が含まれています。')
      return
    }
  }

  if (isValidFileCount(files.length, data.value.files.length)) {
    alert('最大添付数は3ファイルまでです。')
    return
  }

  files.forEach((file) => {
    data.value.files.push(file)
    filenames.value.push(file.name)
  })
}

async function submitForm() {
  loading.value = true
  filenames.value = []
  await postData()
  loading.value = false
  data.value.files = []
}
const success = ref(null)

const endpoint = ref('https://pre-admin.furien.jp/api/marketo')
const ENDPOINT = 'https://pre-admin.furien.jp/api/marketo'
// const endpoint = ref('http://localhost:3000/api/marketo')
// const ENDPOINT = 'http://localhost:3000/api/marketo'

async function postData() {
  const formData = new FormData()
  formData.append('marketo[mktoId]', document.getElementById('mktoId').value)
  formData.append('marketo[email]', document.getElementById('Email').value)
  data.value.files.forEach((file) => formData.append('marketo[files][]', file))

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    console.info('送信完了')
    success.value = '送信完了'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>{{ endpoint }}</div>
    <div>{{ isDraggingOver }}</div>
    <div v-if="success">{{ success }}</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="loading">送信中...</div>

    <div
      class="dropzone"
      :class="isDraggingOver ? 'isDraggingOver' : ''"
      @dragover.prevent
      @drop.prevent
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @drop="handleFiles"
    >
      ここにファイルをドラッグ&ドロップして下さい
      <br />
      または
      <br />
      <button type="button" @click="openFileDialog">ファイルを選択</button>
    </div>

    <ul>
      <li v-for="(filename, key) in filenames" v-bind:key="key">
        {{ filename }}
      </li>
    </ul>
    <input
      @change="handleFiles"
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
  text-align: center;

  &.isDraggingOver {
    background-color: lightgray;
  }
}

#fileInput {
  display: none;
}
</style>
