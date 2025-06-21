export const checkUserIsAdmin = (id?: string) => {
  if (!id) {
    return false
  }
  const adminIds = process.env.NEXT_PUBLIC_ADMIN_ID?.split(',') ?? []
  return adminIds.includes(id)
}
