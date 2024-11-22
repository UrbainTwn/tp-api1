/*require('dotenv').config();
const express = require("express");
const { Pool } = require('pg');
 
const app = express();
const port = process.env.PORT  || 3000 ;
 
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});
 
// Middleware pour parser le JSON
app.use(express.json());
 
// Création de la table utilisateur (à exécuter une fois)
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        resume JSONB
    )
`)
.then(() => console.log('Table users créée ou déjà existante'))
.catch(err => console.error('Erreur lors de la création de la table:', err));
 
// Définir les routes
app.get('/', (req, res) => {
    res.send('Hello from your CV API!');
});
 
app.get("/users", async (req, res) => {
    try{
        const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
 
        res.send(`Liste des utilisateurs : ${JSON.stringify(result.rows)}`)
    }catch(err){
        res.status(500).json({
            "message": `Une erreur ; ${err}.`
        });
    }
});
 
app.post("/users", async (req,res) => {
    try{
      const {name, email, resume} = req.body;
      const result = await pool.query("INSERT INTO users(name, email, resume) VALUES($1, $2, $3) RETURNING *", [name, email, resume]);
      res.status(201).json(result.rows[0]);
    }catch(err){
      console.error(err);
      res.status(500).json({
        message: "Erreur lors de la création de l'utilisateur."
      });
    }  
  });
 
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
}); */


// Import des dépendances
require('dotenv').config();
const express = require("express");
const { Pool } = require('pg');

// Initialisation de l'application et du port
const app = express();
const port = process.env.PORT || 3000;

// Configuration de la connexion à la base PostgreSQL
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT
});

// Middleware pour parser le JSON
app.use(express.json());

// Création de la table articles (à exécuter une fois)
pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author TEXT NOT NULL
    )
`)
.then(() => console.log('Table articles créée ou déjà existante'))
.catch(err => console.error('Erreur lors de la création de la table articles:', err));

// Routes pour articles
app.get("/articles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM articles ORDER BY id ASC");
        res.status(200).json({
            message: "Liste des articles récupérée avec succès.",
            articles: result.rows
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des articles :", err);
        res.status(500).json({
            message: `Une erreur s'est produite : ${err.message}.`
        });
    }
});

app.post("/articles", async (req, res) => {
    try {
        const { title, content, author } = req.body;
        if (!title || !content || !author) {
            return res.status(400).json({ message: "Tous les champs sont requis : title, content, author." });
        }
        const result = await pool.query(
            "INSERT INTO articles (title, content, author) VALUES ($1, $2, $3) RETURNING *",
            [title, content, author]
        );
        res.status(201).json({
            message: "Article ajouté avec succès.",
            article: result.rows[0]
        });
    } catch (err) {
        console.error("Erreur lors de l'ajout de l'article :", err);
        res.status(500).json({
            message: "Erreur lors de la création de l'article."
        });
    }
});

app.patch("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author } = req.body;

        const fields = [];
        if (title) fields.push(`title = '${title}'`);
        if (content) fields.push(`content = '${content}'`);
        if (author) fields.push(`author = '${author}'`);

        if (fields.length === 0) {
            return res.status(400).json({ message: "Aucune donnée fournie pour la mise à jour." });
        }

        const query = `UPDATE articles SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article non trouvé." });
        }

        res.status(200).json({
            message: "Article mis à jour avec succès.",
            article: result.rows[0]
        });
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'article :", err);
        res.status(500).json({
            message: "Erreur lors de la mise à jour de l'article."
        });
    }
});

app.delete("/articles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM articles WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article non trouvé." });
        }

        res.status(200).json({
            message: "Article supprimé avec succès.",
            article: result.rows[0]
        });
    } catch (err) {
        console.error("Erreur lors de la suppression de l'article :", err);
        res.status(500).json({
            message: "Erreur lors de la suppression de l'article."
        });
    }
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
