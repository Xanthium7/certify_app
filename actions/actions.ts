"use server";

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import fs from "fs";
import path from "path";

// Simple function to generate a unique ID without external dependencies
function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Function to recursively delete a directory
function deleteDirectory(directory: string) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file) => {
      const currentPath = path.join(directory, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        deleteDirectory(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(directory);
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function ai_slop(imagePath: string) {
  // Declare tempDir outside try/catch so it's accessible in both blocks
  const tempDir = path.join(process.cwd(), "temp");
  let tempFilePath = "";

  try {
    const promptPath = path.join(process.cwd(), "PROMPT.txt");
    const systemInstruction = fs.readFileSync(promptPath, "utf-8");

    // Extract base64 data
    const base64Data = imagePath.replace(/^data:image\/\w+;base64,/, "");

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    tempFilePath = path.join(tempDir, `${generateUniqueId()}.png`);

    // Write the file to disk
    fs.writeFileSync(tempFilePath, base64Data, "base64");

    const image = await ai.files.upload({
      file: tempFilePath,
    });

    if (!image.uri || !image.mimeType) {
      throw new Error("Failed to upload image: URI or MIME type is missing");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-exp-03-25",
      config: {
        systemInstruction,
      },
      contents: [
        createUserContent([
          "Convert this image",
          createPartFromUri(image.uri, image.mimeType),
        ]),
      ],
    });

    // Clean up temporary file and directory
    fs.unlinkSync(tempFilePath);
    deleteDirectory(tempDir);

    return response.text;
  } catch (error) {
    console.error("Error processing image:", error);

    // Clean up temp directory even if there's an error
    try {
      deleteDirectory(tempDir);
    } catch (cleanupError) {
      console.error("Error cleaning up temp directory:", cleanupError);
    }

    throw error;
  }
}
