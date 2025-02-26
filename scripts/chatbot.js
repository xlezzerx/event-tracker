// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   doc,
//   getDoc,
//   updateDoc,
//   deleteDoc,
//   query,
//   where,
//   getDocs,
// } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// // Firebase config
// const firebaseConfig = {
//   apiKey: "AIzaSyBFlui1di6EVCFZpZFSxrMr5dhiK3lQrGM",
//   authDomain: "event-tracker-f54eb.firebaseapp.com",
//   projectId: "event-tracker-f54eb",
//   storageBucket: "event-tracker-f54eb.firebasestorage.app",
//   messagingSenderId: "730198827128",
//   appId: "1:730198827128:web:7f628944530a5c6eb84d8d",
//   measurementId: "G-KVH5MRJLWP",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// let GEMINI_API_KEY = "";

// document.addEventListener("DOMContentLoaded", function () {
//   // Select elements
//   const toggleButton = document.getElementById("chatbox-toggle");
//   const chatbox = document.getElementById("chatbox");
//   const userInput = document.getElementById("user-input");
//   const sendBtn = document.getElementById("send-btn");
//   const chatHistory = document.getElementById("chat-history");

//   fetchApiKey();

//   // Toggle chatbox open/close
//   if (toggleButton && chatbox) {
//     toggleButton.addEventListener("click", function () {
//       chatbox.classList.toggle("open");
//     });
//   }

//   // Handle user input and send message when 'Enter' is pressed
//   if (userInput) {
//     userInput.addEventListener("keypress", function (e) {
//       if (e.key === "Enter") {
//         const inputText = userInput.value;
//         if (inputText.trim()) {
//           appendMessage(inputText, "user-message");
//           userInput.value = ""; // Clear input after sending
//           processCommand(inputText);
//         }
//       }
//     });
//   }

//   // Handle send button click
//   if (sendBtn) {
//     sendBtn.addEventListener("click", function () {
//       const inputText = userInput.value;
//       if (inputText.trim()) {
//         appendMessage(inputText, "user-message");
//         userInput.value = "";
//         processCommand(inputText);
//       }
//     });
//   }

//   // Function to append messages to chat history
//   function appendMessage(message, type) {
//     const messageDiv = document.createElement("div");
//     messageDiv.classList.add("chat-message", type);
//     messageDiv.textContent = message;
//     chatHistory.appendChild(messageDiv);
//     chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to latest message
//   }

//   // Fetch API key from Firestore
//   async function fetchApiKey() {
//     try {
//       const docRef = doc(db, "apikey", "googleapi");
//       const docSnap = await getDoc(docRef);

//       if (docSnap.exists()) {
//         GEMINI_API_KEY = docSnap.data().key;
//       } else {
//         console.error("No API key found in Firestore!");
//       }
//     } catch (error) {
//       console.error("Error fetching API key:", error);
//     }
//   }

//   // Function to process user command
//   async function processCommand(userInput) {
//     // Check if the input is asking how to add an event
//     if (userInput.toLowerCase().includes("how do i add an event")) {
//       appendMessage(
//         "You can add an event using the format: `add event: <event>, <month/day>, <time 00:00 am/pm>`.",
//         "bot-message"
//       );
//       return;
//     }

//     // Check if the input is "add event:"
//     if (userInput.toLowerCase().startsWith("add event:")) {
//       const details = userInput.replace("add event:", "").trim();
//       const { title, date, time } = parseEventDetails(details);

//       // If parsing failed, display an error message
//       if (!title || !date || !time) {
//         appendMessage(
//           "❌ Invalid format! Please follow the format: `add event: <event>, <month/day>, <time 00:00 am/pm>`.",
//           "bot-message"
//         );
//         return;
//       }

//       await addEvent(title, date, time);
//     }

//     // Otherwise, process other chatbot responses
//     else {
//       callGeminiAPI(userInput);
//     }
//   }

//   // Function to parse event details
//   function parseEventDetails(details) {
//     const parts = details.trim().split(",");
//     if (parts.length !== 3) return {}; // Ensure there are exactly three parts: title, date, and time

//     const title = parts[0].trim();
//     const date = parts[1].trim();
//     const time = parts[2].trim();

//     return { title, date, time };
//   }

//   // Function to format date and time
//   function formatDateAndTime(date, time) {
//     // Parse date
//     const dateParts = date.split(" ");
//     const month =
//       new Date(Date.parse(dateParts[0] + " 1, 2025")).getMonth() + 1; // Get month as number
//     const day = parseInt(dateParts[1]);
//     const year = new Date().getFullYear();

//     // Format date as YYYY-MM-DD
//     const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
//       day
//     ).padStart(2, "0")}`;

//     // Convert time to 24-hour format
//     const timeParts = time.split(/[: ]/); // Split by colon and space
//     let hours = parseInt(timeParts[0]);
//     const minutes = timeParts[1];
//     const ampm = timeParts[2].toUpperCase();

//     if (ampm === "PM" && hours !== 12) hours += 12; // Convert PM time to 24-hour format
//     if (ampm === "AM" && hours === 12) hours = 0; // Convert 12 AM to 00:xx

//     const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;

//     return { formattedDate, formattedTime };
//   }

//   // Function to add event to Firestore
//   async function addEvent(title, date, time) {
//     if (!title || !date || !time) {
//       appendMessage(
//         "❌ Missing title, date, or time. Please follow the format: `add event: <title>, <date>, <time>`.",
//         "bot-message"
//       );
//       return;
//     }

//     const { formattedDate, formattedTime } = formatDateAndTime(date, time);

//     try {
//       await addDoc(collection(db, "events"), {
//         title,
//         date: formattedDate,
//         time: formattedTime,
//       });
//       appendMessage("✅ Event added successfully!", "bot-message");
//     } catch (e) {
//       console.error("Error adding event:", e);
//       appendMessage("❌ Error adding event.", "bot-message");
//     }
//   }

//   // Call the Gemini API
//   async function callGeminiAPI(userInput) {
//     if (!GEMINI_API_KEY) {
//       console.error("❌ API key is not loaded yet!");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: userInput,
//                   },
//                 ],
//               },
//             ],
//           }),
//         }
//       );

//       // Check for errors in the response
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("API Request Failed:", response.status, errorText);
//         return;
//       }

//       // Parse the API response
//       const data = await response.json();

//       // Check if the candidates array exists and contains valid content
//       if (data && data.candidates && data.candidates.length > 0) {
//         const chatbotResponse =
//           data.candidates[0].content?.parts[0]?.text ||
//           "No content found in the response.";
//         appendMessage(`${chatbotResponse}`, "bot-message");
//       } else {
//         console.error("❌ No candidates found in the API response");
//       }
//     } catch (error) {
//       console.error("❌ Failed to fetch from Gemini API:", error);
//     }
//   }
// });

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth();
let currentUserId = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
  } else {
    currentUserId = null;
  }
});

let GEMINI_API_KEY = "";

document.addEventListener("DOMContentLoaded", function () {
  // Select elements
  const toggleButton = document.getElementById("chatbox-toggle");
  const chatbox = document.getElementById("chatbox");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const chatHistory = document.getElementById("chat-history");

  fetchApiKey();

  // Toggle chatbox open/close
  if (toggleButton && chatbox) {
    toggleButton.addEventListener("click", function () {
      chatbox.classList.toggle("open");
    });
  }

  // Handle user input and send message when 'Enter' is pressed
  if (userInput) {
    userInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const inputText = userInput.value;
        if (inputText.trim()) {
          appendMessage(inputText, "user-message");
          userInput.value = ""; // Clear input after sending
          processCommand(inputText);
        }
      }
    });
  }

  // Handle send button click
  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      const inputText = userInput.value;
      if (inputText.trim()) {
        appendMessage(inputText, "user-message");
        userInput.value = "";
        processCommand(inputText);
      }
    });
  }

  // Function to append messages to chat history
  function appendMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", type);
    messageDiv.textContent = message;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to latest message
  }

  // Fetch API key from Firestore
  async function fetchApiKey() {
    try {
      const docRef = doc(db, "apikey", "googleapi");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        GEMINI_API_KEY = docSnap.data().key;
      } else {
        console.error("No API key found in Firestore!");
      }
    } catch (error) {
      console.error("Error fetching API key:", error);
    }
  }

  // Function to process user command
  async function processCommand(userInput) {
    // Check if the input is asking how to add an event
    if (userInput.toLowerCase().includes("how do i add an event")) {
      appendMessage(
        "You can add an event using the format: `add event: <event>, <month/day>, <time 00:00 am/pm>`.",
        "bot-message"
      );
      return;
    }

    // Check if the input is "add event:"
    if (userInput.toLowerCase().startsWith("add event:")) {
      const details = userInput.replace("add event:", "").trim();
      const { title, date, time } = parseEventDetails(details);

      // If parsing failed, display an error message
      if (!title || !date || !time) {
        appendMessage(
          "❌ Invalid format! Please follow the format: `add event: <event>, <month/day>, <time 00:00 am/pm>`.",
          "bot-message"
        );
        return;
      }

      await addEvent(title, date, time);
    }

    // Otherwise, process other chatbot responses
    else {
      callGeminiAPI(userInput);
    }
  }

  // Function to parse event details
  function parseEventDetails(details) {
    const parts = details.trim().split(",");
    if (parts.length !== 3) return {}; // Ensure there are exactly three parts: title, date, and time

    const title = parts[0].trim();
    const date = parts[1].trim();
    const time = parts[2].trim();

    return { title, date, time };
  }

  // Function to format date and time
  function formatDateAndTime(date, time) {
    // Parse date
    const dateParts = date.split(" ");
    const month =
      new Date(Date.parse(dateParts[0] + " 1, 2025")).getMonth() + 1; // Get month as number
    const day = parseInt(dateParts[1]);
    const year = new Date().getFullYear();

    // Format date as YYYY-MM-DD
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    // Convert time to 24-hour format
    const timeParts = time.split(/[: ]/); // Split by colon and space
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = timeParts[2].toUpperCase();

    if (ampm === "PM" && hours !== 12) hours += 12; // Convert PM time to 24-hour format
    if (ampm === "AM" && hours === 12) hours = 0; // Convert 12 AM to 00:xx

    const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;

    return { formattedDate, formattedTime };
  }

  // Function to add event to Firestore
  async function addEvent(title, date, time) {
    if (!title || !date || !time) {
      appendMessage(
        "❌ Missing title, date, or time. Please use: `add event: <title>, <date>, <time>`.",
        "bot-message"
      );
      return;
    }

    const { formattedDate, formattedTime } = formatDateAndTime(date, time);

    try {
      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("userId", "==", currentUserId),
        where("title", "==", title)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If the event already exists for this user, update it
        querySnapshot.forEach(async (eventDoc) => {
          const eventRef = doc(db, "events", eventDoc.id);
          await updateDoc(eventRef, {
            date: formattedDate,
            time: formattedTime,
          });
        });

        appendMessage("✅ Event updated successfully!", "bot-message");
      } else {
        // Otherwise, add a new event for this user
        await addDoc(eventsRef, {
          userId: currentUserId, // Associate event with user
          title,
          date: formattedDate,
          time: formattedTime,
        });

        appendMessage("✅ Event added successfully!", "bot-message");
      }
    } catch (e) {
      console.error("Error adding/updating event:", e);
      appendMessage("❌ Error saving event.", "bot-message");
    }
  }

  // Call the Gemini API
  async function callGeminiAPI(userInput) {
    if (!GEMINI_API_KEY) {
      console.error("❌ API key is not loaded yet!");
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: userInput,
                  },
                ],
              },
            ],
          }),
        }
      );

      // Check for errors in the response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Request Failed:", response.status, errorText);
        return;
      }

      // Parse the API response
      const data = await response.json();

      // Check if the candidates array exists and contains valid content
      if (data && data.candidates && data.candidates.length > 0) {
        const chatbotResponse =
          data.candidates[0].content?.parts[0]?.text ||
          "No content found in the response.";
        appendMessage(`${chatbotResponse}`, "bot-message");
      } else {
        console.error("❌ No candidates found in the API response");
      }
    } catch (error) {
      console.error("❌ Failed to fetch from Gemini API:", error);
    }
  }
});
