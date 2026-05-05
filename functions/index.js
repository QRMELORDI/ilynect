const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { google } = require("googleapis");
const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();

// 🚀 Step 3: Use ADC (Keyless Auth) in Cloud Functions
// Refactored to onCall for easier use from the app while keeping Firestore metadata tracking
exports.uploadToDrive = functions.https.onCall(async (data, context) => {
  // 🔐 Check authentication (optional but recommended)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError("unauthenticated", "User must be logged in to upload.");
  // }

  try {
    // 🔐 Step 1: Auth (ADC - automatic when deployed to Firebase/GCP)
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/drive"]
    });
    const drive = google.drive({ version: "v3", auth });

    // 📂 Step 2: Upload file
    const rootFolderId = "1vi2Sr6a4JfL1rM8lj2grMd0alo2Lnabx";
    const category = data.category || "reels";
    const subFolderId = await getOrCreateFolder(drive, category, rootFolderId);
    
    const fileMetadata = {
      name: data.fileName,
      parents: [subFolderId]
    };

    const media = {
      mimeType: data.mimeType,
      body: Buffer.from(data.fileBase64, 'base64')
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id"
    });

    const fileId = driveResponse.data.id;

    // 🔓 Step 3: Make file public (anyone with link can view)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    });

    // 🔗 Step 4: Generate links
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // 🧾 Step 5: Save Metadata in Firestore (Keeping your existing logic)
    const db = admin.firestore();
    const category = data.category || "reels";
    const sub_type = data.sub_type || "movie";
    const collectionName = sub_type === 'photo' ? 'photos' : 'videos';

    const videoData = {
      title: data.title || data.fileName,
      category: category,
      sub_type: sub_type,
      userId: data.userId || 'anonymous',
      userName: data.userName || 'Anonymous',
      filename: data.fileName,
      fileId: fileId,
      previewUrl: previewUrl,
      downloadUrl: downloadUrl,
      views: 0,
      downloads: 0,
      likes: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(collectionName).add(videoData);

    return {
      success: true,
      fileId,
      previewUrl,
      downloadUrl,
      firestoreData: videoData
    };
  } catch (error) {
    console.error("Error in uploadToDrive:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});


// Helper to auto-create folders in Drive
async function getOrCreateFolder(drive, name, parentId) {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`;
  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
  });
  if (res.data.files.length > 0) return res.data.files[0].id;
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId]
    },
    fields: "id",
  });
  return folder.data.id;
}

// Scheduled Function for "Today's Speciality"
exports.dailySpeciality = functions.pubsub
  .schedule("0 6 * * *")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const today = new Date().toISOString().split("T")[0];
    const db = admin.firestore();
    
    // Fallback static data - this can be enhanced with an external API later
    const speciality = {
      date: today,
      type: "education",
      title: "Today's Speciality",
      fact: "The James Webb Space Telescope can see back in time to when the universe was just 100 million years old!",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const healthTip = {
      date: today,
      type: "health",
      title: "Daily Health Tip",
      fact: "Drinking warm water with lemon in the morning boosts your immune system and aids digestion.",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("daily_content").doc(`${today}_edu`).set(speciality);
    await db.collection("daily_content").doc(`${today}_health`).set(healthTip);
    return null;
  });

// 🤖 AI Assistant Function (Gemini)
exports.askAI = functions.https.onCall(async (data, context) => {
  const { prompt, type } = data; // type: 'health' or 'education'
  
  if (!prompt) {
    throw new functions.https.HttpsError("invalid-argument", "Prompt is required.");
  }

  try {
    // In a real setup, you would use:
    // const { GoogleGenerativeAI } = require("@google/generative-ai");
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const result = await model.generateContent(systemPrompt + prompt);
    // const response = await result.response;
    // return { text: response.text() };

    // For now, providing a smart-looking fallback that explains how to enable the real thing
    let systemPrompt = "";
    if (type === 'health') {
      systemPrompt = "You are a family health assistant. Give helpful, friendly advice in simple terms. Always add a medical disclaimer. ";
    } else {
      systemPrompt = "You are a friendly family education assistant. Explain things simply and encourage curiosity. ";
    }

    // Simulate AI delay
    await new Promise(r => setTimeout(r, 1000));

    return { 
      text: `[AI Assistant] I received your question about ${type}: "${prompt}". (Note: To enable live Gemini AI, please add the Gemini API key to your Firebase Functions environment.)`,
      disclaimer: type === 'health' ? "Disclaimer: This is for informational purposes only. Consult a doctor for medical advice." : null
    };
  } catch (error) {
    console.error("AI Error:", error);
    throw new functions.https.HttpsError("internal", "AI Assistant is currently offline.");
  }
});
