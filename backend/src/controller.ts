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

const extract = (zipfile: multerFile, siteName: string, cb: (code: number | null) => any): void => {  
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
            cb(code);
        } else {
            cb(code);
        }
    })
}

const deploy = (zipfile: multerFile, siteName: string, buildCommand: string): void => {
    console.log("Start Deploying");

    extract(zipfile, siteName, (code) => {        
        if(code !== 0) {
            return 0;
        }

        console.log("Running Container");
        
        const projectPath = path.join(__dirname, "projects", siteName);
        const runContainer = exec(`docker container run --name ${siteName} -v ${projectPath}:/${siteName} -id node:18-alpine`)
        
        runContainer.stdout?.on("data", (data) => console.log(data));
        runContainer.stderr?.on("data", (data) => console.log(data));

        runContainer.on("close", (code) => {
            console.log("Container run completed for code ", code);

            if (code === 0) {
                const executeContainer = exec(`docker exec ${siteName} sh -c "cd /${siteName} && npm install && ${buildCommand}"`);
                executeContainer.stdout?.on("data", (data) => console.log(data));
                executeContainer.stderr?.on("data", (data) => console.log(data));
                
                executeContainer.on("close", (code) => {
                    console.log("Execution completed for code ", code);
                    console.log(`Finished building project "${siteName}"`);

                    const removeContainer = exec(`docker stop ${siteName} && docker rm ${siteName}`);
                    removeContainer.stdout?.on("data", (data) => console.log(data));
                    removeContainer.stderr?.on("data", (data) => console.log(data));

                    removeContainer.on("close", (removeCode) => {
                        console.log("Container stopped and removed for code ", removeCode);
                        if (removeCode === 0) {
                            console.log("Container cleanup successful");
                        } else {
                            console.error("Failed to clean up the container");
                        }
                    });
                });
            } else {
                console.error("Failed to run the container");
            }
        });
    });
}

export default deploy;
