import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookNotes",
  password: "123456",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkShelf() {
  const result = await db.query("SELECT * FROM bookshelf ORDER BY readAt DESC");
  // console.log(result.rows);

  let bookshelf = [];
  result.rows.forEach((book) => {
    bookshelf.push(book);
  });
  
  // console.log(bookshelf);

  return bookshelf;
}

app.get("/", async (req, res) => {
  const shelf = await checkShelf();

  // console.log(shelf);

  res.render("index.ejs", {
    shelf: shelf,
    pageTitle: "My Book Shelf",
  });
});

app.post("/addBook", async (req, res) => {
  res.render("addBook.ejs", {
    pageTitle: "Add Book to Shelf",
  });
});

app.post("/newBook", async (req, res) => {
  const newBook = await db.query(
    "INSERT INTO bookshelf (title, isbn, author, readat, rating, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [req.body.title, req.body.isbn, req.body.author, req.body.readat, req.body.rating, req.body.note]
  );

  // console.log(newBook.rows[0]);

  res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});