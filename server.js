const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); 
require('dotenv').config();
const authController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');

const app =express();

app.enable('trust proxy');

app.use(cors({
    origin:'http://localhost:3000',
    credentials:true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(authController.blacklist('clearance'));

const port = process.env.PORT || 5000;
const DB = process.env.DATABASE;

app.use('/api/v1/auth',authRoutes);

mongoose.connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>console.log('connected to the database!!!!!!!!'));

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})