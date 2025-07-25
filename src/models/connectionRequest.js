const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // reference to the user collection
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["ignored" , "interested" , "accepted", "rejected"],
                message: `{VALUE} is incorrect status type`,
            },
        },
    },
    {
        timestamps: true,
    }
);

// ConnectionRequest.find({fromUserId: akehuhr873r490a2348, toUserId: aikuhr87376hr8f753487})
connectionRequestSchema.index({fromUserId: 1, toUserId: 1});


connectionRequestSchema.pre("save", function(next){
    const connectionRequest = this;
    // check if the fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send request to yourself");
    }
    next();
});


const ConnectionRequestModel = new mongoose.model("ConnectionRequest" , connectionRequestSchema);
module.exports = ConnectionRequestModel;