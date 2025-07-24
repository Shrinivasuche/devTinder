const express = require("express");
const requestRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req, res)=>{
    
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        // check for allowed status--> user cannot send random status type
        const allowedStatus = ["interested" , "ignored"];

        if(!allowedStatus.includes(status)){
            return res
                .status(400)
                .json({message: "Invalid status type: " + status});
        }

        // can also check if user is sending request to himself
        // but schema level checking by using middleware is always prioritized

        // check if the to user exists
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(400).json({
                message: "User not found",
            });
        }

        // check if there is existing connection request
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId},
            ]
        });

        if(existingConnectionRequest){
            return res.status(400).json({message: "Connection request already exists"});
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status,
        });
        const data = await connectionRequest.save();

        res.json({
            message: req.user.firstName + " is " +status+ "in " +toUser.firstName,
            data,
        });
    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});

module.exports = requestRouter;