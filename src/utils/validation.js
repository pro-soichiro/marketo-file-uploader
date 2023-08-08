const MAX_FILE_COUNT = 3 // 最大添付ファイル数
const MAX_FILE_SIZE_MB = 3 // ファイルサイズの最大値 (MB)
const ALLOWED_EXTENSIONS = ['pdf', 'docs', 'doc', 'xlsx', 'xls']

// ファイル数のチェック
export function isValidFileCount(curCount, prevCount) {
  return curCount + prevCount > MAX_FILE_COUNT
}

// ファイルの拡張子
export function isValidExtension(filename) {
  const extension = filename.split('.').pop().toLowerCase()
  return ALLOWED_EXTENSIONS.includes(extension)
}

// ファイルのサイズ
export function isValidSize(fileSize) {
  return fileSize <= MAX_FILE_SIZE_MB * 1024 * 1024
}

// ファイル名
export function isValidFileName(filename) {
  const invalidChars = /[<>:"/\\|?*]/
  return !invalidChars.test(filename)
}
