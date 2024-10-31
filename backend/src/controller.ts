import { exec } from "child_process";
import { fileURLToPath } from 'url';
import path, { dirname } from "path";
import fs from "fs";

interface multerFile {
    buffer: Buffer, 
    encoding: string, 
    fieldname: string, 
    mimetype: string, 
    originalname: string, 
    size: number,
    destination: string,
    filename: string,
    path: string,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));

const extract = (zipfile: multerFile, siteName: string): void => {  
    console.log("Extracting project")
    
    const zipPath = path.join(__dirname, "uploads", zipfile.filename);
    const outputDir = path.join(__dirname, "projects", siteName);

    // Determine command based on OS
    const unzipCommand = process.platform === "win32"
        ? `7z x "${zipPath}" -o"${outputDir}"`
        : `unzip -o "${zipPath}" -d "${outputDir}"`;

    const unzip = exec(unzipCommand);

    unzip.stdout?.on("data", (data) => console.log(data));
    unzip.stderr?.on("data", (data) => console.log(data));

    unzip.on("close", (code) => {
        console.log("Unzip code:", code);

        if(code === 0){
            fs.unlink(`E:/University/graduation_project/static-hosting-round-3-build_framework/backend/uploads/${zipfile.filename}`, (err) => {
                if (err) {
                    console.error("Error deleting file:", err);
                } else {
                    console.log("Original zip file deleted");
                    console.log("Finished project extraction");
                }
            });
        }
    })
}

export default extract;
