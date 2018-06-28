import amqp from 'amqplib/callback_api';
import nodemailer from "nodemailer";

import emailConfig from "../common/emailConfig";


const log = require('../common/log')(module);

amqp.connect('amqp://localhost', function(err, conn) {
    if(err) {
        console.log(err);
        return;
    };

    console.log('-- RabbitMQ Receiver Connected --');

    conn.createChannel((err, ch) => {
        const ex = 'mail';

        ch.assertExchange(ex, 'fanout', { durable: false });
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, msg => { console.log('Consume!')
                const emailOptions = JSON.parse(msg.content.toString());

                emailSending(emailOptions);
            }, { noAck: true });
        });
    });
});

// Send E-mail
export const emailSending = (data) => {
    const transport = nodemailer.createTransport(emailConfig);
    transport.sendMail(data,(err, body) => {
        if(err) {
            console.error(`Sending email error: ${err}`);
            log.error(err)
            setTimeout(() => emailSending(data), 10000);
        } else {
            console.log(`Email sent!`);
        };
    });
};
