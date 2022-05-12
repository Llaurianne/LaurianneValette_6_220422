//Import du contenu extérieur : modules et fichiers
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')

//Définition du schéma user
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true, match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ }, // @todo : Validation Regex
    password: { type: String, required: true },
});

//Ajout du plugin permettant la vérification de l'unicité de l'email utilisé
userSchema.plugin(uniqueValidator);

//Export du schéma
module.exports = mongoose.model('User', userSchema);