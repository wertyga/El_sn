import hash from 'password-hash';

import validateInputs from '../middlewares/validateRequireFields';

import { getTradePairs } from './common/functions';

import User, { userFields, encryptPassword } from '../models/user';
import Session from '../models/session';

const route = require('express').Router();

// Registration new user
route.post('/sign-up', validateInputs, (req, res) => {
    User.findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                res.status(409).json({ errors: { username: 'User is already exist' }});
            } else {
                return Promise.all([
                    signUpNewUser(req),
                    getTradePairs()
                ])
                    .then(resp => {
                        const [user, pairs] = resp;
                        Session.saveToken(user.user._id.toString())
                            .then(token => {
                                res.json({
                                    ...user,
                                    token: token,
                                    pairs,
                                    powerPercents: []
                                })
                            });
                    })
            }
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))
});


//Login user
route.post('/login', validateInputs, (req, res) => {
    return Promise.all([
        User.findOne({ username: req.body.username}, 'hashPassword'),
        getTradePairs()
    ])
        .then(data => {
            const [user, pairs] = data;
            if(user && user.hashPassword === encryptPassword(req.body.password)) {
                return User.populateAllFields({ username: req.body.username})
                    .then(user => {
                        return Session.saveToken(user._id.toString())
                            .then(token => {
                                res.json({
                                    user: userFields(user),
                                    tradePairs: user.tradePairs,
                                    pairs,
                                    token: token,
                                    powerPercents: user.percents.map(item => ({
                                        isSeen: item.isSeen,
                                        ...item.percentId._doc
                                    }))
                                })
                            });
                    })
            } else if(!user) {
                res.status(404).json({ errors: { username: 'User is not exist'}});
            } else {
                res.status(404).json({ errors: { password: 'Password is not correct'}});
            }
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))

});

route.post('/logout', (req, res) => { // Logout user
    Session.findByTokenAndRemove(req.body.token)
        .then(() => res.json('logout'))
        .catch(err => console.error(`Error in logout: ${err.message}`))
});

route.get('/quit-app/:userID', (req, res) => {
    return Session.findByUserAndRemove(req.params.userID)
});

export default route;

export function loginUser(searchFieldObj) { // Login user
    return User.populateAllFields(searchFieldObj)
};

function signUpNewUser(req) { // Sign up new user
    return new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }).save()
        .then(user => {
            return {
                user: userFields(user),
                tradePairs: user.tradePairs
            }})
        .catch(err => console.error(`Error in "signUpNewUser": ${err}`))
};
