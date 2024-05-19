const ChatController = require('../controllers/ChatController');
const { encrypt, decrypt } = require('../encryption/encrypt')

module.exports = (io) => {

    const users = {};

    io.on('connection', socket => {

        console.log("Device connected: " + socket.id);

        socket.on('disconnect', () => {
            console.log("Device disconnected: " + socket.id);
            delete users[socket.id];
        });

        socket.on('joinRoom', (roomId) => {
            users[socket.id] = roomId;
            console.log("Device joined room: " + roomId);
            socket.join(roomId);
        });

        socket.on('signout', (user) => {
            const keyToDelete = Object.keys(users).find(key => users[key] === user);
            delete users[keyToDelete];
        })

        socket.on('check-online', (userId, callback) => {
            if (Object.values(users).indexOf(userId) > -1)
                callback(true)
            else
                callback(false)
        })

        socket.on('sendTyping', (user, receiver) => {
            socket.to(receiver).emit('sendTyping', user)
        })

        socket.on('stopTyping', (user, receiver) => {
            socket.to(receiver).emit('stopTyping', user)
        })

        socket.on('ready-to-send-message', (user, receiver) => {
            ChatController.addToChatList(user, receiver);
        })

        socket.on('send-message', ({ message, timestamp }, sender, receiver) => {
            const hashMessage = encrypt(message);
            ChatController.saveChatMessage(hashMessage, sender, receiver).then(() => {
                socket.to(receiver).emit('receive-message', { sender, message, timestamp });
            })
        })

    })
}