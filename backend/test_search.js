import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import RAGService from "./services/ragService.js";

const uri = process.env["MONGO_URI"] || process.env["MONGODB_URI"];
await mongoose.connect(uri, { dbName: "gym_website" });
console.log("Connected to MongoDB");

const ragService = new RAGService();
await ragService.initialize();

const query = "What are the membership plans?";
console.log(`\nSearching for: "${query}"`);

const docs = await ragService.searchRelevantDocuments(query, 5);
console.log(`Found ${docs.length} documents:\n`);

docs.forEach((doc, i) => {
  console.log(`${i+1}. ${doc.title}`);
  console.log(`   Category: ${doc.category}`);
  console.log(`   Content: ${doc.content.substring(0, 80)}`);
});

await mongoose.disconnect();
