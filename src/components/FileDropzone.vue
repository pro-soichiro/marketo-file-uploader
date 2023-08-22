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
const data = ref([])

const status = ref('ready')

const fileInput = ref(null)

let dragCounter = 0

function openFileDialog() {
  fileInput.value?.click()
}

function dragEnter() {
  dragCounter++
  if (dragCounter === 1) {
    isDraggingOver.value = true
  }
}

function dragLeave() {
  dragCounter--
  if (dragCounter === 0) {
    isDraggingOver.value = false
  }
}

function handleFiles(event) {
  dragCounter = 0
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

  if (!isValidFileCount(files.length, data.value.length)) {
    alert(`最大添付数は${MAX_FILE_COUNT}ファイルまでです。`)
    return
  }

  files.forEach((file) => {
    data.value.push({ file: file, filename: file.name })
  })
}

async function submitForm() {
  if (data.value.length <= 0) {
    alert('ファイルを選択してください。')
    return
  }

  status.value = 'sending'
  await postData()
}

async function postData() {
  const mktoId = document.getElementById('mktoId').value
  const email = document.getElementById('Email').value
  console.log('埋め込み側', this, email)

  try {
    let processedFiles = 0
    let attachments = []

    for (let i = 0; i < data.value.length; i++) {
      let reader = new FileReader()

      reader.onload = async function (e) {
        const base64File = e.target.result.split(',')[1]
        attachments.push({
          name: data.value[i].filename,
          data: base64File
        })

        processedFiles++

        if (processedFiles === data.value.length) {
          // eslint-disable-next-line no-undef
          const response = await Email.send({
            SecureToken: '99fe4c28-48bf-4027-b9f2-a5cd421bcc82',
            To: 'soichiro.mamiya@anconsulting.jp',
            From: 'soichiro.mamiya@anconsulting.jp',
            Subject: '【Marketo】経歴書アップロード通知',
            Body: `■ファイルのアップロードがありました。<br><br>
              Marketo ID:<br>${mktoId}<br><br>
              Email:<br>${email}<br><br>
              経歴書:<br>${data.value.map((file) => file.filename).join('<br>')}
            `,
            Attachments: attachments
          })
          if (response == 'OK') {
            status.value = 'success'
            setTimeout(() => {
              // window.location.href = 'http://localhost:5173'
              location.reload()
            }, 3000)
          } else {
            status.value = 'error'
            setTimeout(() => {
              window.location.href = 'https://admin.furien.jp/users/sign_in/'
            }, 3000)
          }
        }
      }

      reader.readAsDataURL(data.value[i].file)
    }
  } catch (err) {
    status.value = 'error'
    setTimeout(() => {
      window.location.href = 'https://admin.furien.jp/users/sign_in/'
    }, 3000)
  }
}

function removeFile(index) {
  const FILE_COUNT = 1
  data.value.splice(index, FILE_COUNT)
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <div v-if="status === 'ready'">
      <ul class="filename__ul">
        <li class="filename__li" v-for="({ filename }, index) in data" v-bind:key="index">
          <button type="button" @click="removeFile(index)">削除</button>
          {{ filename }}
        </li>
      </ul>

      <div class="dropzone">
        <div
          class="dropzone__inner"
          :class="isDraggingOver ? 'isDraggingOver' : ''"
          @dragover.prevent
          @drop.prevent
          @dragenter="dragEnter"
          @dragleave="dragLeave"
          @drop="handleFiles"
        >
          <p>ファイルをここに<br class="sm" />ドラッグ＆ドロップ</p>
          <p>または</p>
          <button type="button" @click="openFileDialog">ファイルを選択</button>
        </div>
      </div>

      <input
        @change="handleFiles"
        id="fileInput"
        ref="fileInput"
        type="file"
        accept=".pdf,.xls,.xlsx,.doc,.docx"
        multiple
      />
      <div class="submit">
        <button type="submit">送信する</button>
      </div>
    </div>
    <div class="sending" v-else-if="status === 'sending'">
      <h2>送信中...</h2>
      <div class="loader"></div>
    </div>
    <div class="success" v-else-if="status === 'success'">
      <h2>送信が完了しました。</h2>
    </div>
    <div class="error" v-else-if="status === 'error'">
      <h2>サーバーエラーが発生しました。</h2>
      <p>
        お手数ですが、マイページからのアップロードをお願いいたします。
        自動でログイン画面へ遷移します。
      </p>
    </div>
  </form>
</template>

<style lang="scss" scoped>
h2 {
  font-size: 1.2rem;
  text-align: center;

  @media screen and (min-width: 600px) {
    font-size: 1.6rem;
  }
}

.filename {
  &__ul {
    padding-left: 1rem;
    white-space: nowrap;
    overflow: scroll;
    list-style: none;
  }
  &__li {
    margin: 0.4rem 0;

    button {
      padding: 0.2rem 0.6rem;
      border-radius: 0.125rem;
      color: #fff;
      background-color: #dc3545;
      border: none;
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
  }
}

.dropzone {
  background-color: rgba(28, 39, 51, 0.07);
  padding: 24px;

  &__inner {
    max-width: 600px;
    height: 200px;
    border: 3px dashed gray;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;

    p {
      margin: 0.2rem 0;

      font-size: 0.8rem;

      @media screen and (min-width: 600px) {
        font-size: 1.2rem;
      }
      overflow-wrap: break-word;
    }

    button {
      margin-top: 0.2rem;
      padding: 0.4rem 0.8rem;
      background-color: #fff;
      color: #323232;
      border: 1px solid #dcdcdc;
      font-weight: bold;
      cursor: pointer;
      font-size: 0.8rem;

      @media screen and (min-width: 600px) {
        padding: 0.6rem 1rem;
        font-size: 1rem;
      }
    }

    &.isDraggingOver {
      background-color: lightgray;
    }
  }
}

.sm {
  display: block;

  @media screen and (min-width: 600px) {
    display: none;
  }
}

#fileInput {
  display: none;
}

.submit {
  margin: 2rem 0;
  text-align: center;

  &__disable {
    opacity: 0.5;
  }

  button {
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
}

.loader {
  margin: 100px auto;
  font-size: 25px;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: relative;
  text-indent: -9999em;
  -webkit-animation: load 1.1s infinite ease;
  animation: load 1.1s infinite ease;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
@-webkit-keyframes load {
  0%,
  100% {
    box-shadow:
      0em -2.6em 0em 0em #0e5fb1,
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.5),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.7);
  }
  12.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.7),
      1.8em -1.8em 0 0em #0e5fb1,
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.5);
  }
  25% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.5),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.7),
      2.5em 0em 0 0em #0e5fb1,
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  37.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.5),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.7),
      1.75em 1.75em 0 0em #0e5fb1,
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  50% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.5),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.7),
      0em 2.5em 0 0em #0e5fb1,
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  62.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.5),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.7),
      -1.8em 1.8em 0 0em #0e5fb1,
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  75% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.5),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.7),
      -2.6em 0em 0 0em #0e5fb1,
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  87.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.5),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.7),
      -1.8em -1.8em 0 0em #0e5fb1;
  }
}
@keyframes load {
  0%,
  100% {
    box-shadow:
      0em -2.6em 0em 0em #0e5fb1,
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.5),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.7);
  }
  12.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.7),
      1.8em -1.8em 0 0em #0e5fb1,
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.5);
  }
  25% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.5),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.7),
      2.5em 0em 0 0em #0e5fb1,
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  37.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.5),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.7),
      1.75em 1.75em 0 0em #0e5fb1,
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  50% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.5),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.7),
      0em 2.5em 0 0em #0e5fb1,
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.2),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  62.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.5),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.7),
      -1.8em 1.8em 0 0em #0e5fb1,
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  75% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.5),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.7),
      -2.6em 0em 0 0em #0e5fb1,
      -1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2);
  }
  87.5% {
    box-shadow:
      0em -2.6em 0em 0em rgba(14, 95, 177, 0.2),
      1.8em -1.8em 0 0em rgba(14, 95, 177, 0.2),
      2.5em 0em 0 0em rgba(14, 95, 177, 0.2),
      1.75em 1.75em 0 0em rgba(14, 95, 177, 0.2),
      0em 2.5em 0 0em rgba(14, 95, 177, 0.2),
      -1.8em 1.8em 0 0em rgba(14, 95, 177, 0.5),
      -2.6em 0em 0 0em rgba(14, 95, 177, 0.7),
      -1.8em -1.8em 0 0em #0e5fb1;
  }
}

.sending {
  color: #0e5fb1;
  text-align: center;
}
.success {
  color: #198754;
  text-align: center;
}
.error {
  color: #dc3545;
  text-align: center;
}
</style>
