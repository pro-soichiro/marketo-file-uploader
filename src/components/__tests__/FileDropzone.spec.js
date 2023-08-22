import { describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import FileDropzone from '../FileDropzone.vue'

describe('FileDropzone', () => {
  it('意図したテキストがレンダリングされること', () => {
    const wrapper = mount(FileDropzone)
    expect(wrapper.text()).toContain('ファイルをここにドラッグ＆ドロップまたはファイルを選択')
  })

  describe('dragEnter', () => {
    it('dragEnterが呼び出されるとisDraggingOverの状態が変わること', async () => {
      const wrapper = mount(FileDropzone)

      await wrapper.vm.dragEnter()
      expect(wrapper.vm.isDraggingOver).toBe(true)
    })
  })

  describe('dragLeave', () => {
    it('dragLeaveが呼び出されるとisDraggingOverの状態が変わること', async () => {
      const wrapper = mount(FileDropzone)

      await wrapper.vm.dragLeave()
      expect(wrapper.vm.isDraggingOver).toBe(false)
    })
  })

  describe('handleFiles', () => {
    it('有効なファイルの場合、dataに保存されること', async () => {
      const wrapper = mount(FileDropzone)

      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [
            new File(['content'], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            new File(['content'], 'sample.pdf', {
              type: 'application/pdf'
            })
          ]
        }
      }

      await wrapper.vm.handleFiles(mockChangeEvent)
      expect(wrapper.vm.data[0].filename).toBe('sample.xlsx')
      expect(wrapper.vm.data[1].filename).toBe('sample.pdf')
      expect(wrapper.text()).toContain('sample.xlsx')
      expect(wrapper.text()).toContain('sample.pdf')
    })

    it('対応していない拡張子の場合、アラートが出ること', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const wrapper = mount(FileDropzone)

      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [new File(['content'], 'sample.invalid', { type: 'invalid/type' })]
        }
      }

      await wrapper.vm.handleFiles(mockChangeEvent)
      expect(alertMock).toHaveBeenCalledWith(
        '許可されていないファイル形式です: invalid \n(許可しているファイル形式: pdf,docs,doc,xlsx,xls)'
      )
      alertMock.mockRestore()
    })

    it('ファイルの添付数が3つ以上の場合、アラートが出ること', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const wrapper = mount(FileDropzone)

      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [
            new File(['content'], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            new File(['content'], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            new File(['content'], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
          ]
        }
      }

      await wrapper.vm.handleFiles(mockChangeEvent)
      expect(alertMock).toHaveBeenCalledWith('最大添付数は2ファイルまでです。')
      alertMock.mockRestore()
    })

    it('ファイルサイズが3MB以下の場合アラートは出ないこと', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const wrapper = mount(FileDropzone)

      // 3145728バイト(3MBのファイル)
      const dataSize = 3 * 1024 * 1024 + 1
      const dummyData = new Array(dataSize).join('a')
      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [
            new File([dummyData], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
          ]
        }
      }

      await wrapper.vm.handleFiles(mockChangeEvent)
      expect(alertMock).not.toHaveBeenCalled()
      alertMock.mockRestore()
    })

    it('ファイルサイズが3MBより大きい場合アラートが出ること', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const wrapper = mount(FileDropzone)

      // 3145729(3MBバイト以上のファイル)
      const dataSize = 3 * 1024 * 1024 + 2
      const dummyData = new Array(dataSize).join('a')
      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [
            new File([dummyData], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
          ]
        }
      }

      await wrapper.vm.handleFiles(mockChangeEvent)
      expect(alertMock).toHaveBeenCalledWith('ファイルサイズの最大値は3MBまでです。')
      alertMock.mockRestore()
    })

    it('ファイル名に使用できない文字が含まれている場合、アラートが出ること', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const wrapper = mount(FileDropzone)

      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [
            new File(['content'], '\\samp<>le.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
          ]
        }
      }

      await wrapper.vm.handleFiles(mockChangeEvent)
      expect(alertMock).toHaveBeenCalledWith('ファイル名に使用できない文字が含まれています。')
      alertMock.mockRestore()
    })
  })

  describe('submitForm', () => {
    it('ファイルがない状態で送信した場合、アラートが出ること', async () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
      const wrapper = mount(FileDropzone)

      await wrapper.vm.submitForm()
      expect(alertMock).toHaveBeenCalledWith('ファイルを選択してください。')
      alertMock.mockRestore()
    })
  })

  describe('removeFile', () => {
    it('ファイルが削除されること', async () => {
      const wrapper = mount(FileDropzone)
      const mockChangeEvent = {
        type: 'change',
        target: {
          files: [
            new File(['content'], 'sample.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            new File(['content'], 'sample.pdf', {
              type: 'application/pdf'
            })
          ]
        }
      }
      await wrapper.vm.handleFiles(mockChangeEvent)

      await wrapper.vm.removeFile(1)

      expect(wrapper.text()).toContain('sample.xlsx')
      expect(wrapper.text()).not.toContain('sample.pdf')
    })
  })
})
