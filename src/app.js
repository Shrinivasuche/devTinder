const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation")
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth");


app.use(express.json());
app.use(cookieParser());

// signup
app.post("/signup", async (req, res) =>{
    try{
        // validation of data
        validateSignUpData(req);
        const {firstName, lastName, emailId, password} = req.body;

        // encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);
    
        // creating a new instance of the User model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        });

        console.log(user);
        await user.save();
        res.send("user data saved successfully");
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);    
    }
});

// login
app.post("/login", async(req, res) => {
    try {
        const {emailId, password} = req.body;

        // had to use findOne because there can be a error of accessing the array.
        const user = await User.findOne({ emailId: emailId });
        if(!user){
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){

            // create a JWT token
            const token = await user.getJWT();

            // add the token to cookie and send the response to the user.
            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send("login successful");
        }
        else{
            throw new Error("Invalid credentials");
        }
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
});

// profile
app.get("/profile", userAuth, async(req, res) =>{
    try {
        // user is checked in auth and is attached to the req
        const user = req.user;

        res.send(user);
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
    
});

app.post("/sendConnectionRequest", userAuth, async(req, res)=>{
    const user = req.user;

    // sending connection request
    console.log("sending a connection request");

    res.send(user.firstName + " sent the connection request");
});


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

