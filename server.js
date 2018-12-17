'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const PORT = process.env.PORT || 3000;

// connect to database
const mongoOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  promiseLibrary: global.Promise,
  useFindAndModify: false
}
mongoose.connect(process.env.DB, mongoOptions)
  .then(() => console.log('connected successfully to mongodb'))
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only
app.use(helmet());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(path.resolve(__dirname, 'views', 'project.shadow.html'));
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.shadow.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
  if(process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        const error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing