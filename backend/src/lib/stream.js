import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.log("Error upserting Stream user:", error);
    throw error;
  }
};
export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.log("Error in generating Stream Token: ", error);
  }
};
