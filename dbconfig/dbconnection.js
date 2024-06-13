import mongoose from "mongoose";

const dbConnect=async()=>{
    try {
        await mongoose.connect(process.env.MONGOURI,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log("COnnected to database");

    } catch (error) {
        console.log("Error connecting to mongodb");
        process.exit(1);
    }
}
export default dbConnect;