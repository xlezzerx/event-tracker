import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Get references to DOM elements
const eventForm = document.getElementById("event-form");
const eventTitle = document.getElementById("event-title");
const eventDate = document.getElementById("event-date");
const eventTime = document.getElementById("event-time");
const eventsList = document.getElementById("events");

// Firebase Config
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
const analytics = getAnalytics(app);
const db = getFirestore(app); // Firestore instance

// Event handler for form submission
eventForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent the default form submission

  const title = eventTitle.value;
  const date = eventDate.value;
  const time = eventTime.value;

  if (title && date && time) {
    // Add event to Firestore
    try {
      const docRef = await addDoc(collection(db, "events"), {
        title,
        date,
        time,
      });

      console.log("Event added with ID: ", docRef.id);

      // Create new event element
      const eventItem = document.createElement("li");
      eventItem.textContent = `${title} - ${date} ${time}`;

      // Append event to the list
      eventsList.appendChild(eventItem);

      // Clear the form
      eventForm.reset();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
});
