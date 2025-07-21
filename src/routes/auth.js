const express = require ("express");
const authRouter = express.Router();

const User = require("../models/user");
const bcrypt = require('bcrypt');
const {validateSignUpData} = require("../utils/validation")


// signup
authRouter.post("/signup", async (req, res) =>{
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
authRouter.post("/login", async(req, res) => {
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

// logout
authRouter.post("/logout", async(req, res) =>{
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    })
    res.send("logout successful");
});

module.exports = authRouter;