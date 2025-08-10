import { axiosInstance } from "../lib/axios.js";

export const signup = async (signUpData) => {
  const response = await axiosInstance.post("/auth/signup", signUpData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser: ", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/user/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/user");
  return response.data;
}

export async function getOutgoingFriendRequest() {
  try {
    const response = await axiosInstance.get("/user/outgoing-friend-requests");
    return response.data;
  } catch (error) {
    console.log("Error in getOutgoingFriendRequest: ", error);
    return [];
  }
}

export async function sendFriendRequest(userId) {
  if (!userId) {
    throw new Error("User ID is required for sending a friend request.");
  }
  const response = await axiosInstance.post(`/user/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  try {
    const response = await axiosInstance.get("/user/friend-requests");
    return response.data;
  } catch (error) {
    console.log("Error in getFriendRequests: ", error);
  }
}

export async function acceptFriendRequests(requestId) {
  const response = await axiosInstance.put(
    `/user/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}
