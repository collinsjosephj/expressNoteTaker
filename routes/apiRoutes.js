const path = require('path');
const express = require('express');
const router = require('express').Router();
const fs = require('fs');
const notesFilePath = path.join(__dirname, '..', 'db', 'db.json');

// API route to get all notes
router.get('/notes', (req, res) => {
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes file:', err);
            return res.status(500).send('Error reading notes file');
        }
        try {
            const notes = JSON.parse(data);
            res.json(notes);
        } catch (parseErr) {
            console.error('Error parsing notes file:', parseErr);
            return res.status(500).send('Error parsing notes file');
        }
    });
});

// API route to save a new note
router.post('/notes', (req, res) => {
    const newNote = req.body;
    if (!newNote.title || !newNote.text) {
        return res.status(400).send('Note must have a title and text');
    }
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes file:', err);
            return res.status(500).send('Error reading notes file');
        }
        let notes;
        try {
            notes = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing notes file:', parseErr);
            return res.status(500).send('Error parsing notes file');
        }
        notes.push(newNote);
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error('Error saving note:', err);
                return res.status(500).send('Error saving note');
            }
            res.json(newNote);
        });
    });
});

// API route to delete a note
router.delete('/notes/:title', (req, res) => {
    const noteTitle = req.params.title;
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes file:', err);
            return res.status(500).send('Error reading notes file');
        }
        let notes;
        try {
            notes = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing notes file:', parseErr);
            return res.status(500).send('Error parsing notes file');
        }
        const updatedNotes = notes.filter(note => note.title !== noteTitle);
        fs.writeFile(notesFilePath, JSON.stringify(updatedNotes, null, 2), (err) => {
            if (err) {
                console.error('Error deleting note:', err);
                return res.status(500).send('Error deleting note');
            }
            res.json({ title: noteTitle });
        });
    });
});

// API route to update an existing note
router.put('/notes/:title', (req, res) => {
    const noteTitle = req.params.title;
    const updatedNote = req.body;

    if (!updatedNote.title || !updatedNote.text) {
        return res.status(400).send('Note must have a title and text');
    }

    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes file:', err);
            return res.status(500).send('Error reading notes file');
        }

        let notes;
        try {
            notes = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing notes file:', parseErr);
            return res.status(500).send('Error parsing notes file');
        }

        const noteIndex = notes.findIndex(note => note.title === noteTitle);
        if (noteIndex === -1) {
            return res.status(404).send('Note not found');
        }

        notes[noteIndex] = updatedNote;

        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error('Error updating note:', err);
                return res.status(500).send('Error updating note');
            }
            res.json(updatedNote);
        });
    });
});

module.exports = router;