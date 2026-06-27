const { dbRun, dbGet } = require('../db/database');

const createUser = async (email, password) => {
  const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
  const result = await dbRun(sql, [email, password]);
  return result.lastID;
};

const findUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  return await dbGet(sql, [email]);
};

const findUserById = async (id) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  return await dbGet(sql, [id]);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
