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

  const bookshelf = result.rows.map((book) => ({
    ...book, // copy all properties from the book object exactly same
    readat: book.readat?.toISOString().split('T')[0], // returns 'YYYY-MM-DD'. here we are only updating the readat property
  }));

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

app.post("/editBook", async (req, res) => {
  const changeID = req.body.editBookID;
  console.log(changeID);

  const result = await db.query(
    "SELECT * FROM bookshelf WHERE id = $1;",
    [changeID]
  );

  console.log(result.rows);

  const bookshelf = result.rows.map((book) => ({
    ...book, // copy all properties from the book object exactly same
    readat: book.readat?.toISOString().split('T')[0], // returns 'YYYY-MM-DD'. here we are only updating the readat property
  }));

  console.log(bookshelf);
  
  res.render("editBook.ejs", {
    pageTitle: "Edit Book",
    shelf: bookshelf[0],
  });
});

app.post("/updateBook", async (req, res) => {
  const changeID = req.body.editBookID;
  
  const newBook = await db.query(
    "UPDATE bookshelf SET title = $1, isbn = $2, author = $3, readat = $4, rating = $5, note = $6 WHERE id = $7 RETURNING *",
    [req.body.title, req.body.isbn, req.body.author, req.body.readat, req.body.rating, req.body.note, changeID]
  );

  res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});