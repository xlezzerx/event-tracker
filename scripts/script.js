import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  where,
  deleteDoc,
  doc,
  addDoc,
  query,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth(app);

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

let currentEditingEventId = null;
let calendar;

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, you can now render events
    renderEvents(user);
    renderCalendarView(user);
  } else {
    // User is not signed in, redirect to login
    console.log("No user logged in.");
    window.location.href = "index.html";
  }
});

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
        userId: auth.currentUser.uid,
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
      renderEvents(auth.currentUser); // Re-render events with the current user
      closeModal();
    } catch (e) {
      console.error("Error adding event: ", e);
    }
  }
});

// Function to format the date
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  const localDate = new Date(year, month - 1, day);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return localDate.toLocaleDateString(undefined, options);
}

// Function to render events for the current user
async function renderEvents(user) {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);

    eventsList.innerHTML = ""; // Clear the list first

    querySnapshot.forEach((eventDoc) => {
      const eventData = eventDoc.data();

      const eventItem = document.createElement("li");
      eventItem.classList.add("event-time");

      const eventHeader = document.createElement("div");
      eventHeader.classList.add("event-header");
      eventHeader.textContent = `${formatDate(eventData.date)}`;

      const eventDetails = document.createElement("div");
      eventDetails.classList.add("event-details");

      const eventTitleTime = document.createElement("div");
      eventTitleTime.classList.add("event-date-time");
      eventTitleTime.textContent = `${eventData.title} at ${eventData.time}`;

      eventDetails.appendChild(eventTitleTime);

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

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

      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        currentEditingEventId = eventDoc.id;
        modalTitle.value = eventData.title;
        modalDate.value = eventData.date;
        modalTime.value = eventData.time;

        openModal();
      });

      buttonContainer.appendChild(editBtn);
      buttonContainer.appendChild(deleteBtn);

      eventItem.appendChild(eventHeader);
      eventItem.appendChild(eventDetails);
      eventItem.appendChild(buttonContainer);
      eventsList.appendChild(eventItem);
    });
  } catch (e) {
    console.error("Error fetching events: ", e);
  }
}

// Function to render events for the calendar view
async function renderCalendarView(user) {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);
    const events = [];

    querySnapshot.forEach((eventDoc) => {
      const eventData = eventDoc.data();
      const startDateTime = new Date(`${eventData.date}T${eventData.time}`);

      console.log("Parsed startDateTime:", startDateTime);
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

    if (calendar) {
      calendar.destroy();
    }

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
        openModal();
      },
    });

    calendar.render();
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

      renderEvents(auth.currentUser); // Re-render events after update
      closeModal();
    } catch (e) {
      console.error("Error updating event: ", e);
    }
  }
});

// Function to toggle calendar view and list view
toggleCalendarBtn.addEventListener("click", () => {
  const isCalendarVisible = calendarContainer.style.display === "block";

  if (isCalendarVisible) {
    calendarContainer.style.display = "none";
    eventListContainer.style.display = "block";
    toggleCalendarBtn.textContent = "View Calendar";
  } else {
    calendarContainer.style.display = "block";
    eventListContainer.style.display = "none";
    toggleCalendarBtn.textContent = "Close Calendar";
    renderCalendarView();
  }
  // Render the calender again to fix the styling issue on first render
  setTimeout(() => {
    calendar.render();
  }, 1);
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
      renderEvents(auth.currentUser);
    } catch (e) {
      console.error("Error updating event: ", e);
    }
  }
});

// Event handler for modal cancel button
cancelEditBtn.addEventListener("click", () => {
  closeModal();
});
