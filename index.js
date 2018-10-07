const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

//init app
const app = express();

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

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const aliases = path.basename(file.originalname);
        const fileInfo = {
          filename,
          aliases,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({storage});


// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.render('index', { files: false });
    } else {
      files.map(file => {
        if (file.contentType === 'audio/mpeg' ||
            file.contentType === 'audio/wav' ||
            file.contentType === 'audio/mp3' ||
            file.contentType === 'audio/flac' ||
            file.contentType === 'audio/aac'||
            file.contentType === 'audio/ogg') {
          file.isAudio = true;
        } else {
          file.isAudio = false;
        }
      });
      res.render('index', { files });
    }
  });
});

// @route POST /upload
// @desc  Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
  // res.json({ file: req.file });
  res.redirect('/');
});

// @route GET /files
// @desc  Display all files in JSON
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @desc  Display single file object
app.get('/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }
    // File exists
    return res.json(file);
  });
});

// @route GET /audio/:filename
// @desc Display audio
app.get('/audio/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if audio
    if (file.contentType === 'audio/mpeg' ||
        file.contentType === 'audio/wav' ||
        file.contentType === 'audio/mp3' ||
        file.contentType === 'audio/flac' ||
        file.contentType === 'audio/aac' ||
        file.contentType === 'audio/ogg') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an audio file'
      });
    }
  });
});

// @route DELETE /files/:id
// @desc  Delete file
app.delete('/files/:id', (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err
      });
    }

    res.redirect('/');
  });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
