const { Schema, model, models } = require('mongoose');

const chatSchema = new Schema({
    user_1: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user_2: {
        type: Schema.Types.ObjectId,
        required: true
    },
    chats: [
        {
            sender: Schema.Types.ObjectId,
            message: String,
            timestamp: Date
        }
    ]
}, { versionKey: false })

module.exports = models.Chat || model('Chat', chatSchema);