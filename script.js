// Initialize Firebase and Firestore
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

// Modal Elements
const editModal = document.getElementById("edit-modal");
const modalTitle = document.getElementById("modal-title");
const modalDate = document.getElementById("modal-date");
const modalTime = document.getElementById("modal-time");
const saveEditBtn = document.getElementById("save-edit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

// Store the current editing event id globally
let currentEditingEventId = null;

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
      // eventItem.textContent = `${eventData.title} - ${eventData.date} ${eventData.time}`;

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

      // Create delete button for each event
      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "Delete";
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
      editBtn.addEventListener("click", () => {
        // Open the modal with the current event details
        currentEditingEventId = eventDoc.id;
        modalTitle.value = eventData.title;
        modalDate.value = eventData.date;
        modalTime.value = eventData.time;

        editModal.style.display = "block";
      });

      // Append everything to the event item
      eventItem.appendChild(eventHeader);
      eventItem.appendChild(eventDetails);
      eventItem.appendChild(deleteBtn);
      eventItem.appendChild(editBtn);
      eventsList.appendChild(eventItem);
    });
  } catch (e) {
    console.error("Error fetching events: ", e);
  }
}

// Call renderEvents to load events on page load
renderEvents();

// Event handler for form submission
eventForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent the default form submission

  const title = eventTitle.value;
  const date = eventDate.value;
  const time = eventTime.value;

  if (title && date && time) {
    try {
      const docRef = await addDoc(collection(db, "events"), {
        title,
        date,
        time,
      });

      // const eventItem = document.createElement("li");
      // eventItem.textContent = `${title} - ${date} ${time}`;

      // eventItem.appendChild(deleteBtn);
      // eventItem.appendChild(editBtn);
      // eventsList.appendChild(eventItem);

      eventForm.reset();
      renderEvents();
    } catch (e) {
      console.error("Error adding event to Firestore: ", e);
    }
  }
});

// Edit event functionality in the modal
saveEditBtn.addEventListener("click", async () => {
  const updatedTitle = modalTitle.value;
  const updatedDate = modalDate.value;
  const updatedTime = modalTime.value;

  if (updatedTitle && updatedDate && updatedTime && currentEditingEventId) {
    try {
      const eventRef = doc(db, "events", currentEditingEventId);
      await updateDoc(eventRef, {
        title: updatedTitle,
        date: updatedDate,
        time: updatedTime,
      });

      // Close modal after save
      editModal.style.display = "none";

      // Re-render the events to reflect the changes
      renderEvents();
    } catch (e) {
      console.error("Error updating event: ", e);
    }
  }
});

// Close modal without saving
cancelEditBtn.addEventListener("click", () => {
  editModal.style.display = "none"; // Hide the modal
});
