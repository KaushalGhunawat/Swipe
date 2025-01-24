import Message from "../models/Message.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const sendMessage = async (req,res) => {

    try {
        const { content, receiverId } = req.body;
        
        // Validate required fields
        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content is required"
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID is required"
            });
        }

        // Check if receiverId is a valid ObjectId
        // if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid receiver ID format"
        //     });
        // }

        const newMessage = await Message.create({
            sender: req.user.id,
            receiver: receiverId,
            content,
        });

        // Rest of your code...
        

        //TODO SEND THE MESSAGE IN REALTIME => SOCKET.IO
        const io = getIO();
        const connectedUsers = getConnectedUsers();
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                message: newMessage,
            });
        }

        res.status(201).json({
            success: true,
            message: newMessage
        })

    } catch (error) {
        console.log("Error in send Message: ", error);

        res.status(500).json({
            success: false,
            message: "Internal Server errror"
        })
    }
};

export const getConversation = async (req,res) => {

    const {userId} = req.params;

    try {
        const messages = await Message.find({
            $or: [
                {sender: req.user.id, receiver: userId},
                {sender: userId, receiver: req.user._id}
            ]
        }).sort("createdAt")

        res.status(200).json({
            success: true,
            messages
        })
    } catch (error) {
        console.log("Error in getConversation: ", error);

        res.status(500).json({
            success: false,
            message : "Internal server error"
        })
    }
};