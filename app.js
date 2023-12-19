const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs'); // Ajout du module 'fs' pour la manipulation des fichiers
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(methodOverride('_method'));
app.use(bodyParser.json());

let elements = [];

// Lire à partir d'un fichier au démarrage du serveur
function chargerElements() {
  fs.readFile('elements.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier elements.json :', err);
      return;
    }
    try {
      elements = JSON.parse(data);
      console.log('Les éléments ont été chargés avec succès.');
    } catch (error) {
      console.error('Erreur lors du parsing du fichier JSON :', error);
    }
  });
}

// Écrire dans un fichier
function sauvegarderElements() {
  fs.writeFile('elements.json', JSON.stringify(elements), err => {
    if (err) {
      console.error('Erreur lors de la sauvegarde des éléments :', err);
      return;
    }
    console.log('Les éléments ont été sauvegardés avec succès.');
  });
}

app.get('/', (req, res) => {
    res.render('home', { elements });
  });

app.get('/admin/elements', (req, res) => {
  res.render('elements', { elements });
});

app.get('/admin/ajouter', (req, res) => {
  res.render('ajouter');
});

app.post('/admin/ajouter', (req, res) => {
  const { nom, type } = req.body;
  const newElement = {
    id: elements.length + 1,
    nom,
    type,
  };
  elements.push(newElement);
  sauvegarderElements(); // Appel pour sauvegarder après l'ajout
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
  const { nom, type } = req.body;
  const elementIndex = elements.findIndex(el => el.id === parseInt(id));
  if (elementIndex !== -1) {
    elements[elementIndex] = { ...elements[elementIndex], nom, type };
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

chargerElements(); // Appeler cette fonction au démarrage du serveur pour charger les données

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
