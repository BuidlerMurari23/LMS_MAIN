import { v2 } from "cloudinary";
import app from "./app.js";
import dbConnect from "./config/dbConnect.js";


v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await dbConnect();
    console.log(`App is running at http://localhost:${PORT}`)
});