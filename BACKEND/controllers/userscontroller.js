const HttpError = require('../models/httperror');
const { validationResult } = require('express-validator');
const User = require('../models/user');




const getUsers = async (req, res, next) => {

    let users;
    try {
        users = await User.find({}, '-password');
    }catch (err) {
        const error = new HttpError(
            'Could not fetch users',
            500
        );
        return next(error);
    }
    res.json({ users: users.map( user=> user.toObject({ getters: true}))});

};

const signup = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors);
        return next(
            new HttpError('invalid inputs', 422)
        );
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
     existingUser = await User.findOne({ email: email});
    } catch (err) {
        const error = new HttpError(
            'Signing up failed', 500
        );
        return next(error);
    }

    if(existingUser){
        const error = new HttpError ('User exist already', 422);
        return next(error);
    }


    const createdUser = new User({
        name,
        email,
        image: 'https://cdn.pixabay.com/photo/2016/06/15/10/14/man-1458576_1280.png',
        password,
        beers: []
    });

    try {
        await createdUser.save();
    }catch (err) {
        const error = new HttpError(
            'Signing up failed', 500
        );
        return next(error);
    }
    
    res.status(201).json({user: createdUser.toObject({getters: true})});
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email})
    } catch (err) {
        const error = new HttpError(
            'Could not login', 500
        );
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Invalid credentials', 401
        )
        return next(error);
    }

    res.json({message: 'logged in', user: existingUser.toObject({getters: true})});
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;