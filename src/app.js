const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user")
app.use(express.json());


// signup
app.post("/signup", async (req, res) =>{
    // creating a new instance of the User model
    const user = new User(req.body);
    
    try {
        console.log(user);
        await user.save();
        res.send("user data saved successfully");
    } catch (error) {
        res.status(400).send("error in saving user:" + error.message);    
    }
});

// get user by email
app.get("/user", async(req, res)=>{
    const userEmail = req.body.emailId;

    try {
        // console.log(userEmail);
        const user = await User.findOne({ emailId: userEmail});
        console.log(user);
        res.send(user);

    } catch (error) {
        res.status(400).send("something went wrong");
    }
});

// get all users / feed
app.get("/feed", async (req, res)=>{
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(400).send("something went wrong");
    }
});

// delete user
app.delete("/user", async(req, res)=> {
    const userId = req.body.userId;
    try {
        await User.findByIdAndDelete(userId);
        res.send("user deleted successfully");
    } catch (error) {
        res.status(400).send("something went wrong");
    }
});

// update user details
app.patch("/user", async(req, res)=>{
    const userId = req.body.userId;
    const data = req.body;

    try {
        const ALLOWED_UPDATES = ["userId", "photoUrl", "age", "gender", "about", "skills"];

        const isUpdateAllowed = Object.keys(data).every((k)=> ALLOWED_UPDATES.includes(k));

        if(!isUpdateAllowed){
            throw new Error("update not allowed");
        }
        if(data?.skills.length > 10){
            throw new Error("skills cannot be more than 10");
        }
        const user = await User.findByIdAndUpdate({_id: userId}, data, {
            returnDocument: "after",
            runValidators: true,
        });
        console.log(user);
        res.send("user updated successfully");
    } catch (error) {
        res.status(400).send("update failed:" + error.message);
    }
})


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

