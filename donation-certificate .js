// ===============================
// LIFELINK - DONATION CERTIFICATE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    // Get logged-in user
    const user = JSON.parse(
        localStorage.getItem("lifeLinkUser") || "null"
    );


    // ===============================
    // CHECK LOGIN
    // ===============================

    if (!user) {

        alert("Please login first.");

        window.location.href = "index.html";

        return;
    }


    // ===============================
    // CHECK DONOR
    // ===============================

    if (
        user.userType &&
        user.userType.toString().toLowerCase() !== "donor"
    ) {

        alert("Donation certificate is available for blood donors only.");

        window.location.href = "profile.html";

        return;
    }


    // ===============================
    // DISPLAY DONOR NAME
    // ===============================

    const donorName = document.getElementById("donorName");

    if (donorName) {
        donorName.textContent = user.name || "Donor Name";
    }


    // ===============================
    // DISPLAY BLOOD GROUP
    // ===============================

    const bloodGroup = document.getElementById("bloodGroup");

    if (bloodGroup) {
        bloodGroup.textContent = user.bloodGroup || "-";
    }


    // ===============================
    // DISPLAY LOCATION
    // ===============================

    const location = document.getElementById("location");

    if (location) {
        location.textContent = user.location || "-";
    }


    // ===============================
    // DONATION DATE
    // ===============================

    const donationDate = document.getElementById("donationDate");

    const today = new Date();

    const formattedDate = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    if (donationDate) {
        donationDate.textContent = formattedDate;
    }

});
