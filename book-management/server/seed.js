/**
 * Seed script — populates the database with a sample user and 10 books.
 * Run with:  node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

const SEED_USER = { email: 'librarian@bookshelf.com', password: 'Bookshelf@123' };

const BOOKS = [
  { title: 'A Brief History of Time', author: 'Stephen Hawking', genre: 'Science',
    description: 'A landmark volume in science writing by one of the great minds of our time, Stephen Hawking\'s book explores such profound questions as: How did the universe begin—and what made its start possible?' },

  { title: 'The Grand Design', author: 'Stephen Hawking', genre: 'Science',
    description: 'In this startling and lavishly illustrated book, Hawking and Mlodinow present the most recent scientific thinking about the mysteries of the universe in nontechnical language.' },

  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', genre: 'History',
    description: 'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution—a #1 international bestseller that explores the ways in which biology and history have defined us.' },

  { title: 'Homo Deus: A Brief History of Tomorrow', author: 'Yuval Noah Harari', genre: 'Non-Fiction',
    description: 'Yuval Noah Harari, author of the bestselling Sapiens, envisions a near future in which humans face a new set of challenges—questions of consciousness, free will, and what it means to be human.' },

  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', genre: 'Psychology',
    description: 'In this work, Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think and how they shape our judgments and decisions.' },

  { title: 'The Psychology of Money', author: 'Morgan Housel', genre: 'Economics',
    description: 'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know. It\'s about how you behave, and behavior is hard to teach, even to really smart people.' },

  { title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you how to form good habits and break bad ones.' },

  { title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', genre: 'Fiction',
    description: 'Seconds before the Earth is demolished to make way for a hyperspace bypass, Arthur Dent is plucked off the planet by his friend Ford Prefect. Together they begin a wild journey through time and space.' },

  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy',
    description: 'Told in Kvothe\'s own voice, this is the tale of a magically gifted young man who grows to be the most notorious wizard his world has ever seen. A high-fantasy novel widely praised for its vivid prose.' },

  { title: 'Steve Jobs', author: 'Walter Isaacson', genre: 'Biography',
    description: 'Based on more than forty interviews with Jobs conducted over two years—as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur.' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create seed user if not exists
    let { rows: [user] } = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [SEED_USER.email]
    );
    if (!user) {
      const hash = await bcrypt.hash(SEED_USER.password, 12);
      const res = await client.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
        [SEED_USER.email, hash]
      );
      user = res.rows[0];
      console.log(`Created seed user: ${SEED_USER.email}`);
    } else {
      console.log(`Seed user already exists: ${SEED_USER.email}`);
    }

    // Insert books (skip if title+author already present)
    let added = 0;
    for (const book of BOOKS) {
      const { rows } = await client.query(
        'SELECT id FROM books WHERE LOWER(title) = LOWER($1) AND LOWER(author) = LOWER($2)',
        [book.title, book.author]
      );
      if (rows.length === 0) {
        await client.query(
          'INSERT INTO books (title, author, genre, description, user_id) VALUES ($1,$2,$3,$4,$5)',
          [book.title, book.author, book.genre, book.description, user.id]
        );
        added++;
        console.log(`  + "${book.title}" by ${book.author}`);
      } else {
        console.log(`  ~ Skipped (exists): "${book.title}"`);
      }
    }

    await client.query('COMMIT');
    console.log(`\nSeeding complete. ${added} book(s) added.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
