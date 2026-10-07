// =====================================================
// FIREBASE APP
// APLIKASI PELANGGARAN SISWA
// SMAN 2 RANGKASBITUNG
// =====================================================


import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";


import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


import {
  getFirestore,
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
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

const app =
  initializeApp(firebaseConfig);


const auth =
  getAuth(app);


const db =
  getFirestore(app);


// =====================================================
// ELEMENT
// =====================================================

const loginPage =
  document.getElementById("loginPage");

const gdsPage =
  document.getElementById("gdsPage");

const guruPage =
  document.getElementById("guruPage");

const loginForm =
  document.getElementById("loginForm");

const loginMessage =
  document.getElementById("loginMessage");

const gdsUserName =
  document.getElementById("gdsUserName");

const guruUserName =
  document.getElementById("guruUserName");


// =====================================================
// SHOW PAGE
// =====================================================

function showLogin() {

  loginPage.classList.remove("hidden");

  gdsPage.classList.add("hidden");

  guruPage.classList.add("hidden");

}


function showGds(name) {

  loginPage.classList.add("hidden");

  gdsPage.classList.remove("hidden");

  guruPage.classList.add("hidden");

  gdsUserName.textContent =
    "Login sebagai: " + name;

}


function showGuru(name) {

  loginPage.classList.add("hidden");

  gdsPage.classList.add("hidden");

  guruPage.classList.remove("hidden");

  guruUserName.textContent =
    "Login sebagai: " + name;

}


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const email =
      document.getElementById("email")
        .value
        .trim();

    const password =
      document.getElementById("password")
        .value;


    loginMessage.textContent =
      "Sedang login...";


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      loginMessage.textContent =
        "";

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );


      let message =
        "Login gagal.";


      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        message =
          "Email atau password salah.";

      }

      else if (
        error.code ===
        "auth/user-not-found"
      ) {

        message =
          "Akun tidak ditemukan.";

      }

      else if (
        error.code ===
        "auth/wrong-password"
      ) {

        message =
          "Password salah.";

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        message =
          "Format email tidak valid.";

      }

      else {

        message =
          error.message;

      }


      loginMessage.textContent =
        message;

    }

  }
);


// =====================================================
// CEK USER LOGIN
// =====================================================

onAuthStateChanged(
  auth,
  async function(user) {

    if (!user) {

      showLogin();

      return;

    }


    console.log(
      "User login:",
      user.email
    );


    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const userSnap =
        await getDoc(userRef);


      if (!userSnap.exists()) {

        console.error(
          "Data role user tidak ditemukan."
        );


        await signOut(auth);

        showLogin();

        loginMessage.textContent =
          "Data role pengguna belum dibuat.";

        return;

      }


      const userData =
        userSnap.data();


      const role =
        userData.role;


      const nama =
        userData.nama || user.email;


      console.log(
        "Role:",
        role
      );


      if (role === "gds") {

        showGds(nama);

      }

      else if (role === "guru") {

        showGuru(nama);

      }

      else {

        console.error(
          "Role tidak dikenali:",
          role
        );


        await signOut(auth);

        showLogin();

        loginMessage.textContent =
          "Role pengguna tidak valid.";

      }

    }

    catch (error) {

      console.error(
        "Gagal mengambil data user:",
        error
      );


      await signOut(auth);

      showLogin();

      loginMessage.textContent =
        "Gagal membaca data pengguna.";

    }

  }
);


// =====================================================
// LOGOUT GDS
// =====================================================

document
  .getElementById("logoutGds")
  .addEventListener(
    "click",
    async function() {

      try {

        await signOut(auth);

      }

      catch (error) {

        console.error(
          "Logout Error:",
          error
        );

      }

    }
  );


// =====================================================
// LOGOUT GURU
// =====================================================

document
  .getElementById("logoutGuru")
  .addEventListener(
    "click",
    async function() {

      try {

        await signOut(auth);

      }

      catch (error) {

        console.error(
          "Logout Error:",
          error
        );

      }

    }
  );
