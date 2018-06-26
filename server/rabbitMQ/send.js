import amqp from 'amqplib/callback_api';

import { sendMailEE } from '../common/functions/main';

amqp.connect('amqp://localhost', function(err, conn) {
    if(!err) {
        console.log('-- RabbitMQ connected --');

        sendMailEE.on('send_mail', options => {
            conn.createChannel((err, ch) => {
                const ex = 'mail';
                ch.assertExchange(ex, 'fanout', { durable: false });
                ch.publish(ex, '', new Buffer(JSON.stringify(options)));
            });
        });
    } else {
        console.error(err);
        return;
    };
});