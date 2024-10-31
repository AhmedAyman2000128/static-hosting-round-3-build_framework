import express from 'express';
import cors from "cors";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(3000, ()=>{
    console.log("Server is Running on port", 3000);
});

app.post("/upload", (req: any, res: any) => {
    
    res.json({
        "message": "Waiting for deployment"
    });
});
