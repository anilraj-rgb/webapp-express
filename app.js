const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const cors = require('cors');

//middlewares
const notFound = require('./middlewares/notFound');
const handleErrors = require('./middlewares/handleErrors');


//routers
const movieRouter = require('./router/movies');

app.use(cors({
    origin: process.env.FE_APP
}));

app.use(express.static('public'));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to my WebApplication');
})

app.use('/movies', movieRouter);

//use 500
app.use(handleErrors);
//use 404
app.use(notFound);


app.listen(port, () => {
    console.log(`WebApp listening at port ${port}`);
})