import { exec } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

interface D1Database {
  binding: string
  database_name: string
  database_id: string
}

interface WranglerConfig {
  d1_databases: D1Database[]
}

const execAsync = promisify(exec)

async function migrate() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2)
    const mode = args[0]

    if (!mode || !['local', 'remote'].includes(mode)) {
      console.error('Error: Please specify mode (local or remote)')
      process.exit(1)
    }

    // Read wrangler.json
    const wranglerPath = join(process.cwd(), 'wrangler.jsonc')
    let wranglerContent: string

    try {
      wranglerContent = readFileSync(wranglerPath, 'utf-8')
    } catch {
      console.error('Error: wrangler.jsonc not found')
      process.exit(1)
    }

    // Parse wrangler.json
    const config = JSON.parse(wranglerContent) as WranglerConfig

    if (!config.d1_databases?.[0]?.database_name) {
      console.error('Error: Database name not found in wrangler.json')
      process.exit(1)
    }

    const dbName = config.d1_databases[0].database_name

    // Generate migrations
    console.log('Generating migrations...')
    await execAsync('drizzle-kit generate')

    // Applying migrations
    console.log(`Applying migrations to ${mode} database: ${dbName}`)
    await execAsync(`wrangler d1 migrations apply ${dbName} --${mode}`)

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Error: Failed to migrate', error)
    process.exit(1)
  }
}

migrate()
