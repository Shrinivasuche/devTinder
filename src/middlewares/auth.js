const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async(req, res, next) =>{
    try {
        // Read the token from the req cookies
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token is not valid");
        }

        // Validate the token
        const decodedObj = await jwt.verify(token, "Dev@Tinder$101");

        // Find the user
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user){
            throw new Error("user not found");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400).send("ERROR:" + error.message);
    }
    
};

module.exports = {
    userAuth,
}