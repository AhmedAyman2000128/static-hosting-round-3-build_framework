const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Azure Blob Service Client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

// Function to create a public container
async function createPublicContainer(containerName) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.create({ access: "blob" });
        console.log(`Container "${containerName}" created successfully with public access level.`);
    } catch (error) {
        if (error.statusCode === 409) {
            console.log(`Container "${containerName}" already exists.`);
        } else {
            console.error(`Error creating container:`, error);
        }
    }
}

// Async function to get content type based on file extension
async function getContentType(filePath) {
    const mime = await import("mime"); // Dynamically import mime package
    return mime.default.getType(filePath) || 'application/octet-stream'; // Default to binary if not found
}

// Function to sanitize file names
function sanitizeFileName(fileName) {
    return fileName.replace(/[^\w.-]/g, "_"); // Replace invalid characters with underscore
}

// Function to upload a file to Azure Blob Storage with specific Content-Type
async function uploadFileToAzure(containerName, filePath, blobName) {
    try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const contentType = await getContentType(filePath); // Get the content type

        // Upload the file to the blob with specified Content-Type
        const uploadBlobResponse = await blockBlobClient.uploadFile(filePath, {
            blobHTTPHeaders: { blobContentType: contentType },
        });
        console.log(`Upload successful for ${blobName}:`, uploadBlobResponse.requestId);
    } catch (error) {
        console.error(`Error uploading ${blobName}:`, error);
    }
}

// Recursive function to upload files and directories
async function uploadFilesFromDirectory(containerName, directoryPath, basePath) {
    const items = fs.readdirSync(directoryPath);

    for (const item of items) {
        const itemPath = path.join(directoryPath, item);
        const relativePath = path.relative(basePath, itemPath); // Keep the relative path
        const blobName = sanitizeFileName(relativePath); // Sanitize only the file name

        if (fs.statSync(itemPath).isDirectory()) {
            // If item is a directory, call the function recursively
            await uploadFilesFromDirectory(containerName, itemPath, basePath);
        } else {
            // If item is a file, upload it with the correct relative path excluding "dist"
            const blobNameWithoutDist = relativePath.replace(/^dist\//, ''); // Remove "dist/" from the start
            await uploadFileToAzure(containerName, itemPath, blobNameWithoutDist);
        }
    }
}

// Main function to run the upload process
async function main() {
    const containerName = "eeee"; // Change this to your desired container name
    const directoryPath = "/home/fady/Downloads/ahmed_frontend/dist"; // Path to your dist directory

    await createPublicContainer(containerName);
    await uploadFilesFromDirectory(containerName, directoryPath, directoryPath);
}

// Start the upload process
main();
