const db = require('../db/db');

const getAllAuditoriums = async () => {
  const result = await db.query('SELECT * FROM auditoriums ORDER BY id');
  return result.rows;
};

const getAuditoriumsByTheater = async (theaterId) => {
  const result = await db.query('SELECT * FROM auditoriums WHERE theater_id = $1 ORDER BY id', [theaterId]);
  return result.rows;
};
const getAuditoriumByID = async (auditoriumId) => {
    const result = await db.query('SELECT * FROM auditoriums WHERE id = $1', [auditoriumId]);
    return result.rows[0];
};


module.exports = {
  getAllAuditoriums,
  getAuditoriumsByTheater,
  getAuditoriumByID,
};
