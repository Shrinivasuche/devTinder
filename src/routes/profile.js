const express = require ("express");
const profileRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require ("../utils/validation");

// profile
profileRouter.get("/profile/view", userAuth, async(req, res) =>{
    try {
        // user is checked in auth and is attached to the req
        const user = req.user;

        res.send(user);
    } catch (error) {
        res.status(400).send("ERROR : " + error.message);
    }
    
});

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
})

module.exports = profileRouter;