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
  apiKey: "AIzaSyAwsBj_5jJS1J4nQTXlp_88dnJaAh1FI58",
  authDomain: "pelanggaran-siswa-sman2.firebaseapp.com",
  projectId: "pelanggaran-siswa-sman2",
  storageBucket: "pelanggaran-siswa-sman2.firebasestorage.app",
  messagingSenderId: "62940952618",
  appId: "1:62940952618:web:10a06124346f778ed82b53"
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
