const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/httperror');
const usersRoutes = require('./routes/users-routes');
const beersRoutes = require('./routes/beers-routes')

const app = express();

app.use(bodyParser.json());

app.use((req, res, next ) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
  });

app.use('/api/beers' ,beersRoutes);

app.use('/api/users' , usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError ('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {s
    if(res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'AN unknown error occured'});
});


mongoose
.connect('mongodb+srv://Beer:beer@cluster0.1qffc.mongodb.net/mern?retryWrites=true&w=majority')
.then(() => {
    app.listen(5000);
})
.catch(err => {
    console.log(err);
});

