<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>LifeLink - Blood Donation Certificate</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

    <div class="certificate-page">

        <div class="certificate">

            <div class="certificate-border">

                <div class="certificate-logo">
                    🩸
                </div>

                <h1 class="life-title">
                    LifeLink
                </h1>

                <p class="college-title">
                    Alamuri Ratnamal Institute of Engineering
                    and Technology (ARMIET)
                </p>

                <div class="certificate-line"></div>

                <h2>
                    CERTIFICATE OF APPRECIATION
                </h2>

                <p class="presented">
                    This certificate is proudly presented to
                </p>

                <h1 id="donorName">
                    Donor Name
                </h1>

                <p class="certificate-text">
                    for voluntarily donating blood and making a
                    valuable contribution towards saving lives.
                </p>


                <div class="donation-details">

                    <div>
                        <strong>Blood Group</strong>
                        <span id="bloodGroup">-</span>
                    </div>

                    <div>
                        <strong>Donation Date</strong>
                        <span id="donationDate">-</span>
                    </div>

                    <div>
                        <strong>Donation Location</strong>
                        <span id="location">-</span>
                    </div>

                </div>


                <p class="message">

                    Your selfless contribution is a valuable
                    act of humanity. Thank you for becoming a
                    part of the LifeLink community.

                </p>


                <h3 class="quote">
                    “Your Blood Can Give Someone Another
                    Chance at Life.”
                </h3>


                <div class="certificate-signatures">

                    <div>
                        ____________________<br>
                        <strong>Authorized Signature</strong>
                    </div>

                    <div>
                        ____________________<br>
                        <strong>LifeLink Coordinator</strong>
                    </div>

                </div>


                <p class="certificate-footer">
                    Connecting Donors. Saving Lives. ❤️
                </p>

            </div>

        </div>


        <button
            class="print-certificate"
            onclick="window.print()"
        >
            🖨️ Print / Save Certificate
        </button>

    </div>


    <script src="donation-certificate.js"></script>
    <img
        src="certificate-signatures.png"
        alt="Authorized Signature and LifeLink Coordinator Signature"
        class="certificate-signature-image"
    >
</div>

</body>

</html>
