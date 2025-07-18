const mongoose = require("mongoose");

const connectDB = async () =>{
    await mongoose.connect(
        "mongodb+srv://shrinivasuche:namastenode101@namastenode.8zlu5ei.mongodb.net/?retryWrites=true&w=majority&appName=NamasteNode/devTinder"
    );


    //  mongodb+srv://shrinivasuche:<db_password>@namastenode.8zlu5ei.mongodb.net/?retryWrites=true&w=majority&appName=NamasteNode
    // password -> namastenode101
};

module.exports = connectDB;
