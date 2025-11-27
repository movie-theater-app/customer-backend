const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

require('dotenv').config()

// Azure DB_*
// Local POSTGRES_* 
const pool = new Pool({
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    host: process.env.DB_HOST || process.env.POSTGRES_HOST,
    database: process.env.DB_NAME || process.env.POSTGRES_DB,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    ssl: process.env.SSL === 'true' ? { rejectUnauthorized: false } : false
})

async function query (text, params = []) {
    try {
        const res = await pool.query(text, params)
        return res
    } catch (err) {
        console.error('Database query error', { text, params, err })
        throw err
    }
}

async function executeSqlFile(filename) {
    try {
        const filePath = path.join(__dirname, filename)
        
        if (!fs.existsSync(filePath)) {
            console.log(`SQL file not found: ${filename}, skipping...`)
            return
        }

        const sql = fs.readFileSync(filePath, 'utf8')
        console.log(`Executing ${filename}...`)
        await pool.query(sql)
        console.log(`Successfully executed ${filename}`)
    } catch (error) {
        console.error(`Error executing ${filename}:`, error.message)
        throw error
    }
}

// Initialize database for Azure deployment
async function initializeDatabase() {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.AZURE_SQL_INIT === 'true'
    
    if (!isProduction) {
        console.log('Skipping database initialization (not in production mode)')
        return
    }

    try {
        console.log('Starting Azure database initialization...')
        
        // Drop and recreate schema if FORCE_DB_RESET is set
        if (process.env.FORCE_DB_RESET === 'true') {
            console.log('FORCE_DB_RESET detected - dropping and recreating schema...')
            await pool.query('DROP SCHEMA IF EXISTS public CASCADE')
            await pool.query('CREATE SCHEMA public')
            console.log('Schema recreated successfully')
        }
        
        await executeSqlFile('init.sql')
        await executeSqlFile('alter.sql')
        
        console.log('Database initialization completed')
    } catch (error) {
        console.error('Database initialization failed:', error)
    }
}

initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err)
})

module.exports = {
    query,
    pool,
    executeSqlFile,
    initializeDatabase
}