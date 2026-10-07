import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
} from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIGURATION
// =====================================================

const firebaseConfig = {

  apiKey: "MASUKKAN_API_KEY_ANDA",

  authDomain: "MASUKKAN_AUTH_DOMAIN_ANDA",

  projectId: "MASUKKAN_PROJECT_ID_ANDA",

  storageBucket: "MASUKKAN_STORAGE_BUCKET_ANDA",

  messagingSenderId: "MASUKKAN_MESSAGING_SENDER_ID_ANDA",

  appId: "MASUKKAN_APP_ID_ANDA"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// =====================================================
// TEST FIREBASE
// =====================================================

async function testFirebase() {

  const statusElement =
    document.getElementById("status");

  try {

    const snapshot = await getDocs(
      collection(db, "siswa")
    );

    statusElement.textContent =
      "Firebase berhasil terhubung. Data siswa: "
      + snapshot.size;

    statusElement.className = "success";

    console.log(
      "Firebase berhasil terhubung."
    );

    console.log(
      "Jumlah data siswa:",
      snapshot.size
    );

  } catch (error) {

    console.error(
      "Firebase Error:",
      error
    );

    statusElement.textContent =
      "Firebase gagal terhubung: "
      + error.message;

    statusElement.className = "error";

  }

}


// =====================================================
// START
// =====================================================

testFirebase();
