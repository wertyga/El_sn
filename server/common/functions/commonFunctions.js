import User from '../../models/user';
import { percentFields } from "../../models/reachedPercent";

// E-mail
import emailConfig from '../emailConfig';
import nodemailer from 'nodemailer';

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
                        log(err)
                        setTimeout(() => emailSending(data), 10000);
                    } else {
                        resolve(body);
                    }
                });
            });
        })
};
