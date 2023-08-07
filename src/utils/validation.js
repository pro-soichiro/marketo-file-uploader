const MAX_FILE_SIZE_MB = 3 // ファイルサイズの最大値 (MB)
const MAX_FILE_COUNT = 3 // 最大添付ファイル数

// ファイル数のチェック
function checkFileCount(files, maxCount) {
  if (files.length > maxCount) {
    return false
  }
  return true
}

// 1ファイルのサイズのチェック
function validFileSize(file, maxSizeMB) {
  return file.size <= maxSizeMB * 1024 * 1024
}

// 各ファイルのサイズのチェック
function checkFileSize(files, maxSizeMB) {
  for (const file of files) {
    if (!validFileSize(file, maxSizeMB)) {
      return false
    }
  }
  return true
}

// ファイルのバリデーション
export function isValidFiles(files) {
  if (!checkFileCount(files, MAX_FILE_COUNT)) {
    return false
  }

  if (!checkFileSize(files, MAX_FILE_SIZE_MB)) {
    return false
  }

  return true
}
