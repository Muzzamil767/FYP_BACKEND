const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

const Prescription = mongoose.model("Prescription" , prescriptionSchema);

module.exports = Prescription;