import mongoose from "mongoose" ;

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database COnnected") ;
    }catch(error){
        console.log(`Database Error : ${error}`);
    }
};

export default connectDB;