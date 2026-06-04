import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import KnowledgeBase from "./models/KnowledgeBase.js";

const uri = process.env["MONGO_URI"] || process.env["MONGODB_URI"];
await mongoose.connect(uri, { dbName: "gym_website" });
console.log("Connected to MongoDB");

const count = await KnowledgeBase.countDocuments();
console.log("Total documents in KnowledgeBase:", count);

const sampleDocs = await KnowledgeBase.find().limit(2);
console.log("\nSample documents:");
sampleDocs.forEach(doc => {
  console.log(`Title: ${doc.title}`);
  console.log(`Content preview: ${doc.content.substring(0, 100)}`);
  console.log(`Category: ${doc.category}`);
  console.log(`Tags: ${doc.tags}`);
  console.log("---");
});

const membership = await KnowledgeBase.find({ category: "membership" }).limit(1);
console.log("\nMembership doc:", membership[0]?.title);

await mongoose.disconnect();
