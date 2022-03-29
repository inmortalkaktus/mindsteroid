
import mongoose from 'mongoose';
import Deck from '../models/postDeck.js';

export const getDecks = async (req, res) => {
    try {
        const postDeck = await Deck.find();

        res.status(200).json(postDeck);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getFolderById = async (req, res) => {
    try {
        const postFolder = await Deck.findById(req.params.id);

        res.status(200).json(postFolder);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getFoldersById = async (req, res) => {
    try {
        const postFolder = await Deck.findById(req.params.id);

        let subfolders = await Deck.find({ "_id": { "$in": postFolder.subfolders}});

        res.status(200).json(subfolders);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;

    const newDeck = new Deck(post);

    try {
        await newDeck.save();

        res.status(201).json(newDeck);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateFolder = async (req, res) => {
    const { id: _id } = req.params;
    const folder = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No folder with that id');

    const updatedFolder = await Deck.findByIdAndUpdate(_id, folder, { new: true });

    res.json(updatedFolder);
}

export const deleteFolder = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No folder with that id');

    let parentId = await Deck.findById(id);
    parentId = parentId.parent.toString();

    // Remove the ObjectId from the parent's subfolder array
    await Deck.findOneAndUpdate({ _id: parentId }, { 
        $pull: { subfolders: id } 
    })

    await Deck.findByIdAndRemove(id);

    res.json({ message: 'Folder deleted successfully' });
}