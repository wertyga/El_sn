import notifyIcon from '../../../icons/crypto_signer_app.png';


export default data => {
    return new Notification(data.title, {
        body: data.body,
        tag: data.tag || '',
        icon: notifyIcon
    });
};