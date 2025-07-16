const express = require("express");
require("./config/database");
const app = express();

app.use("/", (req, res) =>{
    res.send("hello from the server");
})

app.listen(3000, ()=>{
    console.log("server is successfully listening on port 3000");
});