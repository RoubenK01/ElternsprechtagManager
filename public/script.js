document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("bookingForm");
    const nameInput = document.getElementById("name");
    const timeSlotContainer = document.getElementById("timeSlotContainer");
    const timeSlotSelect = document.getElementById("timeSlot");
    const bookButton = document.getElementById("bookButton");

    // Fetch available time slots from the server
    fetch('http://127.0.0.1:3000/availableTimeSlots')
    .then(response => response.json())
    .then(data => {
        data.forEach(slot => {
            const option = document.createElement("option");
            option.value = slot;
            option.textContent = slot;
            timeSlotSelect.appendChild(option);
        });
    });

    nameInput.addEventListener("input", function() {
        if (nameInput.value.trim() !== "") {
            timeSlotContainer.classList.remove("hidden");
        } else {
            timeSlotContainer.classList.add("hidden");
            bookButton.disabled = true;
        }
    });
    
    timeSlotSelect.addEventListener("change", function() {
        if (timeSlotSelect.value !== "") {
            bookButton.disabled = false;
        } else {
            bookButton.disabled = true;
        }
    });        

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const timeSlot = document.getElementById("timeSlot").value;

        fetch('/bookTimeSlot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, timeSlot })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Der Termin wurde erfolgreich gebucht! Vielen Dank");
                // Optionally, refresh the available time slots
                location.reload();
            } else {
                alert("Der Termin ist bereits vergeben. Bitte den Tab neu laden und eine andere Zeit auswählen");
            }
        });
    });
});