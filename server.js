require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Configuración de conexión a MySQL
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
};

// Pool de conexiones
let pool;
(async () => {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log("Conexión exitosa a MySQL");
  } catch (err) {
    console.error("Error al conectar a MySQL:", err.message);
  }
})();

// Endpoints CRUD
// Crear un nuevo usuario
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO Users (Name, Email) VALUES (?, ?)",
      [name, email]
    );
    res.status(201).json({ message: "Usuario creado", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al crear usuario", details: err.message });
  }
});

// Leer todos los usuarios
app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM Users");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios", details: err.message });
  }
});

// Actualizar un usuario
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    await pool.execute("UPDATE Users SET Name = ?, Email = ? WHERE Id = ?", [
      name,
      email,
      id
    ]);
    res.status(200).json({ message: "Usuario actualizado" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar usuario", details: err.message });
  }
});

// Eliminar un usuario
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute("DELETE FROM Users WHERE Id = ?", [id]);
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar usuario", details: err.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`);
});
