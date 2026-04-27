const pool = require('../config/db');

const createBooksTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      genre VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

const createBook = async ({ title, author, genre, description, user_id }) => {
  const result = await pool.query(
    'INSERT INTO books (title, author, genre, description, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, author, genre, description, user_id]
  );
  return result.rows[0];
};

const getBooks = async ({ author, genre } = {}) => {
  let query = 'SELECT b.*, u.email as added_by FROM books b JOIN users u ON b.user_id = u.id';
  const params = [];

  if (author && genre) {
    query += ' WHERE LOWER(b.author) = LOWER($1) AND LOWER(b.genre) = LOWER($2)';
    params.push(author, genre);
  } else if (author) {
    query += ' WHERE LOWER(b.author) = LOWER($1)';
    params.push(author);
  } else if (genre) {
    query += ' WHERE LOWER(b.genre) = LOWER($1)';
    params.push(genre);
  }

  query += ' ORDER BY b.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = { createBooksTable, createBook, getBooks };
