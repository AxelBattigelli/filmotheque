const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const port = 3000; // Vous pouvez utiliser un port différent si celui-ci est déjà utilisé

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Utilisation de method-override pour gérer DELETE via POST
app.use(methodOverride('_method'));

// Exemple de base de données JSON
let elements = [
  { id: 0, nom: 'Element 0', type: 'Type Z' },
  { id: 1, nom: 'Element 1', type: 'Type A' },
  { id: 2, nom: 'Element 2', type: 'Type B' },
];

app.use(bodyParser.json());

// Récupérer tous les éléments
app.get('/elements', (req, res) => {
    res.render('elements', { elements });
  });

// Affichage du formulaire pour ajouter un élément
app.get('/ajouter', (req, res) => {
    res.render('ajouter');
  });
  
  // Route pour recevoir les données du formulaire d'ajout
  app.post('/ajouter', (req, res) => {
    const { nom, type } = req.body;
    const newElement = {
      id: elements.length + 1,
      nom,
      type,
    };
    elements.push(newElement);
    res.redirect('/elements');
  });

// Affichage du formulaire pour modifier un élément par son ID
app.get('/modifier/:id', (req, res) => {
    const { id } = req.params;
    const element = elements.find(el => el.id === parseInt(id));
    if (element) {
      res.render('modifier', { element });
    } else {
      res.status(404).send('Élément non trouvé');
    }
  });
  
  // Route pour recevoir les données du formulaire de modification
  app.post('/modifier/:id', (req, res) => {
    const { id } = req.params;
    const { nom, type } = req.body;
    const elementIndex = elements.findIndex(el => el.id === parseInt(id));
    if (elementIndex !== -1) {
      elements[elementIndex] = { ...elements[elementIndex], nom, type };
      res.redirect('/elements');
    } else {
      res.status(404).send('Élément non trouvé');
    }
  });

// Route pour supprimer un élément par son ID
app.delete('/supprimer/:id', (req, res) => {
    const { id } = req.params;
    elements = elements.filter(el => el.id !== parseInt(id));
    res.sendStatus(204);
  });

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
