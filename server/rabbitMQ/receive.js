import amqp from 'amqplib/callback_api';
import { emailSending } from "../common/commonFunctions";


amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel((err, ch) => {
        const ex = 'mail';

        ch.assertExchange(ex, 'fanout', { durable: false });
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, msg => {
                const emailOptions = JSON.parse(msg.content.toString());
                return emailSending(emailOptions)
                    .then(body => {
                        console.log(`Email sent!`)
                    })
                    .catch(err => console.error(`Error in email-sending: ` + err))
            }, { noAck: true });
        });
    });
});