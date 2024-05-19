const mongoose = require('mongoose');
const Chat = require("../models/Chat");

console.log(Date())

module.exports = {
    addToChatList: (user, receiver) => {
        console.log(user);
        console.log(receiver);
        return new Promise(async (resolve, reject) => {
            await Chat.findOneAndUpdate(
                {
                    $or: [
                        {
                            user_1: mongoose.Types.ObjectId.createFromHexString(user),
                            user_2: mongoose.Types.ObjectId.createFromHexString(receiver)
                        },
                        {
                            user_1: mongoose.Types.ObjectId.createFromHexString(receiver),
                            user_2: mongoose.Types.ObjectId.createFromHexString(user)
                        }
                    ]
                },
                { user_1: user, user_2: receiver },
                { upsert: true });
            resolve();
        })
    },
    getChatList: (user) => {
        return new Promise(async (resolve, reject) => {
            const chatList = await Chat.aggregate([
                {
                    $match: {
                        $or: [
                            { user_1: mongoose.Types.ObjectId.createFromHexString(user) },
                            { user_2: mongoose.Types.ObjectId.createFromHexString(user) }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 0,
                        chats: 1,
                        recipient: {
                            $cond: [
                                { $eq: ["$user_1", mongoose.Types.ObjectId.createFromHexString(user)] }, "$user_2", "$user_1"
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "recipient",
                        foreignField: "_id",
                        as: "receiver_details"
                    }
                },
                { $unwind: "$receiver_details" },
                {
                    $project: {
                        recipient: 0
                    }
                }
            ])
            resolve(chatList);
        })
    },
    saveChatMessage: (message, sender, receiver) => {
        return new Promise(async (resolve, reject) => {
            if (!sender || !receiver) reject();
            console.log(sender, receiver);
            await Chat.updateOne(
                {
                    $or: [
                        { user_1: mongoose.Types.ObjectId.createFromHexString(sender), user_2: mongoose.Types.ObjectId.createFromHexString(receiver) },
                        { user_1: mongoose.Types.ObjectId.createFromHexString(receiver), user_2: mongoose.Types.ObjectId.createFromHexString(sender) }
                    ]
                },
                {
                    $addToSet: {
                        chats: {
                            sender: mongoose.Types.ObjectId.createFromHexString(sender),
                            message: message,
                            timestamp: new Date()
                        }
                    }
                }
            )
            resolve();
        })
    }
}