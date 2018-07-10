const log = require('../log')(module);

import ActualPairs  from '../../models/tradePairs';
import Pair from '../../models/pair';
import Whale  from '../../models/whale';
import SymbolData from '../../models/symbolData';

import Api, { BinanceSocketApi } from '../api/binanceAPI';

export const api = new Api();

export const lowPercent = 8;
export const growPercent = 2;
export const interval = '2h';

export function getTradePairs() { //Fetch available trade pairs
    return ActualPairs.find({}, 'symbol baseAsset quoteAsset')
};

export function checkPairsForSignPrice() { // Check all pairs for compare to sign price
    return Pair.find({}).populate('titleId')
        .then(pairs => {
            if(pairs.length < 1) return;
            return Promise.all(pairs.map(pair => {
                if(
                    (!pair.sign) &&
                    ((pair.titleId.price <= pair.signPrice && pair.titleId.prevPrice >= pair.signPrice) ||
                    (pair.titleId.price >= pair.signPrice && pair.titleId.prevPrice <= pair.signPrice))
                ) {
                    pair.sign = true;
                    pair.updatedAt = new Date();
                    return pair.save()
                } else {
                    return false;
                };
            }))
        })
        .catch(err => {
            console.error('Error in "checkPairsForSignPrice" function \n' + err);
            log.error(err, 'checkPairsForSignPrice');
        })
};

function getWhalesOrders() { // Get whales orders
    ActualPairs.find({})
        .then(pairs => {
            return Promise.all(pairs.filter(item => item.symbol !== 'BTCUSDT').map(pair => {
                return api.getOrdersBook(pair.symbol)
                    .then(data => {
                        return {
                            bids: data.bids.map(item => {
                                return {
                                    symbol: pair.symbol,
                                    data: {
                                        price: item[0],
                                        amount: item[1],
                                        totalBtc: Math.round(Number(item[0]) * Number(item[1]))
                                    }
                                }
                            }),
                            asks: data.asks.map(item => {
                                return {
                                    symbol: pair.symbol,
                                    data: {
                                        price: item[0],
                                        amount: item[1],
                                        totalBtc: Math.round(Number(item[0]) * Number(item[1]))
                                    }
                                }
                            })
                        }
                    })}))
        })
        .then(data => {
                // [ { bids: [{ symbol: 'symbol', data: [Obj] }], asks: [{ symbol: 'symbol', data: [Obj] }] } ]
            let bids = data.map(item => {
                        return item.bids.reduce((initObj, innerArr) => {
                            initObj.symbol = innerArr.symbol;
                            initObj.orders = initObj.orders  ? [...initObj.orders, innerArr.data] : [innerArr.data];
                            initObj.type = 'bids';

                            return initObj;
                        }, {});
                    })
                .filter(item => item.orders.length > 0)
                .map(item => {
                    return {
                        ...item,
                        orders: item.orders.filter(order => order.totalBtc > 0)
                    }
                });
            let asks = data.map(item => {
                return item.asks.reduce((initObj, innerArr) => {
                    initObj.symbol = innerArr.symbol;
                    initObj.orders = initObj.orders ? [...initObj.orders, innerArr.data] : [innerArr.data];
                    initObj.type = 'asks';

                    return initObj;
                }, {});
            })
                .filter(item => item.orders.length > 0)
                .map(item => {
                    return {
                        ...item,
                        orders: item.orders.filter(order => order.totalBtc > 0)
                    }
                });
            return [...bids, ...asks];

        })
        .then(data => {
            return Whale.deleteMany({}).then(() => data);
        })
        .then(data => {
            return Promise.all(data.map(item => {
                return new Whale(item).save();
            }))
        })
        .catch(err => {
            console.error('Error in "getWhaleOrders" function \n' + err);
            log.error(err, 'getWhaleOrders');
        })
};


// Socket API
function getExchangeInfo() { // Get full exchage info
    const restApi = new Api();
    return restApi.exchangeInfo()
        .then(data => {
            const btcSymbols = data.symbols.filter(item => item.quoteAsset === 'BTC');
            return Promise.all(btcSymbols.map(item => {
                return ActualPairs.findOne({ symbol: item.symbol})
                    .then(pair => {
                        if(!pair) {
                            return new ActualPairs({
                                symbol: item.symbol,
                                baseAsset: item.baseAsset,
                                quoteAsset: item.quoteAsset
                            }).save();
                        } else {
                            return false;
                        };
                    })
            }))
        })
        .then(data => console.log('Exchange info saved! '))
        .catch(err => {
            console.error(`Error in "getExchangeInfo": ${err}`);
            log.error(err)
        })
};

let time = new Date();
// Socket data
function getKlineDataIO(interval) {
    const ws = new BinanceSocketApi();
    return ActualPairs.find({})
        .then(pairs => {
            if(pairs.length < 1) return;
            return Promise.all(pairs.map(item => {
                let symbolWs = ws.getKlineData(item.symbol, interval);
                symbolWs.onmessage = msg => {
                    const data = JSON.parse(msg);

                    return SymbolData.findOne({ symbol: data.s })
                        .then(symbolPair => {
                            if(!symbolPair) {
                                return new SymbolData({
                                    symbol: data.s,
                                    interval: data.k.i,
                                    open: Number(data.k.o),
                                    close: Number(data.k.c),
                                    high: Number(data.k.h),
                                    low: Number(data.k.l)
                                }).save();
                            } else {
                                symbolPair.symbol = data.s;
                                symbolPair.interval = data.k.i;
                                symbolPair.open = Number(data.k.o);
                                symbolPair.close = Number(data.k.c);
                                symbolPair.high = Number(data.k.h);
                                symbolPair.low = Number(data.k.l);

                                return symbolPair.save();
                            };
                        })
                };
                symbolWs.onerror = err => {
                    console.error(`Error in SocketAPI: ${err}`);
                    log.error(err, 'SocketAPI')
                };
            }))
        })
        .catch(err => console.log(`Error in "getKlineDataIO": ${err}`))
};

// Intervals
setInterval(() => {
    checkPairsForSignPrice();
}, 10000);
setInterval(() => {
    return getWhalesOrders();
}, 60000);
setInterval(() => {
    return getExchangeInfo();
}, 60000 * 60);

getExchangeInfo().then(() => Promise.all([getKlineDataIO(interval), checkPairsForSignPrice()]));




