const db = require('../db/db');

const getAllTheaters = async () => {
  const result = await db.query('SELECT * FROM theaters ORDER BY id');
  return result.rows;
};

const getTheaterById = async (id) => {
  const result = await db.query('SELECT * FROM theaters WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = {
  getAllTheaters,
  getTheaterById,
};
