<script setup>
import { ref } from 'vue'
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_MB,
  ALLOWED_EXTENSIONS,
  isValidFileCount,
  isValidExtension,
  isValidSize,
  isValidFileName
} from '@/utils/validation'

const isDraggingOver = ref(false)
const data = ref({ files: [] })
const filenames = ref([])

const success = ref(null)
const errors = ref([])
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
      alert(
        `許可されていないファイル形式です: ${file.name
          .split('.')
          .pop()
          .toLowerCase()} \n(許可しているファイル形式: ${ALLOWED_EXTENSIONS.join(',')})`
      )
      return
    }

    if (!isValidSize(file.size)) {
      alert(`ファイルサイズの最大値は${MAX_FILE_SIZE_MB}MBまでです。`)
      return
    }

    if (!isValidFileName(file.name)) {
      alert('ファイル名に使用できない文字が含まれています。')
      return
    }
  }

  if (!isValidFileCount(files.length, data.value.files.length)) {
    alert(`最大添付数は${MAX_FILE_COUNT}ファイルまでです。`)
    return
  }

  files.forEach((file) => {
    data.value.files.push(file)
    filenames.value.push(file.name)
  })
}

async function submitForm() {
  if (data.value.files.length <= 0) {
    alert('ファイルを選択してください。')
    return
  }

  loading.value = true
  filenames.value = []
  errors.value = []
  await postData()
}

async function postData() {
  const mktoId = document.getElementById('mktoId').value
  const email = document.getElementById('Email').value

  try {
    let files = data.value.files
    let processedFiles = 0
    let attachments = []
    let totalfilename = []

    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader()

      reader.onload = async function (e) {
        const base64File = e.target.result.split(',')[1]
        attachments.push({
          name: files[i].name,
          data: base64File
        })
        totalfilename.push(files[i].name)

        processedFiles++

        if (processedFiles === files.length) {
          const response = await Email.send({
            SecureToken: '99fe4c28-48bf-4027-b9f2-a5cd421bcc82',
            To: 'soichiro.mamiya@anconsulting.jp',
            From: 'soichiro.mamiya@anconsulting.jp',
            Subject: '【Marketo】経歴書アップロード通知',
            Body: `■ファイルのアップロードがありました。<br><br>
              Marketo ID:<br>${mktoId}<br><br>
              Email:<br>${email}<br><br>
              経歴書:<br>${totalfilename.join('<br>')}
            `,
            Attachments: attachments
          })
          loading.value = false

          if (response == 'OK') {
            success.value = '送信完了しました。'
            setTimeout(() => {
              window.location.href = 'http://localhost:5173'
            }, 2000)
          } else {
            errors.value.push('サーバーエラーが発生しました。')
            errors.value.push('お手数ですが、マイページからのアップロードをお願いいたします。')
            errors.value.push('自動でログイン画面へ遷移します。')
            console.error(response)
            setTimeout(() => {
              window.location.href = 'https://admin.furien.jp/users/sign_in/'
            }, 3000)
          }
        }
      }

      reader.readAsDataURL(files[i])
    }
  } catch (err) {
    loading.value = false
    errors.value.push('サーバーエラーが発生しました。')
    errors.value.push('お手数ですが、マイページからのアップロードをお願いいたします。')
    errors.value.push('自動でログイン画面へ遷移します。')
    console.error(err)
    setTimeout(() => {
      window.location.href = 'https://admin.furien.jp/users/sign_in/'
    }, 3000)
  }
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div v-if="success">{{ success }}</div>
    <ul v-if="errors">
      <li v-for="(error, key) in errors" v-bind:key="key">
        {{ error }}
      </li>
    </ul>
    <div v-if="loading">送信中...</div>

    <div class="dropzone-wrapper">
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
    <div class="submit-wrapper">
      <button type="submit" class="submit">送信する</button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.dropzone-wrapper {
  background-color: rgba(28, 39, 51, 0.07);
  padding: 24px;
}
.dropzone {
  max-width: 600px;
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

.submit-wrapper {
  text-align: center;
}
.submit {
  color: #fff !important;
  background-color: #0e5fb1 !important;
  border: none;
  user-select: none;
  padding: 0.84rem 2.14rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.125rem;

  cursor: pointer;
  transition: all 0.15s ease-in-out;
  box-shadow:
    0 2px 5px 0 rgba(0, 0, 0, 0.16),
    0 2px 10px 0 rgba(0, 0, 0, 0.12);

  &:hover {
    box-shadow:
      0 5px 11px 0 rgba(0, 0, 0, 0.18),
      0 4px 15px 0 rgba(0, 0, 0, 0.15);
    transition: all 0.15s ease-in-out;
  }
}
</style>
