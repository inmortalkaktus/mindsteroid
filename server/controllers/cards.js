
import mongoose from 'mongoose';
import { Card, Deck, Folder } from '../models/models.js';

export const getCards = async (req, res) => {
    try {
        const postCard = await Card.find({ "creator": req.userobjectid});
        
        res.status(200).json(postCard);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getCardById = async (req, res) => {
    try {
        const postCard = await Card.findById(req.params.id);
        
        if ((postCard) && (req.userobjectid !== postCard.creator.toString()))
            return res.status(403).json({ message: "No tienes permisos para acceder a este contenido "})

        res.status(200).json(postCard);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const getCardsById = async (req, res) => {
    try {
        const postDeck = await Deck.findById(req.params.id);

        if ((postDeck) && (req.userobjectid !== postDeck.creator.toString()))
            return res.status(403).json({ message: "No tienes permisos para acceder a este contenido "})

        let cardset = await Card.find({ "_id": { "$in": postDeck.cardset}});

        res.status(200).json(cardset);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createCard = async (req, res) => {
    const post = req.body;

    const newCard = new Card(post);

    try {
        await newCard.save();

        res.status(201).json(newCard);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateCard = async (req, res) => {
    const { id: _id } = req.params;
    const card = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No card with that id');
    
    const postCard = await Card.findById(req.params.id);
        
    if ((postCard) && (req.userobjectid !== postCard.creator.toString()))
        return res.status(403).json({ message: "No tienes permisos para acceder a este contenido "})

    const updatedCard = await Card.findByIdAndUpdate(_id, card, { new: true });

    res.json(updatedCard);
}

export const deleteCard = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No card with that id');

    const postCard = await Card.findById(req.params.id);
        
    if ((postCard) && (req.userobjectid !== postCard.creator.toString()))
        return res.status(403).json({ message: "No tienes permisos para acceder a este contenido "})

    let parentId = await Card.findById(id);
    parentId = parentId.parent.toString();

    // Remove the ObjectId from the parent's cardset array
    await Folder.findOneAndUpdate({ _id: parentId }, { 
        $pull: { cardset: id } 
    })

    await Card.findByIdAndRemove(id);

    res.json({ message: 'Card deleted successfully' });
}