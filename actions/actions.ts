"use server";

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: "GEMINI_API_KEY" });

export async function ai_slop(imagePath: string) {
  const promptPath = path.join(process.cwd(), "PROMPT.txt");
  const systemInstruction = fs.readFileSync(promptPath, "utf-8");

  const image = await ai.files.upload({
    file: imagePath,
  });

  if (!image.uri || !image.mimeType) {
    throw new Error("Failed to upload image: URI or MIME type is missing");
  }
  if (image) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: systemInstruction,
      },
      contents: [
        createUserContent([
          "Convert this image",
          createPartFromUri(image.uri, image.mimeType),
        ]),
      ],
    });
    console.log(response.text);
    return response.text;
  }
}
