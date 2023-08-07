import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import FileDropzone from '../FileDropzone.vue'

describe('FileDropzone', () => {
  it('renders properly', () => {
    const wrapper = mount(FileDropzone)
    expect(wrapper.text()).toContain('ここにファイルをドラッグ&ドロップして下さい')
  })
})
