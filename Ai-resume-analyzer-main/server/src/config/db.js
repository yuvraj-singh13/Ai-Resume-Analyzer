import mongoose from "mongoose";

/**
 * Connects to MongoDB using MONGODB_URI.
 * The app is still fully usable without Mongo running -
 * parsing/matching only require Groq. Mongo is used to
 * persist history of parsed resumes and match results,
 * mirroring how the Streamlit app kept resume state in
 * st.session_state, but durable across restarts.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[mongo] MONGODB_URI is not configured; history persistence is disabled.");
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log(`[mongo] connected -> ${uri}`);
  } catch (error) {
    console.error("[mongo] connection failed:", error.message);
    console.error("[mongo] the API will still run, but /history endpoints will fail until Mongo is reachable.");
  }
}

export default connectDB;
