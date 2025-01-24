import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set) => ({
	messages: [],
	loading: true,

	sendMessage: async (receiverId, content) => {
		try {

            // Add validation
        if (!receiverId) {
            console.log("Missing receivverId:", receiverId);
            throw new Error("Receiver ID is required");
        }
        
        if (!content || !content.trim()) {
            console.log("Missing content:", content);
            throw new Error("Message content is required");
        }

        // Log the exact data being sent
        console.log("Sending message with data:", { receiverId, content });

			// mockup a message, show it in the chat immediately
			set((state) => ({
				messages: [
					...state.messages,
					{ _id: Date.now(), sender: useAuthStore.getState().authUser._id, content },
				],
			}));
			const res = await axiosInstance.post("/messages/send", { receiverId, content });
			console.log("message sent", res.data);
		} catch (error) {
			toast.error(error.response.data.message || "Something went wrong");
		}
	},

	getMessages: async (userId) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.get(`/messages/conversation/${userId}`);
			set({ messages: res.data.messages });
		} catch (error) {
			console.log(error);
			set({ messages: [] });
		} finally {
			set({ loading: false });
		}
	},

	subscribeToMessages: () => {
		const socket = getSocket();
		socket.on("newMessage", ({ message }) => {
			set((state) => ({ messages: [...state.messages, message] }));
		});
	},

	unsubscribeFromMessages: () => {
		const socket = getSocket();
		socket.off("newMessage");
	},
}));