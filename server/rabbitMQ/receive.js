import amqp from 'amqplib/callback_api';
import { emailSending } from "../common/functions/commonFunctions";
import '../common/mongoose';


const log = require('../common/log')(module);

amqp.connect('amqp://localhost', function(err, conn) {
    if(err) {
        console.log(err);
        return;
    };

    conn.createChannel((err, ch) => {
        const ex = 'mail';

        ch.assertExchange(ex, 'fanout', { durable: false });
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, msg => { console.log('Consume!')
                const emailOptions = JSON.parse(msg.content.toString());
                emailSending(emailOptions)
                    .then(body => {
                        console.log(`Email sent!`)
                    })
                    .catch(err => {
                        console.error(`Error in email-sending(RMQ): ` + err);
                        log(error, 'email-sending(RMQ)');
                    })
            }, { noAck: true });
        });
    });
});
