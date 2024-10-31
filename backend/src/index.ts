import express from 'express';
import cors from "cors";
import multer from "multer";
import deploy from './controller.js';

const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        if (file.originalname.includes(" ")) {
            console.log("File cannot contain spaces");
            return cb(new Error("File cannot contain spaces"), "error");
        }
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(3000, ()=>{
    console.log("Server is Running on port", 3000);
});

app.post("/upload", upload.single('zipfile'), (req: any, res: any) => {
    deploy(req.file, req.body.siteName, req.body.buildCommand);
    
    res.json({
        "message": "Waiting for deployment"
    });
});
