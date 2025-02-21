import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBFlui1di6EVCFZpZFSxrMr5dhiK3lQrGM",
  authDomain: "event-tracker-f54eb.firebaseapp.com",
  projectId: "event-tracker-f54eb",
  storageBucket: "event-tracker-f54eb.firebasestorage.app",
  messagingSenderId: "730198827128",
  appId: "1:730198827128:web:7f628944530a5c6eb84d8d",
  measurementId: "G-KVH5MRJLWP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get references to DOM elements
const eventForm = document.getElementById("event-form");
const eventTitle = document.getElementById("event-title");
const eventDate = document.getElementById("event-date");
const eventTime = document.getElementById("event-time");
const eventsList = document.getElementById("events");
const eventReminder = document.getElementById("event-reminder");
const toggleCalendarBtn = document.getElementById("toggle-calendar");
const calendarContainer = document.getElementById("calendar");
const eventListContainer = document.getElementById("events");

// Modal Elements
const editModal = document.getElementById("edit-modal");
const modalTitle = document.getElementById("modal-title");
const modalDate = document.getElementById("modal-date");
const modalTime = document.getElementById("modal-time");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

// Store the current editing event id globally
let currentEditingEventId = null;
let calendar;

toggleCalendarBtn.addEventListener("click", () => {
  const isCalendarVisible = calendarContainer.style.display === "block";

  if (isCalendarVisible) {
    // Hide calendar, show event list
    calendarContainer.style.display = "none";
    eventListContainer.style.display = "block";
    toggleCalendarBtn.textContent = "View Calendar";

    // Reapply styles for the list view
    const eventsContainer = document.getElementById("events");
    eventsContainer.style.display = "grid";
    eventsContainer.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(250px, 1fr))";
    eventsContainer.style.gap = "15px";
  } else {
    // Show calendar, hide event list
    calendarContainer.style.display = "block";
    eventListContainer.style.display = "none";
    toggleCalendarBtn.textContent = "View List";

    // Re-render calendar to ensure it loads correctly when it's visible
    renderCalendarView();
  }
});

// Function to format the date
function formatDate(dateString) {
  const date = new Date(dateString); // Convert the date string to a Date object
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options); // Format the date
}

// Function to render events from firestore
async function renderEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    eventsList.innerHTML = ""; // Clear the list first

    querySnapshot.forEach((eventDoc) => {
      const eventData = eventDoc.data(); // Get the event data

      const eventItem = document.createElement("li");
      eventItem.classList.add("event-time");
      eventItem.setAttribute("role", "listitem");

      // Event Header with the date
      const eventHeader = document.createElement("div");
      eventHeader.classList.add("event-header");
      eventHeader.textContent = `${formatDate(eventData.date)}`;

      // Event Details
      const eventDetails = document.createElement("div");
      eventDetails.classList.add("event-details");

      const eventTitleTime = document.createElement("div");
      eventTitleTime.classList.add("event-date-time");
      eventTitleTime.textContent = `${eventData.title} at ${eventData.time}`;

      eventDetails.appendChild(eventTitleTime);

      // Container div for the buttons
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      // Create delete button for each event
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", `Delete ${eventData.title}`);
      deleteBtn.addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, "events", eventDoc.id));
          eventItem.remove();
        } catch (e) {
          console.error("Error deleting event: ", e);
        }
      });

      // Create edit button for each event
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.textContent = "Edit";
      editBtn.setAttribute("aria-label", `Edit ${eventData.title}`);
      editBtn.addEventListener("click", () => {
        // Open the modal with the current event details
        currentEditingEventId = eventDoc.id;
        modalTitle.value = eventData.title;
        modalDate.value = eventData.date;
        modalTime.value = eventData.time;

        openModal();
      });

      // Append buttons to the container
      buttonContainer.appendChild(editBtn);
      buttonContainer.appendChild(deleteBtn);

      // Append everything to the event item
      eventItem.appendChild(eventHeader);
      eventItem.appendChild(eventDetails);
      eventItem.appendChild(buttonContainer);
      eventsList.appendChild(eventItem);
    });
  } catch (e) {
    console.error("Error fetching events: ", e);
  }
}

// Function to render the calendar again if it's visible
async function renderCalendarView() {
  try {
    const querySnapshot = await getDocs(collection(db, "events"));
    const events = [];

    querySnapshot.forEach((eventDoc) => {
      const eventData = eventDoc.data();
      const startDateTime = new Date(`${eventData.date}T${eventData.time}`);
      events.push({
        id: eventDoc.id,
        title: eventData.title,
        start: startDateTime,
      });
    });

    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) {
      console.error("Calendar element not found");
      return;
    }

    // Only render the calendar if it's visible
    if (calendarContainer.style.display === "block") {
      // Destroy the old calendar if it exists
      if (calendar) {
        calendar.destroy();
      }

      // Initialize the new calendar instance
      calendar = new FullCalendar.Calendar(calendarEl, {
        events: events,
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        editable: true,
        droppable: true,
        eventClick: function (info) {
          modalTitle.value = info.event.title;
          modalDate.value = info.event.start.toLocaleDateString("en-CA");
          modalTime.value = info.event.start.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          currentEditingEventId = info.event.id;
          editModal.style.display = "block";

          // Focus the first input element in the modal
          modalTitle.focus();

          // Add event listener to trap tab key
          document.addEventListener("keydown", trapFocus);
        },
      });

      calendar.render();
    }
  } catch (e) {
    console.error("Error fetching events for calendar: ", e);
  }
}

// Focus trapping logic
function trapFocus(event) {
  const focusableElements = editModal.querySelectorAll(
    'button, input, [href], [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  if (event.key === "Tab") {
    // Check if Shift is pressed for reverse tabbing
    if (event.shiftKey) {
      // If tabbing backwards and we're at the first element, go to the last element
      if (document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      }
    } else {
      // If tabbing forwards and we're at the last element, go to the first element
      if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }
  }
}

// Function to open the modal with focus trapping
function openModal() {
  editModal.style.display = "block";
  editModal.setAttribute("aria-hidden", "false");
  modalTitle.focus(); // Focus the first input field in the modal
  document.addEventListener("keydown", trapFocus);
}

// Function to close the modal and remove focus trapping
function closeModal() {
  editModal.style.display = "none";
  editModal.setAttribute("aria-hidden", "true");
  document.removeEventListener("keydown", trapFocus); // Stop trapping focus
  const editEventBtn = document.querySelector(
    `[aria-label="Edit ${modalTitle.value}"]`
  );
  if (editEventBtn) editEventBtn.focus();
}

// Event handler for form submission
eventForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent the default form submission

  const title = eventTitle.value;
  const date = eventDate.value;
  const time = eventTime.value;
  const reminder = parseInt(eventReminder.value) || 0;

  if (title && date && time) {
    try {
      const docRef = await addDoc(collection(db, "events"), {
        title,
        date,
        time,
        reminder,
      });

      // Set reminder alert
      if (reminder > 0) {
        const eventTimeDate = new Date(`${date}T${time}:00`);
        const reminderTime = eventTimeDate.getTime() - reminder * 60 * 1000;

        setTimeout(() => {
          alert(`Reminder: ${title} is starting soon!`);
        }, reminderTime - Date.now());
      }

      eventForm.reset();
      renderEvents();
      closeModal();
    } catch (e) {
      console.error("Error adding event: ", e);
    }
  }
});

// Event handler for modal save button
saveEditBtn.addEventListener("click", async () => {
  if (currentEditingEventId) {
    const updatedTitle = modalTitle.value;
    const updatedDate = modalDate.value;
    const updatedTime = modalTime.value;

    try {
      const eventRef = doc(db, "events", currentEditingEventId);
      await updateDoc(eventRef, {
        title: updatedTitle,
        date: updatedDate,
        time: updatedTime,
      });

      closeModal(); // Close the modal after saving
      renderEvents(); // Re-render events list
    } catch (e) {
      console.error("Error updating event: ", e);
    }
  }
});

// Event handler for modal cancel button
cancelEditBtn.addEventListener("click", () => {
  closeModal();
});

// Initialize the events and calendar view
renderEvents();
