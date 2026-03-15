// src/components/RichEditorComponents/CustomTextStyle.jsx
import { Mark } from '@tiptap/core'

export const CustomTextStyle = Mark.create({
  name: 'textStyle',

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.color || null,
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return { style: `color: ${attributes.color}` }
        },
      },
      fontFamily: {
        default: null,
        parseHTML: element => element.style.fontFamily || null,
        renderHTML: attributes => {
          if (!attributes.fontFamily) return {}
          return { style: `font-family: ${attributes.fontFamily}` }
        },
      },
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          const hasStyles = element.hasAttribute('style')
          if (!hasStyles) return false
          
          const style = element.getAttribute('style')
          const colorMatch = style.match(/color:\s*([^;]+)/)
          const fontFamilyMatch = style.match(/font-family:\s*([^;]+)/)
          const fontSizeMatch = style.match(/font-size:\s*([^;]+)/)
          
          if (colorMatch || fontFamilyMatch || fontSizeMatch) {
            return {}
          }
          
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes = {} }) {
    const styleList = []
  
    if (HTMLAttributes.color) {
      styleList.push(`color: ${HTMLAttributes.color}`)
    }
  
    if (HTMLAttributes.fontFamily) {
      styleList.push(`font-family: ${HTMLAttributes.fontFamily}`)
    }
  
    if (HTMLAttributes.fontSize) {
      styleList.push(`font-size: ${HTMLAttributes.fontSize}`)
    }
  
    // 拷贝 HTMLAttributes，避免污染原对象
    const attrs = { ...HTMLAttributes }
  
    // 设置最终合并后的 style 字符串
    if (styleList.length > 0) {
      attrs.style = styleList.join('; ')
    }
  
    return ['span', attrs, 0]
  }
})
