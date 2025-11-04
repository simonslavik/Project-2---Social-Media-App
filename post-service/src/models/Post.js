const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    mediaIds: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },

}, {
        timestamps: true
    }
)

postSchema.index({user: 1, createdAt: -1});

module.exports = mongoose.model('Post', postSchema);