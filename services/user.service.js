const { string, number } = require("joi");
const db = require("./db.service");
const mongoose = db.getDb();

mongoose.set('runValidators', true);

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: {
        type: Number,
        required: true,
    },
    email: { type: String, required: true },
    address: { type: String, required: false },
    dob: { type: Date, required: true }
}, { strict: false });
userSchema.methods.getInstance = function () {
    return this;
}

const User = new mongoose.model('User', userSchema);
module.exports = User;