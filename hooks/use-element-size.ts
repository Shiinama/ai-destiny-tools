import { useEffect, useState, useCallback } from 'react' // 引入 useCallback

const useElementSize = (id: string) => {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  // 使用 useCallback 包裹 handleResize 函数
  // 它的依赖项是 id，因为函数内部用到了 id 来获取元素
  const handleResize = useCallback(() => {
    const element = document.getElementById(id) // 在这里使用 id
    setWidth(element?.offsetWidth || 0)
    setHeight(element?.offsetHeight || 0)
  }, [id]) // 当 id 变化时，handleResize 函数的引用才会变化

  useEffect(() => {
    const element = document.getElementById(id)
    if (!element) {
      console.warn(`Element with ID "${id}" not found. Size tracking disabled.`)
      return // 如果元素不存在，直接返回
    }

    const resizeObserver = new ResizeObserver(() => handleResize())

    resizeObserver.observe(element)

    // 初次观察时立即获取一次尺寸，确保初始状态正确
    handleResize()

    // 清理函数：组件卸载或依赖项变化时移除观察者
    return () => {
      resizeObserver.unobserve(element)
      resizeObserver.disconnect()
    }
  }, [id, handleResize]) // 现在将 handleResize 添加到 useEffect 的依赖项数组中

  return { width, height }
}

export default useElementSize
