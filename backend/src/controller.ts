import { exec } from "child_process";
import { fileURLToPath } from 'url';
import path, { dirname } from "path";
import fs from "fs";
import util from "util";

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
const execPromise = util.promisify(exec);

const isViteProject = (projectDir: string): Boolean => {


    return true;
}

const extract = async (zipfile: multerFile, projectName: string): Promise<void> => {  
    console.log("Extracting project")
    
    const zipPath = path.join(__dirname, "uploads", zipfile.filename);
    const outputDir = path.join(__dirname, "projects", projectName);

    // Determine command based on OS
    const unzipCommand = process.platform === "win32"
        ? `7z x "${zipPath}" -o"${outputDir}"`
        : `unzip -o "${zipPath}" -d "${outputDir}"`;

    try {
        const { stdout, stderr } = await execPromise(unzipCommand);
        console.log("Unzip output:\n", stdout);
        if (stderr) console.log(stderr);

        await fs.promises.unlink(zipPath);
        console.log("Original zip file deleted");
    } catch (error) {
        console.error("Extraction error:", error);
        throw new Error("Extraction failed");
    }
}

const deploy = async (zipfile: multerFile, projectName: string, buildCommand: string): Promise<void> => {
    console.log("Start Deploying");

    try {
        await extract(zipfile, projectName);
        console.log("Project extraction completed");
        
        console.log("Running Container");
        const projectPath = path.join(__dirname, "projects", projectName);
        const { stdout, stderr} = await execPromise(
            `docker run --rm --name ${projectName} -v ${projectPath}:/${projectName} node:18-alpine ` +
            `sh -c "cd /${projectName} && npm install && ${buildCommand}"`
        );
        console.log("Docker run stdout:\n", stdout);
        if (stderr) console.error("Docker run stderr:", stderr);
        console.log("Finished running Container and dbuilding project");
        console.log("Container stopped and removed, deployment completed");

    } catch (error) {
        console.error("Deployment error:", error);
        throw new Error("Deployment failed");
    }
}

export default deploy;
