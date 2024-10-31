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

app.post("/upload", upload.single('zipfile'), async (req: any, res: any) => {
    try {
        await deploy(req.file, req.body.siteName, req.body.buildCommand);

    } catch (error) {
        console.error("Deployment error:", error);
        res.status(500).json({
            "success": false,
            "message": "Deployment failed"
        });
    }
    
    const containerUrl = `https://google.com`;
    res.json({
        "success": true,
        "containerURL": containerUrl
    });
});
