require('dotenv').config();
const app = require('./src/app');
const dbConnection = require('./src/utils/db')

dbConnection();
app.listen(3000 , ()=>{
    console.log("Server is listening at port 3000");
})