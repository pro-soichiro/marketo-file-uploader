<script setup>
import { ref } from 'vue'

const isDraggingOver = ref(false)

function dragEnter() {
  isDraggingOver.value = true
}

function dragLeave() {
  isDraggingOver.value = false
}

const data = ref({ files: [] })
const filenames = ref([])
const res = ref(null)
const error = ref([])
const loading = ref(false)
const allowedExtensions = ['pdf', 'docs', 'doc', 'xlsx', 'xls']
const maxFileSizeMb = 3
const maxFileCount = 3

function handleFiles(event) {
  isDraggingOver.value = false
  let files

  if (event.type === 'change') {
    files = Array.from(event.target.files)
  } else if (event.type === 'drop') {
    files = Array.from(event.dataTransfer.files)
  }

  if (!files) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    const extension = file.name.split('.').pop().toLowerCase()

    if (!allowedExtensions.includes(extension)) {
      alert(
        `${
          file.name
        } は許可されていないファイル形式です。\n(許可されている拡張子: ${allowedExtensions.join(
          ' '
        )})`
      )
      return
    }

    if (!(file.size <= maxFileSizeMb * 1024 * 1024)) {
      alert(`ファイルサイズの最大値は3MBまでです。`)
      return
    }

    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(file.name)) {
      alert('ファイル名に使用できない文字が含まれています。')
      return
    }
  }

  if (files.length + data.value.files.length > maxFileCount) {
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
