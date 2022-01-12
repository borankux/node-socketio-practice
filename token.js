const createToken = (callback) => {
    require('crypto').randomBytes(48, function(err, buffer) {
        let token = buffer.toString('hex');
        callback(token)
    });
}

module.exports = {
    createToken
}

