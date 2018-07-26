import shortID from 'shortid';
import validateInputs from '../middlewares/validateRequireFields';

import { getTradePairs } from '../common/functions/main';

import User, { userFields, encryptPassword } from '../models/user';
import Session from '../models/session';

import { sendMailEE } from "../common/functions/commonFunctions";

const route = require('express').Router();

// Registration new user
route.post('/sign-up', validateInputs, (req, res) => {
    User.find({ $or: [{ username: req.body.username }, { email: req.body.email }] })
        .then(user => {
            if(user.length > 0) {
                res.status(409).json({ errors: { globalError: 'User is already exist' }});
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

route.post('/remind-pass', (req, res) => {
    const { username } = req.body;

    if(!username) {
        return res.status(403).json({ errors: { username: 'Field can not be blank' } });
    } else {
        return User.findOne({ username })
            .then(user => {
                if(!user) {
                    return res.status(404).json({ errors: { username: 'User is not exist' } });
                } else {
                    const verifyCode = shortID.generate();
                    const mailOptions = {
                        from: '"Crypto_signer" <cryptosignefication@gmail.com>',
                        to: user.email,
                        subject: 'Verify code for reestablish password from "Crypto_Signer"',
                        html: `<p>Verify code:</p><p><strong>${verifyCode}</strong></p>`
                    };
                    sendMailEE.emit('send_mail', mailOptions);
                    user.verifyPassCode = verifyCode;
                    return user.save().then(() => res.json('Code was send!'));
                };
            })
            .catch(err => res.status(err.status || 500).json({ errors: { globalError: err.message } }))
    }
});

route.post('/change-pass', validateInputs, (req, res) => {
    const { password, passwordConfirm } = req.body;
    if(password !== passwordConfirm) {
        return res.status(406).json({ errors: { passwordConfirm: 'Passwords not match' }})
    };

    return User.findOne({ verifyPassCode: req.body.verifyCode })
        .then(user => {
            if(!user || !user.verifyPassCode) {
                return res.status(404).json({ errors: { globalError: 'Code expired or user not exist' }})
            } else {
                user.hashPassword = encryptPassword(password);
                user.verifyPassCode = '';
                return user.save().then(() => {
                    return res.json('Password reset!');
                });
            };
        })
        .catch(err => res.status(500).json({ errors: { globalError: err.message }}))
});

export default route;

export function loginUser(searchFieldObj) { // Login user
    return User.populateAllFields(searchFieldObj)
};

function signUpNewUser(req) { // Sign up new user
    return new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        emailCancelToken: encryptPassword(req.body.email)
    }).save()
        .then(user => {
            return {
                user: userFields(user),
                tradePairs: user.tradePairs
            }})
        .catch(err => console.error(`Error in "signUpNewUser": ${err}`))
};
