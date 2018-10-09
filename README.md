# Music Uploader

<img width="1439" alt="music-uploader-front-2" src="https://user-images.githubusercontent.com/26535288/46587253-273db380-cad5-11e8-86c7-9f55fa5dd828.png">

Music Uploader is a Node.js SPA that allows users to upload, download and play their own songs. This site is currently live on https://sheltered-meadow-20717.herokuapp.com.

Different browsers support varying audio file types. Data is currently stored in a universal database via mLabs (using MongoDB and Amazon S3 Bucket). This is currently a unified 'music wall' where any user's upload is posted and viewable on this page (user sessions and account set up have not been created yet).

This application uses Node.js, Express and Mongo for backend, and EJS as the template engine.

## Get Started

First download files and within the CLI enter ```npm install``` when you're in the current directory to download all required dependencies.
This app uses mLabs for its cloud based db and uses a URI to access it. To add your own, create a folder directly under the music-uploader folder labeled ```config``` and create a file called ```db-config.js```. Inside this file, add your Mongo URI like this;

```    const MongoURI = 'ENTER MONGO URI HERE';```

```    module.exports = MongoURI;```

Once created, within your CLI, ensure you're within the music-uploader directory and run ```node index.js```.
