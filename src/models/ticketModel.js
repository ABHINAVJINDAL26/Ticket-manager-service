const { dbRun, dbGet, dbAll } = require('../db/database');

const createTicket = async (title, description, userId) => {
  const sql = `INSERT INTO tickets (title, description, userId) VALUES (?, ?, ?)`;
  const result = await dbRun(sql, [title, description, userId]);
  return await getTicketById(result.lastID);
};

const getTicketsByUserId = async (userId) => {
  const sql = `SELECT id, title, status, createdAt FROM tickets WHERE userId = ? ORDER BY id ASC`;
  return await dbAll(sql, [userId]);
};

const getTicketById = async (id) => {
  const sql = `SELECT * FROM tickets WHERE id = ?`;
  return await dbGet(sql, [id]);
};

const updateTicketStatus = async (id, status) => {
  const sql = `UPDATE tickets SET status = ? WHERE id = ?`;
  await dbRun(sql, [status, id]);
  return await getTicketById(id);
};

module.exports = {
  createTicket,
  getTicketsByUserId,
  getTicketById,
  updateTicketStatus
};
