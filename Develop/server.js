const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

// Helper function to read the db.json file
const readDbFile = () => {
  const data = fs.readFileSync(path.join(__dirname, '/db/db.json'), 'utf8');
  return JSON.parse(data);
};

// Helper function to write to the db.json file
const writeDbFile = (data) => {
  fs.writeFileSync(path.join(__dirname, '/db/db.json'), JSON.stringify(data), 'utf8');
};

// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
  const notes = readDbFile();
  return res.json(notes);
});

// POST Route for submitting a new note
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ message: 'Note title and text are required.' });
  }

  const newNote = { title, text, id: uuidv4() };
  const notes = readDbFile();
  notes.push(newNote);
  writeDbFile(notes);

  return res.json(newNote);
});

// DELETE Route for a specific note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const notes = readDbFile();
  const filteredNotes = notes.filter((note) => note.id !== id);
  writeDbFile(filteredNotes);

  return res.json({ message: 'Deleted note with id: ' + id });
});

// Wildcard route to direct users to the homepage
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
