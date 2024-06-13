import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./dbconfig/dbconnection.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();
const app = express();
dbConnect();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server started");
});

app.use("/api", dataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
