const HttpError = require('../models/httperror');
const { validationResult } = require('express-validator');

const Beer = require('../models/beer');
const User = require('../models/user');
const  mongoose  = require('mongoose');



const getBeerById = async (req, res, next) => {
    const beerId = req.params.bid;

    let place;
try {
     beer = await Beer.findById(beerId);
} catch (err) {
    const error = new HttpError(
        'Could not find the beer', 500
    );
    return next(error);
}


    if(!beer){
        const error = new HttpError
        ('Could not find a beer for the provided id', 404);
        return next(error);
    }
        res.json({beer: beer.toObject( { getters: true } )});
};


const getBeersByUserId = async (req, res, next) => {
    const userId =req.params.uid;
let beers;
    try {
         beers = await Beer.find( { creator: userId } );
    } catch (err) {
        const error = new HttpError(
            'Fetching beers failed', 500
        );
        return next(error);
    }


    if(!beers ){
      return next(
        new HttpError('Could not find a beers for the provided user id', 404))
      }

    res.json({beers: beers.map( beer => beer.toObject({ getters: true}))});
};

const createBeer = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        return next(
            new HttpError('invalid inputs', 422)
        );
    }

    const { beer, description, origin, creator } = req.body;
    const createdBeer = new Beer ({
        beer,
        description,
        image: 'https://www.marketingtochina.com/wp-content/uploads/2019/11/26-052442-man_goes_on_beer_only_diet_loses_25_pounds.jpg',
        origin,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    }catch (err) {
        const error = new HttpError(
            'Creating beer failed', 500
        );
        return next(error);
    }

    if(!user) {
        const error= new HttpError('Could not find the user for proided id', 404);
        return next( error);
    }



    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdBeer.save({ session: sess});
        user.beers.push(createdBeer);
        await user.save({ session: sess});
        await sess.commitTransaction();
    }catch (err) {
        const error = new HttpError(
            'Creating beer failed', 500
        );
        return next(error);
    }
    

    res.status(201).json({beer: createdBeer});
};

const updateBeer = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError('Invalid inputs passed, please check your data.', 422)
      );
    }

    const {beer, description, origin } = req.body;
    const beerId = req.params.bid;

    let updatedBeer;
    try {
        updatedBeer = await Beer.findById(beerId);
      }catch (err) {
        const error = new HttpError(
          'Something went wrong, could not update place.', 500
        );
        return next(error);
      } 

    updatedBeer.beer = beer;
    updatedBeer.description = description;
    updatedBeer.origin = origin;

    try {
        await updatedBeer.save();
      }catch (err) {
        const error = new HttpError(
          'Something went wrong could not update place.', 500
        );
        return next(error);
      }

      res.status(200).json({ beer: updatedBeer.toObject({ getters: true }) });
};


const deleteBeer = async (req, res, next) => {
    const beerId = req.params.bid;
    
    let beer;
    try {
        beer = await Beer.findById(beerId).populate('creator');
    }catch (err) {
        const error = new HttpError(
            'Could not delete a beer', 500
        );
        return next(error);
    }

    if(!beer) {
        const error= new HttpError('Could not find the place', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await beer.remove({session: sess});
        beer.creator.beers.pull(beer);
        await beer.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Could not delete a beer', 500
        )
        return next(error);
    }

    res.status(200).json({message: 'Deleted beer'});
};



exports.getBeerById = getBeerById;
exports.getBeersByUserId = getBeersByUserId;
exports.createBeer = createBeer;
exports.updateBeer = updateBeer;
exports.deleteBeer = deleteBeer;