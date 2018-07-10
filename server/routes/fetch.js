import validateFields from '../middlewares/validateRequireFields';

import Request from '../models/request';

const log = require('../common/log')();
const routes = require('express').Router();

routes.post('/request', validateFields, (req, res) => {
    const { email, message } = req.body;

    return new Request({ email, message }).save()
        .then(request => {
            res.json('request was received');
            log.info(`Send request: message: ${request.message}; e-mail: ${request.email}`)
        })
        .catch(err => res.status(400).json({ errors: err.message }));
});

export default routes;