const express = require('express');
const mongoose = require('mongoose');
const userSchema = require('./models/user');
const recipeSchema = require('./models/recipe');
const ingredientSchema = require('./models/recipe');

const app = express();

//middleware
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://poli:password@localhost:27017/recipes?authSource=admin')
.then(() => console.log('conectado a Mongo'))
.catch((error) => console.error(error))

// Routes
app.get('/', (req, res) =>{
    res.send('Bienvenido a nuestro Recetario');
})

app.post('/new_user', (req,res) => {
    const user = userSchema(req.body);
    user.save()
    .then((data) => res.json(data))
    .catch((error) => res.send(error));
})

app.post('/new_recipe', (req,res) => {
    const recipe = recipeSchema(req.body);
    recipe.save()
    .then((data) => res.json(data))
    .catch((error) => res.send(error));
})


app.put('/rate', (req,res) => {
    const { recipeId, userId , rating } = req.body
    recipeSchema
    .updateOne(
        { _id: recipeId },
        [
            { $set: { ratings: {$concatArrays: [{$ifNull: ['$ratings', []]}, [{ userId: userId, rating: rating}]]}} },
            {$set: {avgRating: {$trunc: [{$avg:['$ratings.rating']},0]}}}
        ]
    )
    .then((data) => res.json(data))
    .catch((error) => {
        console.log(error)
        res.send("error")
    })
})

app.post('/recipes', (req, res) => {
    const { userId } = req.body;
    recipeSchema.find({ 'userId': userId })
      .then((data) => res.json(data))
      .catch((error) => {
        console.log(error);
        res.send("error");
      });
});

app.post('/recipesbyingredient', (req, res) => {
    const { ingredients } = req.body;
    const ingredientNames = ingredients.map(ingredient => ingredient.name);

    recipeSchema.find({ 'ingredients.name': { $all: ingredientNames }, 'ingredients': { $size: ingredientNames.length } })
        .then((data) => res.json(data))
        .catch((error) => {
            console.log(error);
            res.send("error");
        });
});

app.listen(3000, () => console.log("Esperando en puerto 3000..."));