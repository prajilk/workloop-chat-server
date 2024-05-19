const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const getUserId = require('./src/middleware/getUserId.js');
const { getChatList } = require('./src/controllers/ChatController.js');
const { decrypt } = require('./src/encryption/encrypt.js');
require('dotenv').config()

const PORT = 5000;

//Connect to database
require('./src/config/db.js');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.get('/', (req, res) => {
    res.send('Server created successfully!');
})

app.get('/get-chat-list', getUserId, async (req, res) => {
    const user = req.user; // Adding user id from getUserId middleware
    getChatList(user).then((chatList) => {
        chatList = chatList
            .map((chat) => {
                const { password, email, ...rest } = chat.receiver_details;
                return { chats: chat.chats, receiver_details: rest };
            })
        // Loop through the chats array
        for (let i = 0; i < chatList.length; i++) {
            // Get the messages array for the current chat
            const chats = chatList[i].chats;

            // Loop through the messages array and update the message value
            for (let j = 0; j < chats.length; j++) {
                chats[j].message = decrypt(chats[j].message);
            }
        }
        res.status(200).json(chatList);
    })
})

const server = app.listen(PORT, console.log(`Server running on Port: ${PORT}`));

const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});
require('./src/socket')(io);