const express = require('express');
const db = require('./config/db');
const route = require('./routes');
const bodyParser = require('body-parser');
const passport = require('passport');
const cors = require('cors');
const createError = require('http-errors');

import { Request, Response, NextFunction } from "express";

require('dotenv').config()

db.connect()

const app = express();

app.use(cors());
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(passport.initialize());
app.use(express.json());

route(app);


// wrong api
app.all('*', 
    (res: any, req: { req: { originalUrl: any; }; }, next: (arg0: any) => any) => {
        return next(createError.NotFound(`Can't find ${req?.req?.originalUrl} on this server`));
});

// middleware that handling error
app.use(
    (err: { message: any; statusCode: number; status: string; }, req: any, res: { status: (arg0: any) => { (): any; new(): any; json: { (arg0: { success: boolean; status: any; message: any; }): void; new(): any; }; }; }, next: () => void) => {
    console.log(err.message)
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (!err.message) {
        console.log("next");
        next();
    }
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err?.message,
    });
});

app.listen(4002, () => {
    console.log('Listenning on port 4002');
});


export {};