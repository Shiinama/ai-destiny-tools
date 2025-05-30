/**
 * 从对象中提取指定的键
 * @param source 源对象
 * @param keys 要提取的键数组（支持点表示法）
 * @returns 提取后的对象
 */
export function extractKeys(source: Record<string, any>, keys: string[]): Record<string, any> {
  const result: Record<string, any> = {}

  for (const key of keys) {
    const parts = key.split('.')
    let current = source
    let currentResult = result

    // 遍历路径
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      if (i === parts.length - 1) {
        // 最后一部分，设置值
        if (current && typeof current === 'object' && part in current) {
          currentResult[part] = current[part]
        }
      } else {
        // 中间路径，确保对象存在
        if (!(part in currentResult)) {
          currentResult[part] = {}
        }
        if (current && typeof current === 'object' && part in current) {
          current = current[part]
          currentResult = currentResult[part]
        } else {
          break
        }
      }
    }
  }

  return result
}

/**
 * 查找缺失的键
 * @param source 源对象（通常是英文消息）
 * @param target 目标对象（通常是其他语言消息）
 * @returns 缺失键的数组（点表示法）
 */
export function findMissingKeys(source: Record<string, any>, target: Record<string, any>, prefix = ''): string[] {
  const missingKeys: string[] = []

  for (const key in source) {
    const currentPath = prefix ? `${prefix}.${key}` : key

    if (!(key in target)) {
      // 键完全缺失
      missingKeys.push(currentPath)
    } else if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      // 递归检查嵌套对象
      const nestedMissing = findMissingKeys(source[key], target[key], currentPath)
      missingKeys.push(...nestedMissing)
    }
  }

  return missingKeys
}

/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const output = { ...target }

  for (const key in source) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      key in output &&
      typeof output[key] === 'object' &&
      output[key] !== null
    ) {
      // 递归合并嵌套对象
      output[key] = deepMerge(output[key], source[key])
    } else {
      // 简单赋值
      output[key] = source[key]
    }
  }

  return output
}

/**
 * 从对象中删除指定的键（支持点表示法）
 * @param obj 要修改的对象
 * @param key 要删除的键（使用点表示法表示嵌套键）
 * @returns 是否成功删除键
 */
export function removeKey(obj: Record<string, any>, key: string): boolean {
  const parts = key.split('.')

  // 如果是顶层键
  if (parts.length === 1) {
    if (obj.hasOwnProperty(parts[0])) {
      delete obj[parts[0]]
      return true
    }
    return false
  }

  // 处理嵌套键
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current[part] === undefined || typeof current[part] !== 'object') {
      return false
    }
    current = current[part]
  }

  const lastPart = parts[parts.length - 1]
  if (current.hasOwnProperty(lastPart)) {
    delete current[lastPart]
    return true
  }

  return false
}
