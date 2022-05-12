//Import du contenu extérieur : modules et fichiers
const multer = require('multer');
const jwt = require("jsonwebtoken");

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

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'images');
    },
    filename: function (req, file, callback) {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    },
});

const filter = (req, file, callback) => {
    if (file.mimetype in MIME_TYPES) {
        callback(null, true)
    } else {
        callback(new Error("File format not accepted"), false)
    }
};

const upload = multer({
    storage: storage,
    fileFilter : filter
});

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
