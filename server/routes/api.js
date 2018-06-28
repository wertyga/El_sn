import isEmpty from 'lodash/isEmpty';

import validateCredentials from '../middlewares/session';
import ValidationCorrectPair from '../middlewares/ValidationCorrectPair';
import { validateEmail } from '../middlewares/inputsValidation';
import { getPowerPercentsFromUser } from '../common/functions/commonFunctions';

import Pair, { pairFields } from '../models/pair';
import ActualPairs  from '../models/tradePairs';
import User, { userFields } from '../models/user';
import Whales from '../models/whale';

const routes = require('express').Router();

routes.post('/subscribing', validateCredentials, (req, res) => {
    const { userID } = req.body;
    if(!userID || typeof userID !== 'string' || userID.length < 1) {
        res.status(401).json('Access denided');
        return;
    };

    return User.findById(userID)
        .then(user => {
            if(!user) {
                res.status(403).json({ redirect: '/' });
            } else {
                user.isReceiveMail = !user.isReceiveMail;
                return user.save().then(user => res.json({ user: userFields(user) }))
            }
        })
        .catch(err => res.status(400).json({ errors: err.message }))
});

routes.post('/get-whales', validateCredentials, (req, res) => {
    const { amount } = req.body;
    const type = req.body.type ? 'bids' : 'asks';
    if(!amount || amount < 0 || isNaN(amount)) {
        res.json([]);
        return;
    };
    return Whales.find({ type })
        .where('orders.totalBtc')
        .gt(amount)
        .then(whales => {
            const resultWhales = whales.map(whale => {
                return {
                    ...whale._doc,
                    orders: whale.orders.filter(item => item.totalBtc >= amount)
                }
            });
            res.json(resultWhales)
        })
        .catch(err => res.status(500).json({ errors: err.message }))
});

routes.post('/delete-percent-pair', validateCredentials, (req, res) => {
    const { userId, percentPairsId } = req.body;

    return User.findById(userId)
        .then(user => { 
            user.percents.splice(user.percents.indexOf(percentPairsId), 1);
            return user.save()
        })
        .then(() => res.json(`${percentPairsId} - deleted`))
        .catch(err => res.status(500).json(err.message))
});

routes.post('/set-sign', validateCredentials, ValidationCorrectPair, (req, res) => { // Set sign price
    const { price, pair, userId } = req.body;

    return ActualPairs.findOne({ symbol: pair })
        .then(actualPair => {
            if(!actualPair) throw new Error('There is no symbol');
            return actualPair;
        })
        .then(actualPair => {
            return new Pair({
                title: pair,
                titleId: actualPair._id,
                signPrice: price,
                owner: userId
            }).save()
                .then(pair => {
                    return Pair.populateByTitle(pair._id)
                })
                .then(pair => {
                    res.json(pair)
                })
        })
        .catch(err => res.status(400).json( err.message ))
});

routes.post('/delete-pair', validateCredentials, (req, res) => { // Delete pair
    const { id } = req.body;
    return Pair.findById(id)
        .then(user => user.remove())
        .then(() => res.json('removed'))
        .catch(err => res.status(500).json(err.message))
});

routes.post('/get-symbol-price/:symbol', (req, res) => { // Get price of symbol for Adding sing price element
    ActualPairs.findOne({ symbol: req.params.symbol })
        .then(pair => {
            if(pair) {
                res.json(pair.price)
            } else {
                res.status(404).json('Symbol not found')
            }
        })
});

routes.post('/edit-user-data', validateCredentials, (req, res) => {
    const { id, sign, text } = req.body;
    if(sign === 'username') {
        User.findOne({ username: text })
            .then(user => {
                if(user) {
                    res.status(404).json('Username is already exist');
                } else {
                    validateAndEditUser(id, sign, text, res);
                };
            })
    } else if(sign === 'email') {
        if(!validateEmail(text)) {
            res.status(404).json('E-mail does not valid');
        } else {
            validateAndEditUser(id, sign, text, res);
        };
    } else {
        validateAndEditUser(id, sign, text, res);
    }
});

routes.post('/set-seen-powers', (req, res) => {
    const { userId, powerId } = req.body;

    User.findById(userId)
        .then(user => {
            if(!user) {
                res.status(401).json({ redirect: '/' });
            } else {
                user.percents.forEach(item => {
                    if(item.percentId.toString() === powerId) item.isSeen = true;
                });
                return user.save()
            };
        })
        .then((user) => res.json(`Success updated: ${powerId}`))
        .catch(err => res.status(500).json(err.message))
});

routes.get('/:userId/get-powers', (req, res) => {
    const { userId } = req.params;

    return getPowerPercentsFromUser(userId)
        .then(user => {
            if(user) {
                res.json(user);
            } else {
                res.status(401).json({ redirect: '/' })
            }
        })
        .catch(err => res.status(500).json(err.message))
});

routes.get('/:userId/delete-power/:powerId', (req, res) => {
    const { userId, powerId } = req.params;

    return User.findById(userId)
        .then(user => {
            if(!user) {
                res.status(401).json({ redirect: '/' });
            } else {
                user.percents = user.percents.filter(item => item.percentId.toString() !== powerId);
                return user.save().then(user => res.json(`Success deleted ${powerId} power symbol`))
            };
        })
        .catch(err => res.status(500).json(err.message))
});

export default routes;


function validateAndEditUser(id, sign, text, res) {
    return User.findById(id)
        .then(user => {
            if(!user) {
                res.status(401).json({ redirect: '/' });
            } else {
                if(sign && !text) {
                    res.status(400).json(`${sign} can not be blank`);
                } else if(!sign) {
                    res.status(400).json('Some input data missed');
                } else {
                    user[sign] = text;
                    return user.save().then(user => res.json({ user: userFields(user) }));
                }
            }
        })
};





