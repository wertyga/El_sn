import User, { encryptPassword } from '../models/user';

const routes = require('express').Router();

routes.post('/get-user', (req, res) => {
    if(process.env.EXTERNALS !== req.body.externalToken) {
        res.status(550).json({ errors: { globalError: 'Access denided' }});
    } else {
        const { username, password } = req.body;
        return User.findOne({ $or: [{ username }, { email: username}] })
            .then(user => {
                if(!user) {
                    res.status(404).json({ errors: { globalError: 'Invalid data' } });
                } else {
                    if(user.hashPassword === encryptPassword(password)) {
                        res.json({
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            isCool: user.isCool
                        })
                    } else {
                        res.status(404).json({ errors: { globalError: 'Invalid data' } })
                    }
                }
            })
            .catch(err => res.status(400).json({ errors: { globalError: err } }))
    };
});

export default routes;