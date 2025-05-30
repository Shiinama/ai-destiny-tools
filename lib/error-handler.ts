type ErrorResponse = {
  error: string
  status: 400 | 404 | 409 | 500
}

type ErrorMessages = {
  uniqueConstraint: (field?: string) => string
  foreignKeyConstraint: string
  checkConstraint: string
  notFound: string
  unexpected: string
}

const defaultErrorMessages: ErrorMessages = {
  uniqueConstraint: (field?: string) =>
    field
      ? `This ${field} is already in use. Please choose a different one.`
      : 'This value already exists. Please try a different one.',
  foreignKeyConstraint: 'The referenced data does not exist. Please check your input.',
  checkConstraint: 'Invalid input data. Please check and try again.',
  notFound: 'The requested resource was not found.',
  unexpected: 'An unexpected error occurred. Please try again later.'
}

export const createErrorHandler = (customMessages?: Partial<ErrorMessages>) => {
  const messages = { ...defaultErrorMessages, ...customMessages }

  const handleDatabaseError = (error: unknown): ErrorResponse => {
    if (error && typeof error === 'object' && 'message' in error) {
      const err = error as { message: string }

      if (err.message.includes('UNIQUE constraint failed')) {
        // 匹配 SQLite 错误消息格式
        const fieldMatch = err.message.match(/UNIQUE constraint failed: (.+?)\.(.+?):/)
        const field = fieldMatch?.[2]
        return { error: messages.uniqueConstraint(field), status: 409 }
      }
      if (err.message.includes('FOREIGN KEY constraint failed')) {
        return { error: messages.foreignKeyConstraint, status: 404 }
      }
      if (err.message.includes('CHECK constraint failed')) {
        return { error: messages.checkConstraint, status: 400 }
      }
    }
    return { error: messages.unexpected, status: 500 }
  }

  return {
    handleDatabaseError,
    messages
  }
}
