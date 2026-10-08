const express = require("express");
const User = require("../models/User");
const BloodRequest = require("../models/BloodRequest");
const nodemailer = require("nodemailer");

const router = express.Router();


// =========================
// EMAIL CONFIGURATION
// =========================

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


// =========================
// DISTANCE CALCULATION
// =========================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


// =========================
// CREATE BLOOD REQUEST
// =========================

router.post("/", async (req, res) => {

    try {

        const {
            patientName,
            bloodGroup,
            units,
            hospital,
            hospitalLocation,
            latitude,
            longitude,
            requiredDate,
            contact,
            message
        } = req.body;


        // =========================
        // VALIDATION
        // =========================

        if (
            !patientName ||
            !bloodGroup ||
            !units ||
            !hospital ||
            !hospitalLocation ||
            latitude === undefined ||
            longitude === undefined ||
            !requiredDate ||
            !contact
        ) {

            return res.status(400).json({
                message:
                    "All required fields are needed."
            });

        }


        // =========================
        // FIND MATCHING DONORS
        // =========================

        const donors =
            await User.find({

                bloodGroup: bloodGroup,

                userType: "Donor"

            });


        // =========================
        // DONORS WITH LOCATION
        // =========================

        const donorsWithDistance =
            donors

                .filter(function (donor) {

                    return (
                        donor.latitude !== undefined &&
                        donor.longitude !== undefined
                    );

                })

                .map(function (donor) {

                    const distance =
                        calculateDistance(

                            latitude,
                            longitude,

                            donor.latitude,
                            donor.longitude

                        );

                    return {

                        donor: donor,

                        distance: distance

                    };

                });


        // =========================
        // FIND NEAREST DONOR
        // =========================

        donorsWithDistance.sort(
            function (a, b) {

                return (
                    a.distance -
                    b.distance
                );

            }
        );


        let nearestDonor = null;


        if (
            donorsWithDistance.length > 0
        ) {

            nearestDonor =
                donorsWithDistance[0];

        }


        // =========================
        // CREATE BLOOD REQUEST
        // =========================

        const request =
            new BloodRequest({

                patientName,

                bloodGroup,

                units,

                hospital,

                hospitalLocation,

                latitude,

                longitude,

                requiredDate,

                contact,

                message,

                status: "Pending",

                donorId:
                    nearestDonor
                        ? nearestDonor.donor._id
                        : null,

                donorName:
                    nearestDonor
                        ? nearestDonor.donor.name
                        : "",

                donorEmail:
                    nearestDonor
                        ? nearestDonor.donor.email
                        : ""

            });


        await request.save();


        // =========================
        // NO DONOR FOUND
        // =========================

        if (!nearestDonor) {

            return res.status(201).json({

                message:
                    "Blood request saved, but no matching donor with location was found.",

                requestId:
                    request._id,

                nearestDonor: null

            });

        }


        // =========================
        // SEND EMAIL TO DONOR
        // =========================

        const mailOptions = {

            from:
                process.env.EMAIL_USER,

            to:
                nearestDonor.donor.email,

            subject:
                "🩸 LifeLink - Blood Donation Request",

            html: `

                <div style="
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 600px;
                    margin: auto;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2 style="color: #d32f2f;">
                        🩸 LifeLink Blood Request
                    </h2>

                    <p>
                        Hello
                        <strong>
                            ${nearestDonor.donor.name}
                        </strong>,
                    </p>

                    <p>
                        A patient nearby needs your blood group:
                        <strong>${bloodGroup}</strong>.
                    </p>

                    <hr>

                    <p>
                        <strong>👤 Patient:</strong>
                        ${patientName}
                    </p>

                    <p>
                        <strong>🩸 Blood Group:</strong>
                        ${bloodGroup}
                    </p>

                    <p>
                        <strong>📦 Units Required:</strong>
                        ${units}
                    </p>

                    <p>
                        <strong>🏥 Hospital:</strong>
                        ${hospital}
                    </p>

                    <p>
                        <strong>📍 Hospital Location:</strong>
                        ${hospitalLocation}
                    </p>

                    <p>
                        <strong>📅 Required Date:</strong>
                        ${requiredDate}
                    </p>

                    <p>
                        <strong>📞 Contact:</strong>
                        ${contact}
                    </p>

                    ${
                        message
                            ? `<p>
                                <strong>💬 Message:</strong>
                                ${message}
                               </p>`
                            : ""
                    }

                    <p>
                        <strong>📏 Approximate Distance:</strong>
                        ${nearestDonor.distance.toFixed(2)}
                        km
                    </p>

                    <hr>

                    <p>
                        Please login to LifeLink to
                        accept or reject this request.
                    </p>

                    <p>
                        ❤️ <strong>LifeLink</strong><br>
                        Connecting Donors. Saving Lives.
                    </p>

                </div>

            `

        };


        // =========================
        // SEND EMAIL
        // =========================

        try {

            await transporter.sendMail(
                mailOptions
            );

            console.log(
                "Email sent successfully to:",
                nearestDonor.donor.email
            );

        } catch (emailError) {

            console.error(
                "Email sending failed:",
                emailError.message
            );

        }


        // =========================
        // RESPONSE
        // =========================

        res.status(201).json({

            message:
                "Blood request saved successfully! Nearest donor found. Email notification sent. ❤️",

            requestId:
                request._id,

            nearestDonor: {

                id:
                    nearestDonor.donor._id,

                name:
                    nearestDonor.donor.name,

                email:
                    nearestDonor.donor.email,

                bloodGroup:
                    nearestDonor.donor.bloodGroup,

                location:
                    nearestDonor.donor.location,

                distance:
                    Number(
                        nearestDonor.distance.toFixed(2)
                    )

            }

        });


    } catch (error) {

        console.error(
            "Blood request error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while creating blood request."

        });

    }

});


// =========================
// GET REQUESTS FOR DONOR
// =========================

router.get("/donor/:email", async (req, res) => {

    try {

        const donorEmail =
            req.params.email.toLowerCase();

        const requests =
            await BloodRequest.find({

                donorEmail: donorEmail

            }).sort({
                createdAt: -1
            });


        res.status(200).json(
            requests
        );


    } catch (error) {

        console.error(
            "Donor requests error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while fetching donor requests."

        });

    }

});


// =========================
// UPDATE REQUEST STATUS
// DONOR ACCEPT / REJECT
// =========================

router.put("/:requestId/status", async (req, res) => {

    try {

        const {
            status,
            donorEmail
        } = req.body;


        // =========================
        // VALIDATION
        // =========================

        if (
            !status ||
            !donorEmail
        ) {

            return res.status(400).json({

                message:
                    "Status and donor email are required."

            });

        }


        if (
            status !== "Accepted" &&
            status !== "Rejected"
        ) {

            return res.status(400).json({

                message:
                    "Invalid status."

            });

        }


        // =========================
        // FIND REQUEST
        // =========================

        const request =
            await BloodRequest.findById(
                req.params.requestId
            );


        if (!request) {

            return res.status(404).json({

                message:
                    "Blood request not found."

            });

        }


        // =========================
        // CHECK ASSIGNED DONOR
        // =========================

        if (
            request.donorEmail.toLowerCase() !==
            donorEmail.toLowerCase()
        ) {

            return res.status(403).json({

                message:
                    "You are not the assigned donor for this request."

            });

        }


        // =========================
        // CHECK CURRENT STATUS
        // =========================

        if (
            request.status !== "Pending"
        ) {

            return res.status(400).json({

                message:
                    "This request has already been processed."

            });

        }


        // =========================
        // UPDATE STATUS
        // =========================

        request.status =
            status;

        await request.save();


        // =========================
        // RESPONSE
        // =========================

        res.status(200).json({

            message:
                `Blood request ${status.toLowerCase()} successfully. ❤️`,

            requestId:
                request._id,

            status:
                request.status

        });


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while updating request status."

        });

    }

});


// =========================
// GET SINGLE REQUEST
// =========================

router.get("/:requestId", async (req, res) => {

    try {

        const request =
            await BloodRequest.findById(
                req.params.requestId
            );


        if (!request) {

            return res.status(404).json({

                message:
                    "Blood request not found."

            });

        }


        res.status(200).json(
            request
        );


    } catch (error) {

        console.error(
            "Get request error:",
            error
        );

        res.status(500).json({

            message:
                "Server error while fetching request."

        });

    }

});


module.exports = router;