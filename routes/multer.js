var multer = require('multer');
var {v4 : uuidv4} = require('uuid');
var path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/upload')
    },
    filename: function (req, file, cb) {
        const uniqueFileName = uuidv4();
        cb(null,uniqueFileName + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage })
module.exports = upload;