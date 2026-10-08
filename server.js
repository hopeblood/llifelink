const mongoose = require("mongoose");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const userRoutes = require("./routes/userRoutes");
const bloodRequestRoutes = require("./routes/bloodRequestRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);

app.get("/", (req, res) => {
    res.send("LifeLink Backend is running ❤️");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "LifeLink backend connected successfully!"
    });
});

// Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// TEST EMAIL ROUTE
app.get("/api/test-email", async (req, res) => {

    try {

        console.log("Testing email...");

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "LifeLink Test Email ❤️",
            text: "LifeLink email system is working successfully!"
        });

        console.log(
            "Email sent successfully:",
            info.messageId
        );

        res.json({
            message: "Test email sent successfully! ❤️"
        });

    } catch (error) {

        console.error(
            "Test email failed:",
            error
        );

        res.status(500).json({
            message: "Test email failed.",
            error: error.message
        });
    }
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(
            "MongoDB connected successfully! ✅"
        );
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error
        );
    });

// Start server
app.listen(PORT, () => {
    console.log(
        `LifeLink Backend running on http://localhost:${PORT}`
    );
});