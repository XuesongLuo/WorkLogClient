import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import { findParentNodeClosestToPos } from 'prosemirror-utils'
import { DOMSerializer } from 'prosemirror-model'
import { CustomTextStyle } from './RichEditorComponents/CustomTextStyle'
import './editor.css'

// 表格选择器最大尺寸
const MAX_ROWS = 8
const MAX_COLS = 8

const colors = [
    '#000000', '#262626', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9', '#f0f0f0', '#ffffff',
    '#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#ffec3d', '#bae637', '#73d13d', '#36cfc9',
    '#40a9ff', '#597ef7', '#9254de', '#f759ab',
]

const fontFamilies = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: '微软雅黑', value: 'Microsoft YaHei' },
    { label: '宋体', value: 'SimSun' },
    { label: '黑体', value: 'SimHei' },
]

const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

function generateClipboardHTML(container) {
    // 统一给所有表格和单元格添加行内style（Word只认行内）
    container.querySelectorAll('table').forEach(table => {
        table.classList.add('MsoTableGrid')
        table.setAttribute('border', '1')
        table.setAttribute('cellspacing', '0')
        table.setAttribute('cellpadding', '0')
        table.style.borderCollapse = 'collapse'
        table.style.border = '1px solid #000'
        table.style.width = '100%'
    })

    container.querySelectorAll('td, th').forEach(cell => {
        cell.style.border = '1px solid #000'
        cell.style.padding = '4px'
        cell.style.verticalAlign = 'middle'
    })
    return `
            <!DOCTYPE html>
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:w="urn:schemas-microsoft-com:office:word"
                    xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                <meta charset="UTF-8">
                <style>
                    table.MsoTableGrid {
                    border-collapse: collapse;
                    border-spacing: 0;
                    border: 1px solid #000;
                    width: 100%;
                    }
                    td, th {
                    border: 1px solid #000;
                    padding: 4px;
                    vertical-align: middle;
                    }
                </style>
                </head>
                <body>
                    ${container.innerHTML}
                </body>
            </html>`
}

const CustomBulletList = BulletList.extend({
    addAttributes() {
        return {
            listStyleType: {
                default: 'disc',
                parseHTML: el => el.style.listStyleType || 'disc',
                renderHTML: attrs => {
                    return { style: `list-style-type: ${attrs.listStyleType}` };
                },
            },
        };
    },
});
  
const CustomOrderedList = OrderedList.extend({
    addAttributes() {
        return {
            listStyleType: {
                default: 'decimal',
                parseHTML: el => el.style.listStyleType || 'decimal',
                renderHTML: attrs => {
                return { style: `list-style-type: ${attrs.listStyleType}` };
                },
            },
        };
    },
});

const Editor = forwardRef(({ value = '', readOnly = false, hideToolbar = false, maxHeightOffset = 120 }, ref) => {
    const [currentFontFamily, setCurrentFontFamily] = useState('Arial')        // 添加字体状态
    const [showTextColor, setShowTextColor] = useState(false)
    const [showBgColor, setShowBgColor] = useState(false)
    const [currentTextColor, setCurrentTextColor] = useState('')
    const [currentBgColor, setCurrentBgColor] = useState('')
    const [currentFontSize, setCurrentFontSize] = useState('16px')
    const [currentBulletStyle, setCurrentBulletStyle] = useState('disc')       // 无序列表默认值
    const [currentOrderedStyle, setCurrentOrderedStyle] = useState('decimal')  // 有序列表默认值
    const [showBulletListStyles, setShowBulletListStyles] = useState(false);
    const [showOrderedListStyles, setShowOrderedListStyles] = useState(false);
    const [showTableSelector, setShowTableSelector] = useState(false)
    const [hoverRow, setHoverRow] = useState(0)
    const [hoverCol, setHoverCol] = useState(0)
    const [showContextMenu, setShowContextMenu] = useState(false)
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
    const [canMergeCells, setCanMergeCells] = useState(false)        //  标记单元格是否可以合并
    const [canSplitCell, setCanSplitCell] = useState(false)          //  标记单元格是否可以拆分
    const [floatingPosition, setFloatingPosition] = useState({ top: 0, left: 0 });

    const resizableRef = useRef();
    const toolbarRef = useRef(null)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false,
                orderedList: false,
                table: false,
                highlight: false,  
            }),
            Color.configure({ types: ['textStyle'] }), // 让 Color 只作用于 textStyle
            Highlight.configure({ multicolor: true }), // 支持多种背景色
            Underline,
            CustomTextStyle,
            CustomBulletList,
            CustomOrderedList,
            TaskList.configure({ nested: true }),
            TaskItem.configure({ nested: true }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content: value || '',
        editorProps: {
            attributes: {
              class: 'custom-editor',
            },
            editable: () => !readOnly, // 只读模式判断
        },
    })

    // 让父组件可以通过 ref 调用 editor 的方法
    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML?.(),
        getJSON: () => editor?.getJSON?.(),
        setContent: (val) => editor?.commands.setContent(val || ''),
        // 还可以暴露更多方法
    }), [editor]);

    const handleBulletListStyle = (style) => {
        const chain = editor.chain().focus();
        if (!editor.isActive('bulletList')) {
            chain.toggleBulletList();
        }
        // 无论在哪一级，只改当前所在的 <ul> 的样式
        chain.updateAttributes('bulletList', { listStyleType: style }).run();

        setCurrentBulletStyle(style);
        setShowBulletListStyles(false);
    };
      
    const handleOrderedListStyle = (style) => {
        const chain = editor.chain().focus();
        if (!editor.isActive('orderedList')) {
            chain.toggleOrderedList();
        }
        chain.updateAttributes('orderedList', { listStyleType: style }).run();

        setCurrentOrderedStyle(style);
        setShowOrderedListStyles(false);
    };

    const handleInsertTable = () => {
        if (hoverRow > 0 && hoverCol > 0) {
        editor.chain().focus().insertTable({ rows: hoverRow + 1, cols: hoverCol + 1, withHeaderRow: true }).run()
        setShowTableSelector(false)
        setHoverRow(0)
        setHoverCol(0)
        }
    }

    const handleContextMenu = (e) => {
        e.preventDefault()   // 阻止浏览器默认清空选区！
        const cell = e.target.closest('td, th') // 只在表格单元格上触发右键菜单
        if (!cell) {
          setShowContextMenu(false)
          return
        }
        setContextMenuPos({ x: e.clientX, y: e.clientY })
        setShowContextMenu(true)
    }
      
    const insertRowAbove = () => {
        editor.chain().focus().addRowBefore().run()
        setShowContextMenu(false)
    }
    const insertRowBelow = () => {
        editor.chain().focus().addRowAfter().run()
        setShowContextMenu(false)
    }
    const deleteRow = () => {
        editor.chain().focus().deleteRow().run()
        setShowContextMenu(false)
    }
    const insertColumnBefore = () => {
        editor.chain().focus().addColumnBefore().run()
        setShowContextMenu(false)
    }
    const insertColumnAfter = () => {
        editor.chain().focus().addColumnAfter().run()
        setShowContextMenu(false)
    }
    const deleteColumn = () => {
        editor.chain().focus().deleteColumn().run()
        setShowContextMenu(false)
    }
    const mergeCells = () => {
        editor.chain().focus().mergeCells().run()
        setShowContextMenu(false)
    }
      
    const splitCell = () => {
        editor.chain().focus().splitCell().run()
        setShowContextMenu(false)
    }

    // 控制初次最大高度不超出屏幕（并且resize后保持合理上限，但不限制用户拖大）
    useEffect(() => {
        function adjustInitialHeight() {
          const node = resizableRef.current;
          if (!node) return;
          const maxInit = Math.max(window.innerHeight - node.getBoundingClientRect().top - maxHeightOffset, 180);
          if (!node.dataset.userResized) {
                node.style.height = Math.min(maxInit, 400) + 'px';
          }
          node.style.maxHeight = maxInit + 'px';
          if (node.offsetHeight > maxInit) node.style.height = maxInit + 'px';
        }
        //adjustInitialHeight();
        const timer = setTimeout(adjustInitialHeight, 50);
        window.addEventListener('resize', adjustInitialHeight);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', adjustInitialHeight);
        };
      }, [maxHeightOffset]);

    // 监听手动拖拽，标记用户已调整过高度，不再自动覆盖
    useEffect(() => {
        const node = resizableRef.current;
        if (!node) return;
        let oldHeight = node.offsetHeight;
        const interval = setInterval(() => {
        if (Math.abs(node.offsetHeight - oldHeight) > 5) {
            node.dataset.userResized = '1';
            oldHeight = node.offsetHeight;
        }
        }, 300);
        return () => clearInterval(interval);
    }, []);

    // 点击页面空白区域自动收起色板或表格选择器，或者关闭右键菜单
    useEffect(() => {
        const handleClickOutside = (event) => { 
            if (event.button === 0) {
                if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
                    setShowTextColor(false)
                    setShowBgColor(false)
                    setShowBulletListStyles(false)
                    setShowOrderedListStyles(false)
                    setShowTableSelector(false)
                }
                const contextMenu = document.querySelector('.context-menu')
                if (contextMenu && !contextMenu.contains(event.target)) {
                    setShowContextMenu(false)
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // 在 useEffect 中添加颜色状态监听
    useEffect(() => {
        if (!editor) return
        
        const updateColorStates = () => {
            // 更新文字颜色状态
            const textColor = editor.getAttributes('textStyle').color
            if (textColor) {
                setCurrentTextColor(textColor)
            }
            // 更新背景色状态
            const highlight = editor.getAttributes('highlight')
            if (highlight.color) {
                setCurrentBgColor(highlight.color)
            }
            // 更新字体大小状态
            const fontSize = editor.getAttributes('textStyle').fontSize
            if (fontSize) {
                setCurrentFontSize(fontSize)
            }
            // 更新字体状态
            const fontFamily = editor.getAttributes('textStyle').fontFamily
            if (fontFamily) {
                setCurrentFontFamily(fontFamily)
            }
        }
        editor.on('selectionUpdate', updateColorStates)
        editor.on('transaction', updateColorStates)
        return () => {
            editor.off('selectionUpdate', updateColorStates)
            editor.off('transaction', updateColorStates)
        }
    }, [editor])

    // 单元格是否可以合并和拆分监听
    useEffect(() => {
        if (!editor) return
        const updateCanMerge = () => {
            const selection = editor.state.selection
            const { from, to } = selection
            const { doc } = editor.state
      
            // 判断能否合并
            setCanMergeCells(from !== to)
            // 判断能否拆分
            const $from = doc.resolve(from)
            // 找到最近的 tableCell 或 tableHeader
            const cellNode = findParentNodeClosestToPos($from, node => node.type.name === 'tableCell' || node.type.name === 'tableHeader')

            if (cellNode && (cellNode.node.attrs.colspan > 1 || cellNode.node.attrs.rowspan > 1)) {
            setCanSplitCell(true)
            } else {
            setCanSplitCell(false)
            }
        }
        editor.on('selectionUpdate', updateCanMerge)
        return () => {
            editor.off('selectionUpdate', updateCanMerge)
        }
    }, [editor])

    // 监听selectionUpdate事件
    useEffect(() => {
        if (!editor) return
        const updateListStyles = () => {
            const { state } = editor
            const { from } = state.selection
            const $from = state.doc.resolve(from)
            const nodeTypes = $from.path.map(p => p?.type?.name).filter(Boolean)
    
            if (nodeTypes.includes('bulletList')) {
                const bulletAttrs = editor.getAttributes('bulletList')
                setCurrentBulletStyle(bulletAttrs.listStyleType || 'disc')
            } else if (nodeTypes.includes('orderedList')) {
                const orderedAttrs = editor.getAttributes('orderedList')
                setCurrentOrderedStyle(orderedAttrs.listStyleType || 'decimal')
            }
        }
        editor.on('selectionUpdate', updateListStyles)
        return () => {
            editor.off('selectionUpdate', updateListStyles)
        }
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className="editor-container">
            {!hideToolbar && (
                <div className="toolbar" ref={toolbarRef}>
                    {/* 块类型选择 */}
                    <select
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'paragraph') {
                        editor.chain().focus().setParagraph().run();
                        } else if (value === 'blockquote') {
                        editor.chain().focus().toggleBlockquote().run();
                        } else if (value === 'codeBlock') {
                        editor.chain().focus().toggleCodeBlock().run();
                        } else {
                        editor.chain().focus().toggleHeading({ level: Number(value) }).run();
                        }
                    }}
                    value={
                        editor.isActive('heading', { level: 1 }) ? '1'
                        : editor.isActive('heading', { level: 2 }) ? '2'
                        : editor.isActive('heading', { level: 3 }) ? '3'
                        : editor.isActive('blockquote') ? 'blockquote'
                        : editor.isActive('codeBlock') ? 'codeBlock'
                        : 'paragraph'
                    }
                    >
                    <option value="paragraph">正文</option>
                    <option value="1">标题1</option>
                    <option value="2">标题2</option>
                    <option value="3">标题3</option>
                    <option value="blockquote">引用块</option>
                    <option value="codeBlock">代码块</option>
                    </select>
                    {/* 字体类型选择 */}
                    <select
                    onChange={(e) => {
                        const font = e.target.value
                        const { state, view } = editor
                        const { from, to, empty } = state.selection
                        if (empty) {
                            // 没有选中文字，只是光标停着
                            editor.chain().focus().setMark('textStyle', { fontFamily: font }).run()
                        } else {
                            // 有选中文字，给选区设置textStyle
                            editor.chain().focus().setMark('textStyle', { fontFamily: font }).run()
                        }
                    }}
                    >
                    {fontFamilies.map(item => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                    </select>
                    {/* 字体大小选择 */}
                    <select
                    onChange={(e) => {
                        const size = e.target.value;
                        editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
                        setCurrentFontSize(size)
                    }}
                    value={currentFontSize}
                    >
                    {fontSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                    </select>
                    {/* 基本格式 */}
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>B</button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}><i>I</i></button>
                    <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'is-active' : ''}><u>U</u></button>
                    <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}><s>S</s></button>
                    {/* 文字颜色选择 */}
                    <div className="dropdown">
                        <div className="split-button">
                            <button
                            onClick={() => {
                                editor.chain().focus().setColor(currentTextColor || '#000').run();
                            }}
                            >
                            <span className="color-preview" style={{ backgroundColor: currentTextColor || '#000' }}></span>
                            </button>
                            <button
                                className="split-toggle"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setFloatingPosition({
                                        top: rect.bottom + 4, // 稍微下移一点
                                        left: rect.left,
                                    });
                                    setShowTextColor(!showTextColor);
                                    setShowBgColor(false);
                                    setShowBulletListStyles(false);
                                    setShowOrderedListStyles(false);
                                    setShowTableSelector(false);
                                }}
                            >
                            ▼
                            </button>
                        </div>
                        {showTextColor && (
                            <div className="color-palette floating" style={{ top: floatingPosition.top, left: floatingPosition.left }}>
                            {colors.map((color) => (
                                <button
                                key={color}
                                style={{ backgroundColor: color }}
                                className={`color-button ${editor.getAttributes('textStyle').color === color ? 'is-active' : ''}`}
                                onClick={() => {
                                    editor.chain().focus().setColor(color).run();
                                    setCurrentTextColor(color);
                                    setShowTextColor(false);
                                }}
                                />
                            ))}
                            </div>
                        )}
                    </div>
                    {/* 背景颜色选择 */}
                    <div className="dropdown">
                        <div className="split-button">
                            <button
                            onClick={() => {
                                editor.chain().focus().setHighlight({ color: currentBgColor || '#fff' }).run();
                            }}
                            >
                            <span className="color-preview" style={{ backgroundColor: currentBgColor || '#fff' }}></span>
                            </button>
                            <button
                            className="split-toggle"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setFloatingPosition({
                                    top: rect.bottom + 4,
                                    left: rect.left,
                                });
                                setShowBgColor(!showBgColor);
                                setShowTextColor(false);
                                setShowBulletListStyles(false);
                                setShowOrderedListStyles(false);
                                setShowTableSelector(false);
                            }}
                            >
                            ▼
                            </button>
                        </div>
                        {showBgColor && (
                            <div className="color-palette floating" style={{ top: floatingPosition.top, left: floatingPosition.left }}>
                            {colors.map((color) => (
                                <button
                                key={color}
                                style={{ backgroundColor: color }}
                                className={`color-button ${editor.isActive('highlight', { color }) ? 'is-active' : ''}`}
                                onClick={() => {
                                    editor.chain().focus().setHighlight({ color }).run();
                                    setCurrentBgColor(color);
                                    setShowBgColor(false);
                                }}
                                />
                            ))}
                            </div>
                        )}
                    </div>
                    {/* 无序列表按钮 */}
                    <div className="dropdown">
                        <div className="split-button">
                            <button onClick={() => {
                                if (editor.isActive('bulletList')) {
                                    // 处于无序列表：彻底清理掉 ul 和它的属性
                                    editor.chain().focus()
                                        .clearNodes({ types: ['bulletList'] })
                                        .run()
                                } else {
                                    // 不在列表：开一个新的 ul 并加上样式
                                    editor.chain().focus()
                                        .toggleBulletList()
                                        .updateAttributes('bulletList', { listStyleType: currentBulletStyle })
                                        .run()
                                }
                            }}>
                                {currentBulletStyle === 'disc' ? '•' : currentBulletStyle === 'circle' ? '○' : '▪'}
                            </button>
                            <button className="split-toggle" 
                                onClick={() => {
                                    setShowBulletListStyles(!showBulletListStyles)
                                    setShowOrderedListStyles(false)
                                }}
                            >
                            ▼
                            </button>
                        </div>
                        {showBulletListStyles && (
                            <div className="list-style-palette floating">
                            <button onClick={() => handleBulletListStyle('disc')}>•</button>
                            <button onClick={() => handleBulletListStyle('circle')}>○</button>
                            <button onClick={() => handleBulletListStyle('square')}>▪</button>
                            </div>
                        )}
                    </div>
                    {/* 有序列表按钮 */}
                    <div className="dropdown">
                        <div className="split-button">
                            {/* 主按钮 - 点击直接应用默认有序列表 */}
                            <button onClick={() => {
                            if (editor.isActive('orderedList')) {
                                editor.chain().focus()
                                    .clearNodes({ types: ['orderedList'] })
                                    .run()
                                } else {
                                editor.chain().focus()
                                    .toggleOrderedList()
                                    .updateAttributes('orderedList', { listStyleType: currentOrderedStyle })
                                    .run()
                                }
                            }}>
                                {
                                    currentOrderedStyle === 'decimal' ? '1. ' :
                                    currentOrderedStyle === 'lower-alpha' ? 'a.' :
                                    currentOrderedStyle === 'upper-alpha' ? 'A.' :
                                    currentOrderedStyle === 'lower-roman' ? 'i. ' :
                                    currentOrderedStyle === 'upper-roman' ? 'I. ' : '1. '
                                }
                            </button>

                            {/* 小三角按钮 - 点击展开样式选择 */}
                            <button
                            className="split-toggle"
                            onClick={() => {
                                setShowOrderedListStyles(!showOrderedListStyles);
                                setShowBulletListStyles(false);
                            }}
                            >
                            ▼
                            </button>
                        </div>

                        {/* 浮动下拉列表 */}
                        {showOrderedListStyles && (
                            <div className="list-style-palette floating">
                            <button onClick={() => handleOrderedListStyle('decimal')}>1.2.3</button>
                            <button onClick={() => handleOrderedListStyle('lower-alpha')}>a.b.c</button>
                            <button onClick={() => handleOrderedListStyle('upper-alpha')}>A.B.C</button>
                            <button onClick={() => handleOrderedListStyle('lower-roman')}>i.ii.iii</button>
                            <button onClick={() => handleOrderedListStyle('upper-roman')}>I.II.III</button>
                            </div>
                        )}
                    </div>

                    <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'is-active' : ''}>☑️</button>
                    {/* ✅  ☑️ */}

                    <button
                        onClick={() => {
                            if (editor.isActive('taskList')) {
                                editor.chain().focus().sinkListItem('taskItem').run()
                            } else {
                                editor.chain().focus().sinkListItem('listItem').run()
                            }
                        }}
                        title="Increase indent"
                        >
                        →
                        </button>
                        {/* 取消缩进 */}
                        <button
                        onClick={() => {
                            if (editor.isActive('taskList')) {
                                editor.chain().focus().liftListItem('taskItem').run()
                            } else {
                                editor.chain().focus().liftListItem('listItem').run()
                            }
                        }}
                        title="Decrease indent"
                        >
                        ←
                    </button>

                    {/* 插入表格按钮 */}
                    <div className="dropdown">
                    <button onClick={() => setShowTableSelector(!showTableSelector)}>📋</button>
                    {showTableSelector && (
                        <div className="table-selector">
                        {[...Array(MAX_ROWS)].map((_, row) => (
                            <div className="table-selector-row" key={row}>
                            {[...Array(MAX_COLS)].map((_, col) => (
                                <div
                                key={col}
                                className={`table-selector-cell ${(row <= hoverRow && col <= hoverCol) ? 'selected' : ''}`}
                                onMouseEnter={() => {
                                    setHoverRow(row)
                                    setHoverCol(col)
                                }}
                                onClick={handleInsertTable}
                                />
                            ))}
                            </div>
                        ))}
                        {hoverRow >= 0 && hoverCol >= 0 && (
                            <div className="table-size-info">{hoverRow + 1} × {hoverCol + 1}</div>
                        )}
                        </div>
                    )}
                    </div>

                    <button onClick={() => editor.chain().focus().undo().run()}>↺</button>
                    <button onClick={() => editor.chain().focus().redo().run()}>↻</button>
                </div>
            )}
            <div className="editor-resizable" ref={resizableRef}>
                <EditorContent 
                    editor={editor} 
                    onContextMenu={handleContextMenu} 
                    onCopy={(e) => {
                        if (!editor) return;
                
                        const { state } = editor;
                        const { selection } = state;
                        const { from } = selection;
                
                        // 查找最近的表格节点
                        const $from = state.doc.resolve(from);
                        const tableNode = findParentNodeClosestToPos($from, (node) => node.type.name === 'table');
                
                        if (tableNode) {
                            e.preventDefault();
                
                            // 创建容器用于处理表格 HTML
                            const processedContainer = document.createElement('div');
                            const serializer = editor.options.editorProps.clipboardSerializer || DOMSerializer.fromSchema(state.schema);
                            const domFragment = serializer.serializeNode(tableNode.node);
                
                            // 将序列化的表格添加到容器
                            processedContainer.appendChild(domFragment);
                
                            // 应用表格样式
                            processedContainer.querySelectorAll('table').forEach((table) => {
                                table.classList.add('MsoTableGrid');
                                table.setAttribute('border', '1');
                                table.setAttribute('cellspacing', '0');
                                table.setAttribute('cellpadding', '0');
                                table.style.borderCollapse = 'collapse';
                                table.style.border = '1px solid #000';
                                table.style.width = '100%';
                                table.removeAttribute('data-pm-slice');
                            });
                
                            // 应用单元格样式
                            processedContainer.querySelectorAll('td, th').forEach((cell) => {
                                cell.style.border = '1px solid #000';
                                cell.style.padding = '4px';
                                cell.style.verticalAlign = 'middle';
                            });
                
                            // 调试输出
                            console.log('处理后的表格内容:', {
                                tables: processedContainer.querySelectorAll('table').length,
                                cells: processedContainer.querySelectorAll('td, th').length,
                                html: processedContainer.innerHTML,
                            });
                
                            // 生成剪贴板 HTML
                            const html = generateClipboardHTML(processedContainer);
                            const text = processedContainer.innerText;
                
                            // 设置剪贴板数据
                            e.clipboardData.setData('text/html', html);
                            e.clipboardData.setData('text/plain', text);
                        } else {
                            // 非表格选择的回退逻辑
                            const selection = window.getSelection();
                            if (!selection || selection.rangeCount === 0) return;
                
                            const range = selection.getRangeAt(0);
                            const container = document.createElement('div');
                            container.appendChild(range.cloneContents());
                
                            // 调试输出
                            console.log('回退选择内容:', {
                                tables: container.querySelectorAll('table').length,
                                cells: container.querySelectorAll('td, th').length,
                                html: container.innerHTML,
                            });
                
                            // 如果没有表格或单元格，允许默认复制行为
                            if (container.querySelectorAll('table, td, th').length === 0) return;
                
                            e.preventDefault();
                
                            // 应用表格和单元格样式
                            container.querySelectorAll('table').forEach((table) => {
                                table.classList.add('MsoTableGrid');
                                table.setAttribute('border', '1');
                                table.setAttribute('cellspacing', '0');
                                table.setAttribute('cellpadding', '0');
                                table.style.borderCollapse = 'collapse';
                                table.style.border = '1px solid #000';
                                table.style.width = '100%';
                                table.removeAttribute('data-pm-slice');
                            });
                
                            container.querySelectorAll('td, th').forEach((cell) => {
                                cell.style.border = '1px solid #000';
                                cell.style.padding = '4px';
                                cell.style.verticalAlign = 'middle';
                            });
                
                            const html = generateClipboardHTML(container);
                            const text = container.innerText;
                
                            e.clipboardData.setData('text/html', html);
                            e.clipboardData.setData('text/plain', text);
                        }
                    }}
                />
            </div>
            {showContextMenu && (
                <div
                    className="context-menu"
                    style={{
                        top: contextMenuPos.y,
                        left: contextMenuPos.x,
                        position: 'absolute',
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 999,
                    }}
                >
                    <button onClick={insertRowAbove}>上方插入行</button>
                    <button onClick={insertRowBelow}>下方插入行</button>
                    <button onClick={deleteRow}>删除行</button>
                    <hr />
                    <button onClick={insertColumnBefore}>左方插入列</button>
                    <button onClick={insertColumnAfter}>右方插入列</button>
                    <button onClick={deleteColumn}>删除列</button>
                    <hr />
                    <button onClick={mergeCells} disabled={!canMergeCells}>合并单元格</button>
                    <button onClick={splitCell} disabled={!canSplitCell}>拆分单元格</button>
                </div>
            )}
        </div>
    )
});

export default Editor;