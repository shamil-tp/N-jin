import mongoose from "mongoose";

const searchSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        domain: {
            type: String,
            required: true,
            index: true,
            trim: true,
        },

        ip: {
            type: String,
            required: true,
            index: true,
        },

        title: {
            type: String,
            trim: true,
        },

        content: {
            type: String,
        },

        keywords: {
            type: [String],
            index: true,
        },

        indexedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

// Text index for search (title + content)
searchSchema.index({
    title: "text",
    content: "text",
    keywords: "text",
});

export default mongoose.model("Search", searchSchema);
