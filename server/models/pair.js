import mongoose from 'mongoose';

import User from './user';

import fetchFields from '../common/compileNeedFields';
import { tradePairFields } from './tradePairs';
import {remindUser} from "../routes/common/functions";

const pairSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    titleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'actualPair'
    },
    signPrice: Number,
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    },
    sign: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

pairSchema.post('save', function(doc) {
    return User.findById(doc.owner)
        .then(user => {
            if(doc.sign) {
                remindUser(user.email, doc, { sign: true });
            } else {
                user.tradePairs = [...user.tradePairs, doc];
                return user.save();
            };
        })
        .catch(err => console.error(`Error in pair 'post' trigger: ${err.message}`))
});
pairSchema.post('remove', function(doc) {
    return User.findById(doc.owner)
        .then(user => {
            user.tradePairs.splice(user.tradePairs.indexOf(doc._id), 1);
            return user.save();
        })
});

pairSchema.static('populateByTitle', function(ids) {
    let isArray = true;
    if(!(ids instanceof Array)) {
        ids = [ids];
        isArray = false;
    };
    return Promise.all(ids.map(id => {
        return this.findById(id).populate('titleId')
            .then(pair => {
                if(!pair) {
                    return false;
                };
                return {
                    ...tradePairFields(pair.titleId),
                    ...pairFields(pair)
                };
            })
    }))
        .then(pairs => {
            if(isArray) {
                return pairs;
            } else {
                return pairs[0];
            }
        })
});

const PairModel = mongoose.model('pair', pairSchema);



export const pairFields = (instance) => {
    const pairNeedFields = ['_id', 'signPrice', 'sign', 'updatedAt'];
    return fetchFields(pairNeedFields, instance);
};

export default PairModel;