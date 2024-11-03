import { BlobServiceClient } from "@azure/storage-blob";
import { Docker } from 'node-docker-api';
import { EventEmitter } from 'events';
import { exec } from "child_process";
import { fileURLToPath } from 'url';
import path, { dirname } from "path";
import fs from "fs";
import util from "util";
import { config } from 'dotenv';

config();

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
const socketPath = process.platform === "win32"
    ? "//./pipe/docker_engine"
    : "/var/run/docker.sock";
const docker = new Docker({ "socketPath": socketPath });
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING || "Default"
);

const isViteProject = async (projectPath: string): Promise<Boolean> => {
    const fileList = await fs.promises.readdir(projectPath);
    return fileList.some((file) => file.includes('vite.config'));
}

const setProjectBuildBase = async (projectPath: string, buildCommand: string): Promise<string> => {
    if (await isViteProject(projectPath)) return buildCommand + " -- --base=./";

    await fs.promises.appendFile(path.join(projectPath, ".env"), "\nPUBLIC_URL=./");
    return buildCommand;
}

const setProjectBuildDir = async (projectPath: string): Promise<string> => {
    if (await isViteProject(projectPath)) return "dist";
    return "build";
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

const promisifyStream = (stream: EventEmitter) => new Promise((resolve, reject) => {
    stream.on("data", (data) => console.log(data.toString()))
    stream.on("end", resolve)
    stream.on("error", reject)
});

const createBuildDockerContainer = async (
    projectName: string,
    projectPath: string,
    buildCommand: string
): Promise<void> => {
    await docker.image.create(
        {},
        { fromImage: 'node:18-alpine' }
    ).then((stream) => {
        return new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err: any, res: any) => (err ? reject(err) : resolve(res)));
        });
    });

    const container = await docker.container.create({
        Image: 'node:18-alpine',
        name: projectName,
        Cmd: ['sh', '-c', `cd /app/${projectName} && npm install && ${buildCommand}`],
        HostConfig: {
            Binds: [`${projectPath}:/app/${projectName}`],
            AutoRemove: true
        }
    });

    await container.start();

    const stream = (await container.logs({
        follow: true,
        stdout: true,
        stderr: true
    })) as EventEmitter;

    console.log("Docker run stdout: \n");
    await promisifyStream(stream);

    await container.wait();
}

// Function to create a public container
const createPublicContainer = async (containerName: string) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.create({ access: "blob" });
        console.log(
            `Container "${containerName}" created successfully with public access level.`
        );
    } catch (error: any) {
        console.error(error);
        if (error.statusCode === 409) {
            console.log(`Container "${containerName}" already exists.`);
        } else {
            console.error(`Error creating container:`, error);
        }
    }
}

// Async function to get content type based on file extension
const getContentType = async (filePath: string) => {
    const mime = await import("mime"); // Dynamically import mime package
    return mime.default.getType(filePath) || "application/octet-stream"; // Default to binary if not found
}

// Function to upload a file to Azure Blob Storage with specific Content-Type
const uploadFileToAzure = async (containerName: string, filePath: string, blobName: string) => {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const contentType = await getContentType(filePath); // Get the content type

        // Upload the file to the blob with specified Content-Type
        const uploadBlobResponse = await blockBlobClient.uploadFile(filePath, { blobHTTPHeaders: { blobContentType: contentType }, });
        console.log(`Upload successful for ${blobName}:`, uploadBlobResponse.requestId);
    } catch (error) {
        console.error(`Error uploading ${blobName}:`, error);
    }
}

// Recursive function to upload files and directories
const uploadFilesFromDirectory = async (containerName: string, directoryPath: string, basePath: string) => {
    const items = fs.readdirSync(directoryPath);

    for (const item of items) {
        const itemPath = path.join(directoryPath, item);
        const relativePath = path.relative(basePath, itemPath); // Keep the relative path

        if (fs.statSync(itemPath).isDirectory()) {
            // If item is a directory, call the function recursively
            await uploadFilesFromDirectory(containerName, itemPath, basePath);
        } else {
            // If item is a file, upload it with the correct relative path excluding "dist"
            const blobNameWithoutDist = relativePath.replace(/^dist\//, ""); // Remove "dist/" from the start
            await uploadFileToAzure(containerName, itemPath, blobNameWithoutDist);
        }
    }
}

const deploy = async (zipfile: multerFile, projectName: string, buildCommand: string): Promise<void> => {
    console.log("Start Deploying");

    try {
        await extract(zipfile, projectName);
        console.log("Project extraction completed");

        const projectPath = path.join(__dirname, "projects", projectName);
        const projectHostPath = path.join(process.env.HOST_PROJECTS_DIR || path.join(__dirname, "projects"), projectName);
        buildCommand = await setProjectBuildBase(projectPath, buildCommand);

        console.log("Running Container");
        await createBuildDockerContainer(projectName, projectHostPath, buildCommand);
        console.log("Finished running Container and dbuilding project");
        console.log("Container stopped and removed");

        console.log("Pushing deployment to Azure cloud");
        const builtProjectPath = path.join(projectPath, await setProjectBuildDir(projectPath));
        await createPublicContainer(projectName);
        await uploadFilesFromDirectory(projectName, builtProjectPath, builtProjectPath);
        console.log("Upload to Azure cloud finished");

        await fs.promises.rm(projectPath, { recursive: true });
        console.log("Deployment completed\nEnjoy your new website");
    } catch (error) {
        console.error("Deployment error:\n", error);
        throw new Error("Deployment failed");
    }
}

export default deploy;
