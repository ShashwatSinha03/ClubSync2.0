const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['MEMBER', 'ADMIN'],
        default: 'MEMBER'
    },
    accountStatus: {
        type: String,
        enum: ['PENDING', 'APPROVED'],
        default: 'PENDING'
    },
    profilePicture: {
        type: String
    },
    instrument: {
        type: String,
        default: 'Vocalist' // Default for musicians
    },
    phone: {
        type: String
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
