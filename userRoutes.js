const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// =========================
// REGISTER USER
// =========================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            mobile,
            bloodGroup,
            location,
            latitude,
            longitude,
            userType,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !mobile ||
            !bloodGroup ||
            !location ||
            latitude === undefined ||
            longitude === undefined ||
            !userType ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered."
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email: email.toLowerCase(),
            mobile,
            bloodGroup,
            location,
            latitude,
            longitude,
            userType,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Account created successfully! ❤️"
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration."
        });

    }

});


// =========================
// LOGIN USER
// =========================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        res.status(200).json({

            message: "Login successful! ❤️",

            user: {
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                bloodGroup: user.bloodGroup,
                location: user.location,
                latitude: user.latitude,
                longitude: user.longitude,
                userType: user.userType
            }

        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login."
        });

    }

});


// =========================
// UPDATE USER LOCATION
// =========================

router.put("/update-location", async (req, res) => {

    try {

        const {
            email,
            latitude,
            longitude
        } = req.body;

        if (
            !email ||
            latitude === undefined ||
            longitude === undefined
        ) {

            return res.status(400).json({
                message: "Email and location are required."
            });

        }

        const user = await User.findOneAndUpdate(

            {
                email: email.toLowerCase()
            },

            {
                latitude: latitude,
                longitude: longitude
            },

            {
                new: true
            }

        );

        if (!user) {

            return res.status(404).json({
                message: "User not found."
            });

        }

        res.json({

            message: "Location updated successfully! 📍",

            latitude: user.latitude,

            longitude: user.longitude

        });

    } catch (error) {

        console.error(
            "Location update error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while updating location."
        });

    }

});


// =========================
// GET ALL DONORS
// =========================

router.get("/donors", async (req, res) => {

    try {

        const donors = await User.find(
            {
                userType: "Donor"
            },
            {
                name: 1,
                email: 1,
                mobile: 1,
                bloodGroup: 1,
                location: 1,
                latitude: 1,
                longitude: 1
            }
        );

        res.status(200).json(donors);

    } catch (error) {

        console.error(
            "Get donors error:",
            error
        );

        res.status(500).json({
            message:
                "Server error while fetching donors."
        });

    }

});


module.exports = router;