const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

//init app
const app = express();

// morgan for http request logging
app.use(morgan('dev'));
//parser
app.use(bodyParser.json())
//templating engine
app.set('view engine', 'ejs');
//form delete functionality - argument is telling methodOverride that we plan to use string to add functionality
app.use(methodOverride('_method'));

//public folder
app.use(express.static('./public'));

//Mongo URI
const mongoURI = 'mongodb://peter:eternity69@ds115283.mlab.com:15283/songs-db';

//mongo connection

const conn = mongoose.createConnection(mongoURI);

//set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb)=>{
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
})

//init upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb)=>{
    checkFileType(file, cb)
  }
}).single('singleSong');

//function check file type to only mp3/flac/wav

const checkFileType = (file, cb) =>{
  //allowed extensions
   const fileTypes = /mp3|mpeg|flac|wav/;
  //check extension - going to match the file name extension to any of the filetype regex
   const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
   // check mimetype - avoid mislabeled incorrect file formats
   const mimeType = fileTypes.test(file.mimetype);

   if(mimeType && extName){
     return cb(null, true);
   } else{
     cb('Error: audio files (mp3, mpeg, flac, wav formats) only.')
   }
}

app.get('/', (req, res)=> res.render('index'));

//upload route
app.post('/upload', (req, res)=>{
  upload(req, res, (err)=>{
    if(err){
      res.render('index', { msg: err})
    } else{
      if(req.file == undefined){
        res.render('index', { msg: 'Please select file to upload.'})
      } else{
        res.render('index',
                    { msg: 'File uploaded.',
                      file: `/uploads/${req.file.filename}`
                    }
                  )
        }
    }
  })
})


const port = 3000;

app.listen(port, ()=> console.log(`Server running on port ${port}`));
