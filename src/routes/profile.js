const express = require ("express");
const profileRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require ("../utils/validation");
const bcrypt = require("bcrypt");

// view profile
profileRouter.get("/profile/view", userAuth, async(req, res) =>{
    try {
        // user is checked in auth and is attached to the req
        const user = req.user;

        res.send(user);
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
    
});

// edit profile
profileRouter.patch("/profile/edit" , userAuth , async(req, res) =>{
    try {
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        }
        const loggedInUser = req.user;
        
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        
        await loggedInUser.save();

        res.send({
            message: `${loggedInUser.firstName} your profile updated successfully`,
            data: loggedInUser,
        });

    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});

// edit password
profileRouter.patch("/profile/password", userAuth, async(req, res) =>{
    try {
        const {oldPassword, newPassword} = req.body;
        if(!oldPassword || !newPassword){
            throw new Error("both old password and new password are required");
        }

        // because we are getting user from userAuth
        const user = req.user;

        // validate old password
        const isPasswordValid = await user.validatePassword(oldPassword);
        if(isPasswordValid){
            const passwordHash  = await bcrypt.hash(newPassword , 10);
            user.password = passwordHash;

            await user.save();

            res.send("Password updated successfully");
        }else{
            throw new Error("Invalid password");
        }

    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});

module.exports = profileRouter;