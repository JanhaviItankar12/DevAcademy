import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureTitle: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
    },
    publicId: {
        type: String
    },
    isPreviewFree: {
        type: Boolean

    },
    // Instead of plain number
    views: [
        {
            count: { type: Number, default: 0 },
            createdAt: { type: Date, default: Date.now }
        }
    ],

    dropOff: [
        {
            percent: { type: Number, default: 0 }, // % of lecture watched before drop
            createdAt: { type: Date, default: Date.now }
        }
    ],

    avgTime: [
        {
            time: { type: Number, default: 0 }, // in minutes
            createdAt: { type: Date, default: Date.now }
        }
    ]



}, { timestamps: true });

export const Lecture = mongoose.model("Lecture", lectureSchema);