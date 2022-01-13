const createToken = async () => {
    return new Promise((resolve, reject) => {
        require('crypto').randomBytes(16, function (err, buffer) {
            let token = buffer.toString('hex');
            resolve(token)
        });
    })
}

module.exports = {
    createToken
}
