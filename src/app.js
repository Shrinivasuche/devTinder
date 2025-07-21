const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

// check one by one untill a match is found.
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectDB()
    .then(()=>{
        console.log("database connections established...");
        app.listen(3000, ()=>{
            console.log("server is successfully listening on port 3000");
        });
    })
    .catch((err)=>{
        console.log("database cannot be connected.");
    });

