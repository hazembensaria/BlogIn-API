const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const Connection = () => {
    return mongoose.connect(process.env.CONN, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => console.log("Connected Successfully"))
        .catch(err => console.log("Connection Failed", err));
};

module.exports = Connection;