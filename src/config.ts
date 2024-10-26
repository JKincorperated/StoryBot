import dotenv from "dotenv";
import fs from 'node:fs';


dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
  throw new Error("Missing environment variables");
}

let file_handle = fs.readFileSync("words.txt", "utf-8");
let words = file_handle.split("\n");

const WORDS: Map<string, string> = new Map(Object.entries(words).map((word: any) => {
  return [word[1].toLowerCase(), word[1]]
}));

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  WORDS
};
