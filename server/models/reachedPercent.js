import mongoose from 'mongoose';

import { remindUser } from '../routes/common/functions';
import getNeedFields from '../common/compileNeedFields';

import User from './user';

const ReachedPercent = new mongoose.Schema({
    symbol: {
        type: String
    },
    interval: {
        type: String
    },
    high: Number,
    close: Number,
    percent: {
        type: Number
    },
    prevUpdate: {
        type: Date,
        default: new Date()
    }
}, { timestamps: true });

ReachedPercent.post('save', doc => {
    User.find({ isCool: true }).then(users => {
        Promise.all(users.map(user => {
            if(user.isCool) {
                const userPercents = user.percents.map(item => item.percentId.toString());
                if(userPercents.indexOf(doc._id.toString()) === -1) { // If symbol is NOT present in user's list
                    if(doc.percent < 0) { console.log('New percent saved!: ', doc._id)
                        remindUser(user.email, doc, false, false);
                    } else {
                        remindUser(user.email, doc, false, true);
                    };
                    user.percents.push({ percentId: doc._id});
                    return user.save();
                } else if( // If symbol is present in user's list and pass through more or equal 2 hours
                    userPercents.indexOf(doc._id.toString()) !== -1 &&
                    (new Date().getHours() - new Date(doc.prevUpdate).getHours() > 2)
                ) { console.log('Percent updated!: ', doc._id)
                    if(doc.percent < 0) {
                        remindUser(user.email, doc, false, false);
                    } else {
                        remindUser(user.email, doc, false, true);
                    };
                    const percentIndex = userPercents.indexOf(doc._id.toString());
                    user.percents[percentIndex].isSeen = false;
                    return user.save();
                }
            } else {
                return false;
            };
        }))
    })
});

export const percentFields = (instance) => {
    const percentNeedFields = ['symbol', 'interval', 'high', 'close', 'percent', 'updatedAt', '_id'];
    return getNeedFields(percentNeedFields, instance)
};

export default mongoose.model('percent', ReachedPercent);