export default err => {
    let errors = err.response ? err.response.data.errors || err.response.data : err.message;
    if(typeof errors === 'string') {
        errors = { globalError: errors };
    };
    return errors;
};
