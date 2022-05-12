//Import du contenu extérieur : modules et fichiers
const multer = require('multer');
const jwt = require("jsonwebtoken");

//Création d'un objet faisant correspondre les mimetypes acceptés avec les extensions
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/apng': 'apng',
    'image/avif': 'avif',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
}

//Paramétrage de la destination et du nom du fichier
const storage = multer.diskStorage({
    //Définition du dossier destination
    destination: function (req, file, callback) {
        callback(null, 'images');
    },
    //Définition du nom à attribuer
    filename: function (req, file, callback) {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    },
});

//Paramétrage des filtres à appliquer à réception du fichier
const filter = (req, file, callback) => {
    if (file.mimetype in MIME_TYPES) {
        callback(null, true)
    } else {
        callback(new Error("File format not accepted"), false)
    }
};

//Capture du fichier avec les paramètres définis ci-dessus
const upload = multer({
    storage: storage,
    fileFilter : filter
});

//Middleware de téléchargement du fichier
module.exports = (req, res, next) => {
    upload.single('image')(req, res, function (error) {
        if (error) {
            return res.status(403).json({error : error.message})
        } else {
            next();
        }
    })
};













    /*try {
        console.log(file.mimetype)
        if (!(file.mimetype in MIME_TYPES)) {
            //throw "File format not authorized";
        } else {
            multer({storage}).single('image');
        }
    } catch (error) {
        res.status(403).json({error : error});
    }*/
