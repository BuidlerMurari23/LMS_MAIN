import mongoose from "mongoose";


// mongoose.set("strictQuery", false); sets mongoose's query stricknes to false 
// which means it will not throw an error if we try to qurey for the non- existing field.
// instead simply returns an empty results

mongoose.set("strictQuery", false);

const dbConnect = async () => {
    try {
        const { connection } = await mongoose.connect(
            process.env.MONGODB_URL || `mongodb://127.0.0.1:27017/lms`
        );
    
        if(connection){
            console.log(`Server connected to DB: ${connection.host}`)
        }
        
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
}

export default dbConnect;





