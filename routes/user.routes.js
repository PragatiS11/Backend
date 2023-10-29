const express = require("express");
const { UserModel } = require("../model/user.model")
const userRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BlackListModel } = require("../model/blacklist.model")


/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Register a new user with the provided name, email, and password.
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 description: User's name
 *                 type: string
 *               email:
 *                 description: User's email
 *                 type: string
 *               pass:
 *                 description: User's password
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - pass
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
userRouter.post("/register", async (req, res) => {
    const { name, email, pass } = req.body;
    const existingUsername = await UserModel.findOne({name});
    const existing = await UserModel.findOne({ email });
    if (existing) {
        return res.status(400).send({ "msg": "This email is already exists in our system" });
    }
    
    if (existingUsername) {
        return res.status(400).send({ "msg": "username is already exists" });
    }


    const capital = /[A-Z]/
    const digit = /[0-9]/
    const special = /[!@#$%^&*()_+-=`~,.[\]{}]/
    if (pass.length < 8 || !pass.match(capital) || !pass.match(digit) || !pass.match(special)) {
        return res.status(400).send({ "msg": "password doesn't contain required character. it should contain one upper case, one number and one special character." })
    }
    try {
        bcrypt.hash(pass, 5, async (err, hash) => {
            if (err) {
                res.status(400).send({ "error": err.message });
            }
            else {
                const user = new UserModel({ name, email, pass: hash});
                await user.save();
                res.status(200).send({ "msg": "The new user has been registered", "registeredUser": user })
            }
        });
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})




/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login with an existing user
 *     description: Log in with an existing user using their email and password.
 *     produces:
 *       - application/json
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *             required:
 *               - email
 *               - pass
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad request
 */
userRouter.post("/login", async (req, res) => {
    const { email, pass } = req.body
    const user = await UserModel.findOne({ email });

    try {
        if (user) {
            bcrypt.compare(pass, user.pass, (err, result) => {
                if (result) {

                    const token = jwt.sign({username:user.name, userID:user._id}, "masai", { expiresIn: "1h" })      
                    res.status(200).send({ "msg": "Login successful!", "token": token })
                }
                else {
                    res.status(200).send({ "msg": "please check your password" })
                }
            });
        }

        else {
            res.status(400).send({ "msg": "User Not Found" })
        }
    }
    catch (error) {
        res.status(400).send({ "error": error.message })
    }
})


/**
 * @swagger
 * /users/logout:
 *   get:
 *     tags:
 *       - Users
 *     summary: Logout the user
 *     description: Log the user out by adding their token to the blacklist.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         description: User's authorization token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Bad request
 */
userRouter.get("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const blacklist = new BlackListModel({ "token": token });
        await blacklist.save();
        res.status(200).send({ "msg": "User has been logged out" })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})
module.exports = {
    userRouter
}