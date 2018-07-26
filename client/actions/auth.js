import axios from 'axios';

import * as consts from './constants';

import { setPairs, setTradePairs } from './api';
import { setPercent } from './socket';

export const remindPass = username => dispatch => {
    return axios.post(host('/auth/remind-pass'), { username })
};
export const changePass = dataObj => dispatch => {
    return axios.post(host('/auth/change-pass'), dataObj)
};

export const userAuth = (data) => dispatch => { // User authentication
    return axios.post(host(data.url), data)
        .then(res => {
            dispatch(setUser(res.data.user));
            dispatch(setPairs(res.data.pairs));
            dispatch(setTradePairs(res.data.tradePairs));
            dispatch(setPercent(res.data.powerPercents));

            localStorage.setItem('token', res.data.token);

            return res.data.user._id
        })
};
export function getUserData(id) { // Get user data when reload/enter "/api/user/:id"
    return dispatch => {
        return axios.post(host(`/user/${id}`), { token: getToken() })
            .then(res => {
                dispatch(setUser(res.data.user));
                dispatch(setPairs(res.data.pairs));
                dispatch(setTradePairs(res.data.tradePairs));
                return true;
            })
    };
};
export function setUser(user) { //Set user data to user-reducer
    return {
        type: consts.SET_NEW_USER,
        user
    }
};

export const clearUser = () => dispatch => { // Logout user
    return axios.post(host('/auth/logout'), { token: getToken() })
        .then(() => {
            dispatch(clearUserAction());
            return localStorage.removeItem('token');
        })
};
function clearUserAction() {
    return {
        type: consts.CLEAR_USER
    }
};