import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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
const auth = getAuth(app);
auth.useDeviceLanguage();

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const biometricBtn = document.getElementById("biometric-login");
  const registerBtn = document.getElementById("register");
  const forgotPasswordBtn = document.getElementById("forgot-password");

  // Check if we're on the login page (index.html)
  if (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname.endsWith("/event-tracker/") ||
    window.location.pathname === "/"
  ) {
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            window.location.href = "events.html"; // Redirect to events page
          })
          .catch((error) => {
            alert(error.message);
          });
      });
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        const email = prompt("Enter email:");
        const password = prompt("Enter password:");

        createUserWithEmailAndPassword(auth, email, password)
          .then(() => alert("Registration successful!"))
          .catch((error) => {
            alert(error.message);
          });
      });
    }

    if (biometricBtn) {
      biometricBtn.addEventListener("click", async () => {
        try {
          // Check if WebAuthn is supported in the browser
          if (window.PublicKeyCredential) {
            const publicKey = {
              challenge: new Uint8Array([
                /* Random challenge from your server */
              ]),
              rp: {
                name: "Event Tracker",
              },
              user: {
                id: new Uint8Array([
                  /* User ID */
                ]),
                name: "user@example.com",
                displayName: "User",
              },
              pubKeyCredParams: [
                { type: "public-key", alg: "ES256" }, // Algorithm used for the credential
              ],
              timeout: 60000,
            };

            // Trigger biometric authentication
            const credential = await navigator.credentials.create({
              publicKey: publicKey,
            });

            // Redirect to events page after successful biometric login
            window.location.href = "/events.html";
          } else {
            alert("Biometric authentication not supported.");
          }
        } catch (error) {
          console.error("Biometric authentication failed:", error);
        }
      });
    }

    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener("click", () => {
        const email = prompt("Enter email to reset password:");

        sendPasswordResetEmail(auth, email)
          .then(() => {
            alert("Password reset email sent");
          })
          .catch((error) => {
            console.error("Error sending password reset email:", error);
            alert(error.message);
          });
      });
    }
  }

  // Handle user authentication state
  // onAuthStateChanged(auth, (user) => {
  //   console.log("Auth state changed:", user);
  //   if (user) {
  //     console.log("User is logged in:", user.email);
  //   } else {
  //     console.log("No user is logged in.");
  //   }
  // });

  // Handle logout functionality, only on events.html
  if (window.location.pathname.endsWith("events.html")) {
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        signOut(auth)
          .then(() => {
            window.location.href = "index.html";
          })
          .catch((error) => {
            console.error("Error logging out:", error);
          });
      });
    } else {
      console.log("Logout button not found");
    }
  }
});
