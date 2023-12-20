const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(bodyParser.json());

function formatTime() {
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return time;
}

let elements = [];

// Lire à partir d'un fichier au démarrage du serveur
function chargerElements() {
  fs.readFile('elements.json', 'utf8', (err, data) => {
    if (err) {
      console.error(formatTime() + ' : Erreur lors de la lecture du fichier elements.json :', err);
      return;
    }
    try {
      elements = JSON.parse(data);
      console.log(formatTime() + ' : Les éléments ont été chargés avec succès.');
    } catch (error) {
      console.error(formatTime() + ' : Erreur lors du parsing du fichier JSON :', error);
    }
  });
}

// Écrire dans un fichier
function sauvegarderElements() {
  fs.writeFile('elements.json', JSON.stringify(elements, undefined, 4), err => {
    if (err) {
      console.error(formatTime() + ' : Erreur lors de la sauvegarde des éléments :', err);
      return;
    }
    console.log(formatTime() + ' : Les éléments ont été sauvegardés avec succès.');
  });
}

let next_id = -1;

// Lire à partir d'un fichier au démarrage du serveur
function chargerNextId() {
  fs.readFile('next_id.json', 'utf8', (err, data) => {
    if (err) {
      console.error(formatTime() + ' : Erreur lors de la lecture du fichier next_id.json :', err);
      return;
    }
    try {
      next_id = JSON.parse(data).next_id;
      console.log(formatTime() + ' : Les ids ont été chargés avec succès.');
    } catch (error) {
      console.error(formatTime() + ' : Erreur lors du parsing du fichier JSON :', error);
    }
  });
}

// Écrire dans un fichier
function sauvegarderNextId() {
  next_id += 1;
  fs.writeFile('next_id.json', JSON.stringify({next_id: next_id}), err => {
    if (err) {
      console.error(formatTime() + ' : Erreur lors de la sauvegarde des ids :', err);
      return;
    }
    console.log(formatTime() + ' : Les ids ont été sauvegardés avec succès.');
  });
}

// app.get('/', (req, res) => {
//     res.render('home', { elements });
// });
app.get('/', (req, res) => {
  let sortedElements = [...elements]; // Copie des éléments pour ne pas modifier l'original

  // Vérification du paramètre de tri dans l'URL
  const sortBy = req.query.sort;

  if (sortBy === 'nom') {
    sortedElements.sort((a, b) => a.nom.localeCompare(b.nom)); // Tri par nom
  } else if (sortBy === 'annee') {
    sortedElements.sort((a, b) => a.annee - b.annee); // Tri par année
  } else if (sortBy === 'genre') {
    sortedElements.sort((a, b) => a.genre.localeCompare(b.genre)); // Tri par genre
  }
  
  // Rendu de la page avec les éléments triés
  res.render('home', { elements: sortedElements });
});

app.get('/admin/elements', (req, res) => {
  let sortedElements = [...elements]; // Copie des éléments pour ne pas modifier l'original

  // Vérification du paramètre de tri dans l'URL
  const sortBy = req.query.sort;

  if (sortBy === 'nom') {
    sortedElements.sort((a, b) => a.nom.localeCompare(b.nom)); // Tri par nom
  } else if (sortBy === 'annee') {
    sortedElements.sort((a, b) => a.annee - b.annee); // Tri par année
  } else if (sortBy === 'genre') {
    sortedElements.sort((a, b) => a.genre.localeCompare(b.genre)); // Tri par genre
  }
  
  // Rendu de la page avec les éléments triés
  res.render('elements', { elements: sortedElements });
});

app.get('/admin/ajouter', (req, res) => {
  res.render('ajouter');
});

app.post('/admin/ajouter', (req, res) => {
  const { nom, type, annee, description, genre, image } = req.body;
  const newElement = {
    id: next_id,
    nom,
    type,
    annee,
    description,
    genre,
    image,
  };
  elements.push(newElement);
  sauvegarderElements(); // Appel pour sauvegarder après l'ajout
  sauvegarderNextId();
  setTimeout(() => {
    console.log(formatTime() + ' : le prochain id est ' + next_id);
  }, 500);
  res.redirect('/admin/elements');
});

app.get('/admin/modifier/:id', (req, res) => {
  const { id } = req.params;
  const element = elements.find(el => el.id === parseInt(id));
  if (element) {
    res.render('modifier', { element });
  } else {
    res.status(404).send('Élément non trouvé');
  }
});

app.post('/admin/modifier/:id', (req, res) => {
  const { id } = req.params;
  const { nom, type, annee, description, genre, image } = req.body;
  const elementIndex = elements.findIndex(el => el.id === parseInt(id));
  if (elementIndex !== -1) {
    elements[elementIndex] = { ...elements[elementIndex], nom, type, annee, description, genre, image };
    sauvegarderElements(); // Appel pour sauvegarder après la modification
    res.redirect('/admin/elements');
  } else {
    res.status(404).send('Élément non trouvé');
  }
});

app.delete('/admin/supprimer/:id', (req, res) => {
  const { id } = req.params;
  elements = elements.filter(el => el.id !== parseInt(id));
  sauvegarderElements(); // Appel pour sauvegarder après la suppression
  res.sendStatus(204);
});

app.get('/*', (req, res) => {
  res.status(404).render('error');
});

chargerElements(); // Appeler cette fonction au démarrage du serveur pour charger les données
chargerNextId();

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
