const { Pool } = require('pg')

require('dotenv').config()

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
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

module.exports = {
    query,
    pool
}