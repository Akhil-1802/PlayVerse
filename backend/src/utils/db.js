const mongoose = require('mongoose');
function dbConnection() {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Database Connected');
    })
    .catch((error) => {
        console.error('Database Connection Failed:', error);
    });
}
module.exports = dbConnection