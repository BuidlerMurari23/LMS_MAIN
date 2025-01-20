import cookieParser from "cookie-parser";
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import morgan from "morgan";

// importing all the routes
import userRouters from "./routes/userRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import miscellaneousRoutes from "./routes/miscellaneousRoutes.js";


import errorMiddleware from "./middlewares/errorMiddleware.js";


config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(morgan("dev"));
app.use(cookieParser());

// Server status Check route
app.use('/ping', (req,res) => {
    res.status(200).send("Pong")
});

app.use("/api/v1/user", userRouters);
app.use("api/v1/courses", courseRoutes);
app.use("api/v1/payments", paymentRoutes);
app.use("api/v1", miscellaneousRoutes);

app.use('*', (req,res) => {
    res.status(400).send("OPPS! Page not found..")
});

app.use(errorMiddleware);


export default app;

