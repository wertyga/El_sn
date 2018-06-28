import User from '../../models/user';
import { percentFields } from "../../models/reachedPercent";

// E-mail
import emailConfig from '../emailConfig';
import nodemailer from 'nodemailer';
import {sendMailEE} from "./main";
import collectPairs from "./collectPairs";
import config from "../config";

const log = require('../log')(module);

export const getPowerPercentsFromUser = (userId) => { // Power percents with 2% grow in 10s and 10% down while 2h
    return User.findById(userId).populate('percents.percentId')
        .then(user => {
            if(user) {
                return user.percents.map(item => {
                    return {
                        ...percentFields(item.percentId),
                        isSeen: item.isSeen
                    }
                })
            } else {
                return user;
            }
        })
};

export function remindUser(user, pair, sign, up) { // Remind user that sign price is reached
    let html;
    const denidedBlock = `<div style="width: 100%; font-size: 10px; center; cursor: pointer;">
                            <a href="${config.siteHost}/unsubscribing/${user.id}/${user.emailCancelToken}"><p>Unsibscribe email sending</p></a>  
                          </div>`
    if(sign) {
        html = `<div>
                <h3>${collectPairs(pair.titleId)[0].name}</h3>
                 <p>Has reached ${pair.signPrice.toFixed(8)}</p>
                  <br>
                  <p>Time: ${new Date()}</p>
                  <br/>
                  ${denidedBlock}
                </div>`;
    } else if(!sign && !up){
        html = `<div>
                <h3>${collectPairs(pair)[0].name}</h3>
                 <p>Down for ${pair.percent}% from ${pair.high.toFixed(8)} to ${pair.close.toFixed(8)}</p>
                  <br>
                  <p>Time: ${new Date()}</p>
                  <br/>
                  ${denidedBlock}
                </div>`;
    } else {
        html = `<div>
                <h3>${collectPairs(pair)[0].name}</h3>
                 <p>Growing for ${pair.percent}%</p>
                  <br>
                  <p>Time: ${new Date()}</p>
                  <br/>
                  ${denidedBlock}
                </div>`;
    }

    const mailOptions = {
        from: '"Crypto_signer" <cryptosignefication@gmail.com>',
        to: user.email,
        subject: 'Message from "Crypto_Signer"',
        html
    };

    return User.findOne({ email: user.email})
        .then(user => {
            if(user) {
                sendMailEE.emit('send_mail', mailOptions); // Sending body Email to common Email func then to rabbitMq worker
            };
        })

};

// Send E-mail
export const emailSending = (data) => {
    return User.findOne({ email: data.to })
        .then(user => {
            if(!user) return false;
            return new Promise((resolve, reject) => {
                // resolve(true);
                const transport = nodemailer.createTransport(emailConfig);
                transport.sendMail(data,(err, body) => {
                    if(err) {
                        console.error(`Sending email error: ${err}`);
                        log.error(err)
                        setTimeout(() => emailSending(data), 10000);
                    } else {
                        resolve(body);
                    }
                });
            });
        })
};
