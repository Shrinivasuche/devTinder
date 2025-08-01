const express = require ("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();


const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get all the pending connection requests for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async(req, res) =>{
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);
        // only firstName and lastName. 

        res.json({message: "fetched the connection requests: " , data: connectionRequests});
    } catch (error) {
        res.status(400).send("ERROR :" + error.message);
    }
});

userRouter.get("/user/connections", userAuth, async(req, res) =>{
    try {
        const loggedInUser = req.user;

        // search for the accepted connections where the loggedInUser is either fromUserId or toUserId
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"},
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({message: "your connections: ", data: data});

    } catch (error) {
        res.status(400).send("ERROR: " + error.message);
    }
});


userRouter.get("/feed", userAuth, async(req,  res) =>{
    try {
        // User should see all the user cards except:
        // 0. his own card
        // 1. his connections
        // 2. ignored people
        // 3. already sent the connection request

        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        // Find all the connection requests (Sent + Received)
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) =>{
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) }},
                { _id: { $ne: loggedInUser._id }},
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.send(users);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})


module.exports = userRouter;