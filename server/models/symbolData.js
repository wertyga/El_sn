import mongoose from 'mongoose';

import { lowPercent, interval, growPercent } from "../common/functions/main";

import TradePair from './tradePairs';
import getNeedFields from "../common/functions/compileNeedFields";
import Percent from "./reachedPercent";

const log = require('../common/log')(module);

const SymbolDataSchema = new mongoose.Schema({
    symbol: {
        type: String
    },
    interval: {
        type: String
    },
    open: {
        type: Number
    },
    close: {
        type: Number
    },
    high: {
        type: Number
    },
    low: {
        type: Number
    }
}, { timestamps: true});

SymbolDataSchema.post('save', function(doc) {
    return Promise.all([
        updateForIdRefTradePair(doc),
        savePercents(doc)
    ])
});

export const getSymbolDataFields = (instance) => {
    const needFields = ['symbol', 'interval', 'high', 'close'];
    return getNeedFields(needFields, instance)
};

export default mongoose.model('symbolData', SymbolDataSchema);


// Common function
function updateForIdRefTradePair(doc) { // Save TradePair symbolData ID
    return TradePair.findOne({ symbol: doc.symbol })
        .then(pair => {
            if(!pair) {
                return false;
            } else if(!pair.symbolData) {
                pair.symbolData = doc._id;
                pair.prevPrice = doc.close;
                pair.price = doc.close;
                return pair.save();
            } else {
                pair.prevPrice = pair.price;
                pair.price = doc.close;
                return pair.save();
            };
        })
};

function savePercents(doc) {
    const comparePercent = analyzeData(doc);
    if(!comparePercent) return;
    return Percent.findOne({ symbol: comparePercent.symbol})
        .then(percent => {
            if(percent && (percent.percent !== comparePercent.percent)) {
                Object.keys(comparePercent).forEach(item => { percent[item] = comparePercent[item] });
                percent.prevUpdate = percent.updatedAt;
                return percent.save();
            } else if(!percent) {
                return new Percent(comparePercent).save();
            } else {
                return false;
            };
        })
        .catch(err => {
            console.error('Error in "savePercents" function \n' + err);
            log(err, 'savePercents');
        })

};
function analyzeData(doc) { // Analyze kline data
    const onePercent = Number((doc.high / 100).toFixed(8));
    const different = Math.round((doc.high - doc.close) / onePercent);
    if(different >= lowPercent && doc.open > doc.close) {
        return {
            ...getSymbolDataFields(doc),
            interval: interval || '2h',
            percent: -different
        };
    } else {
        return false;
    };
};




