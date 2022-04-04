import mongoose from 'mongoose';

const cardSchema = mongoose.Schema({
    question: String,
    answer: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
});

const deckSchema = mongoose.Schema({
    name: String,
    creator: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    cardSet: [cardSchema],
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
});

const folderSchema = mongoose.Schema({
    name: String,
    creator: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    subfolders: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref:'folderschema'
        }],
        default: []
    },
    subdecks: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref:'deckschema'
        }],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
});

export const Folder = mongoose.model('Folder', folderSchema);
export const Deck = mongoose.model('Deck', deckSchema);