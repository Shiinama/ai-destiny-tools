import { sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import type { AdapterAccountType } from 'next-auth/adapters'

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image')
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token]
    })
  })
)

export const authenticators = sqliteTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: integer('credentialBackedUp', {
      mode: 'boolean'
    }).notNull(),
    transports: text('transports')
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID]
    })
  })
)

export const posts = sqliteTable('posts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  locale: text('locale').notNull().default('en'),
  coverImageUrl: text('cover_image_url'),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
})

export const divinationCategories = sqliteTable('divination_categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text('key').notNull().unique(), // 用于i18n翻译的键名
  display_order: integer('display_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull()
})

export type ToolStatus = 'pending' | 'approved' | 'rejected'
export type ToolPlatform = 'web' | 'ios' | 'android' | 'windows' | 'macos' | 'linux'

export const divinationTools = sqliteTable('divination_tools', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  contactInfo: text('contact_info'),
  status: text('status').$type<ToolStatus>().default('pending').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  imageUrl: text('image_url'),
  categoryId: text('category_id')
    .notNull()
    .references(() => divinationCategories.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  content: text('content'),
  platform: text('platform'),
  isFree: integer('is_free', { mode: 'boolean' }).default(true),
  price: text('price'),
  logoUrl: text('logo_url'),
  screenshotUrls: text('screenshot_urls'),
  display_order: integer('display_order').default(0),
  locale: text('locale').notNull().default('en')
})
