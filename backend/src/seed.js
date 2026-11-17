require("dotenv").config();
const pool = require("./db");

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      "INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)",
      ["Library Administrator", "admin", "Admin"]
    );
    await connection.execute(
      "INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)",
      ["Demo Member", "member001", "Member"]
    );

    const demoBooks = [
      ["Things Fall Apart", "Chinua Achebe", "Fiction", "9780385474542", 4],
      ["The Alchemist", "Paulo Coelho", "Adventure", "9780061122415", 1],
      ["Purple Hibiscus", "Chimamanda Ngozi Adichie", "Fiction", "9781616202415", 3],
      ["Long Walk to Freedom", "Nelson Mandela", "Biography", "9780316548182", 0],
      ["Atomic Habits", "James Clear", "Self-help", "9780735211292", 5]
    ];
    for (const book of demoBooks) {
      await connection.execute(
        "INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), author=VALUES(author), genre=VALUES(genre)",
        book
      );
    }
    await connection.commit();
    console.log("Seed complete. Login with admin or member001.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch(error => { console.error(error); process.exit(1); });
