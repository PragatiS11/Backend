const express = require("express");
const noteRouter = express.Router();
const { NoteModel } = require("../model/note.model");
const { auth } = require("../middleware/auth.middleware");
const { rateLimiter } = require("../middleware/rateLimiter.middleware");
noteRouter.use(auth);
noteRouter.use(rateLimiter);


/**
 * @swagger
 * /notes/create:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a new note
 *     description: Create a new note with the provided title, body, and associated user ID.
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: title
 *         description: Note title
 *         in: body
 *         required: true
 *         type: string
 *       - name: body
 *         description: Note body
 *         in: body
 *         required: true
 *         type: string
 *       - name: userID
 *         description: User ID associated with the note
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: A new note has been added
 *       400:
 *         description: Bad request
 */
noteRouter.post("/create", async (req, res) => {
    const { } = req.body
    try {
        const note = new NoteModel(req.body);
        await note.save();
        res.status(200).send({ "msg": "A new note has been added" });
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})



/**
 * @swagger
 * /notes/{noteid}:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get a note by ID
 *     description: Get a note by its ID or get all notes for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: noteid
 *         description: ID of the note to retrieve (optional)
 *         in: path
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A note or list of notes
 *       404:
 *         description: Note not found
 *       400:
 *         description: Bad request
 */
noteRouter.get("/:noteid?", async (req, res) => {
    const { noteid } = req.params
    try {
        if (noteid) {
            const note = await NoteModel.findOne({ _id: noteid });
            if (!note) {
                return res.status(404).send({ "msg": "Note not found" })
            }
            if (note.username == req.body.username) {
                res.status(200).send(note);
            }
        }
        else {
            const notes = await NoteModel.find({ username: req.body.username })
            return res.status(200).send(notes)
        }
    } catch (error) {
        res.status(400).send({ "error": error.message });
    }
});




/**
 * @swagger
 * /notes/update/{id}:
 *   patch:
 *     tags:
 *       - Notes
 *     summary: Update a note by ID
 *     description: Update a note by its ID. Requires ownership of the note.
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID of the note to update
 *         in: path
 *         required: true
 *         type: string
 *       - name: title
 *         description: New title for the note
 *         in: body
 *         required: true
 *         type: string
 *       - name: body
 *         description: New body for the note
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Note has been updated
 *       404:
 *         description: Note not found
 *       400:
 *         description: Bad request
 */


noteRouter.patch("/update/:id", async (req, res) => {
    const { id } = req.params
    try {

        const note = await NoteModel.findOne({ _id: id });
        if (!note) {
            return res.status(404).send({ "msg": "Note not found" })
        }
        if (note.username == req.body.username) {
            await NoteModel.findByIdAndUpdate({ _id: id }, req.body);
            res.status(200).send({ "msg": "Note has been updated" });
        }
        else {
            res.status(200).send({ "msg": "you are not authorized to update it" });
        }
    }
    catch (error) {
        res.status(400).send({ "error": error.message })
    }
})


/**
 * @swagger
 * /notes/delete/{id}:
 *   delete:
 *     tags:
 *       - Notes
 *     summary: Delete a note by ID
 *     description: Delete a note by its ID. Requires ownership of the note.
 *     security:
 *       - BearerAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: ID of the note to delete
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Note has been deleted
 *       404:
 *         description: Note not found
 *       400:
 *         description: Bad request
 */
noteRouter.delete("/delete/:id", async (req, res) => {
    const { id } = req.params
    try {
        const note = await NoteModel.findOne({ _id: id });
        if (!note) {
            return res.status(404).send({ "msg": "Note not found" })
        }
        if (note.username === req.body.username) {
            await NoteModel.findByIdAndDelete({ _id: id });
            res.status(200).send({ "msg": "Note has been deleted" });
        }
        else {
            res.status(200).send({ "msg": "you are not authorized to delete it" });
        }
    }
    catch (error) {
        res.status(400).send({ "error": error.message })
    }
})
module.exports = {
    noteRouter
}