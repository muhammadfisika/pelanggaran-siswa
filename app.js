// =====================================================
// FIREBASE APP
// APLIKASI PELANGGARAN SISWA
// SMAN 2 RANGKASBITUNG
// TAHAP 3
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
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy
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
// DATA GLOBAL
// =====================================================

let userAktif = null;

let dataSiswa = [];

let dataJenisPelanggaran = [];

let siswaTerpilih = null;

let jenisTerpilih = null;


// =====================================================
// SHOW PAGE
// =====================================================

function showLogin() {

  loginPage.classList.remove("hidden");

  gdsPage.classList.add("hidden");

  guruPage.classList.add("hidden");

}


function showGds(nama) {

  loginPage.classList.add("hidden");

  gdsPage.classList.remove("hidden");

  guruPage.classList.add("hidden");

  gdsUserName.textContent =
    "Login sebagai: " + nama;

}


function showGuru(nama) {

  loginPage.classList.add("hidden");

  gdsPage.classList.add("hidden");

  guruPage.classList.remove("hidden");

  guruUserName.textContent =
    "Login sebagai: " + nama;

}


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const email =
      document
        .getElementById("email")
        .value
        .trim();


    const password =
      document
        .getElementById("password")
        .value;


    loginMessage.textContent =
      "Sedang login...";


    loginMessage.className =
      "message";


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      loginMessage.textContent =
        "";

    }

    catch (error) {

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

      loginMessage.className =
        "message error";

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

      userAktif = null;

      showLogin();

      return;

    }


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

        await signOut(auth);

        showLogin();

        loginMessage.textContent =
          "Data role pengguna belum dibuat.";

        loginMessage.className =
          "message error";

        return;

      }


      const userData =
        userSnap.data();


      const role =
        userData.role;


      const nama =
        userData.nama ||
        user.email;


      userAktif = {

        uid: user.uid,

        email: user.email,

        nama: nama,

        role: role

      };


      if (role === "gds") {

        showGds(nama);

        await loadMasterFirebase();

        resetFormPelanggaran();

      }

      else if (role === "guru") {

        showGuru(nama);

      }

      else {

        await signOut(auth);

        showLogin();

        loginMessage.textContent =
          "Role pengguna tidak valid.";

        loginMessage.className =
          "message error";

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

      loginMessage.className =
        "message error";

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

      await signOut(auth);

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

      await signOut(auth);

    }
  );


// =====================================================
// LOAD MASTER SISWA
// =====================================================

async function ambilDataSiswaFirebase() {

  const snapshot =
    await getDocs(
      collection(db, "siswa")
    );


  dataSiswa = [];


  snapshot.forEach(
    function(docSnapshot) {

      const data =
        docSnapshot.data();


      dataSiswa.push({

        id: docSnapshot.id,

        nama: data.nama || "",

        nisn: data.nisn || "",

        kelas: data.kelas || ""

      });

    }
  );


  dataSiswa.sort(
    function(a, b) {

      return a.nama
        .localeCompare(
          b.nama,
          "id"
        );

    }
  );


  console.log(
    "Data siswa:",
    dataSiswa
  );

}


// =====================================================
// LOAD MASTER PELANGGARAN
// =====================================================

async function ambilJenisPelanggaranFirebase() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "jenis_pelanggaran"
      )
    );


  dataJenisPelanggaran = [];


  snapshot.forEach(
    function(docSnapshot) {

      const data =
        docSnapshot.data();


      dataJenisPelanggaran.push({

        id: docSnapshot.id,

        nama:
          data.nama || "",

        jenis:
          String(
            data.jenis || ""
          ).toLowerCase(),

        bobot:
          Number(
            data.bobot || 0
          )

      });

    }
  );


  console.log(
    "Jenis pelanggaran:",
    dataJenisPelanggaran
  );

}


// =====================================================
// LOAD MASTER
// =====================================================

async function loadMasterFirebase() {

  try {

    await ambilDataSiswaFirebase();

    await ambilJenisPelanggaranFirebase();


    console.log(
      "Master Firebase berhasil dimuat."
    );

  }

  catch (error) {

    console.error(
      "Gagal memuat master Firebase:",
      error
    );

    const formMessage =
      document.getElementById(
        "formMessage"
      );


    formMessage.textContent =
      "Gagal mengambil data master Firebase.";

    formMessage.className =
      "message error";

  }

}


// =====================================================
// PENCARIAN SISWA
// =====================================================

const searchSiswa =
  document.getElementById(
    "searchSiswa"
  );


const hasilSiswa =
  document.getElementById(
    "hasilSiswa"
  );


searchSiswa.addEventListener(
  "input",
  function() {

    const keyword =
      searchSiswa.value
        .trim()
        .toLowerCase();


    hasilSiswa.innerHTML =
      "";


    if (!keyword) {

      return;

    }


    if (dataSiswa.length === 0) {

      hasilSiswa.innerHTML = `
        <div class="no-result">
          Data siswa belum tersedia.
        </div>
      `;

      return;

    }


    const hasil =
      dataSiswa
        .filter(
          function(siswa) {

            return (
              siswa.nama
                .toLowerCase()
                .includes(keyword)
              ||
              siswa.nisn
                .toLowerCase()
                .includes(keyword)
            );

          }
        )
        .slice(0, 10);


    if (hasil.length === 0) {

      hasilSiswa.innerHTML = `
        <div class="no-result">
          Siswa tidak ditemukan.
        </div>
      `;

      return;

    }


    hasil.forEach(
      function(siswa) {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "student-result";


        item.innerHTML = `

          <strong>
            ${escapeHtml(siswa.nama)}
          </strong>

          <small>
            NISN: ${escapeHtml(siswa.nisn)}
            &nbsp; | &nbsp;
            Kelas: ${escapeHtml(siswa.kelas)}
          </small>

        `;


        item.addEventListener(
          "click",
          function() {

            pilihSiswa(siswa);

          }
        );


        hasilSiswa.appendChild(
          item
        );

      }
    );

  }
);


// =====================================================
// PILIH SISWA
// =====================================================

function pilihSiswa(siswa) {

  siswaTerpilih =
    siswa;


  document
    .getElementById(
      "namaSiswaTerpilih"
    )
    .textContent =
      siswa.nama;


  document
    .getElementById(
      "infoSiswaTerpilih"
    )
    .textContent =
      "NISN: "
      + siswa.nisn
      + " | Kelas: "
      + siswa.kelas;


  document
    .getElementById(
      "siswaTerpilih"
    )
    .classList
    .remove("hidden");


  document
    .getElementById(
      "pelanggaranForm"
    )
    .classList
    .remove("hidden");


  searchSiswa.value =
    "";


  hasilSiswa.innerHTML =
    "";


  searchSiswa.disabled =
    true;


  document
    .getElementById(
      "tanggal"
    )
    .focus();

}


// =====================================================
// GANTI SISWA
// =====================================================

document
  .getElementById(
    "ubahSiswa"
  )
  .addEventListener(
    "click",
    function() {

      siswaTerpilih =
        null;


      document
        .getElementById(
          "siswaTerpilih"
        )
        .classList
        .add("hidden");


      document
        .getElementById(
          "pelanggaranForm"
        )
        .classList
        .add("hidden");


      searchSiswa.disabled =
        false;


      searchSiswa.focus();

    }
  );


// =====================================================
// JENIS PELANGGARAN
// =====================================================

const jenisPelanggaran =
  document.getElementById(
    "jenisPelanggaran"
  );


const rincianPelanggaran =
  document.getElementById(
    "rincianPelanggaran"
  );


const nilaiBobot =
  document.getElementById(
    "nilaiBobot"
  );


jenisPelanggaran.addEventListener(
  "change",
  function() {

    const jenis =
      jenisPelanggaran.value;


    jenisTerpilih =
      null;


    rincianPelanggaran.innerHTML =
      "";


    nilaiBobot.textContent =
      "-";


    if (!jenis) {

      rincianPelanggaran.disabled =
        true;


      rincianPelanggaran.innerHTML = `
        <option value="">
          Pilih jenis terlebih dahulu
        </option>
      `;

      return;

    }


    const daftar =
      dataJenisPelanggaran
        .filter(
          function(item) {

            return item.jenis ===
              jenis;

          }
        );


    const bobot =
      jenis === "ringan"
        ? 1
        : jenis === "sedang"
          ? 5
          : 10;


    nilaiBobot.textContent =
      bobot;


    rincianPelanggaran.disabled =
      false;


    const defaultOption =
      document.createElement(
        "option"
      );


    defaultOption.value =
      "";


    defaultOption.textContent =
      "Pilih rincian pelanggaran";


    rincianPelanggaran.appendChild(
      defaultOption
    );


    daftar.forEach(
      function(item) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          item.id;


        option.textContent =
          item.nama;


        option.dataset.nama =
          item.nama;


        option.dataset.bobot =
          item.bobot;


        rincianPelanggaran
          .appendChild(
            option
          );

      }
    );


    if (daftar.length === 0) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        "";


      option.textContent =
        "Belum ada rincian untuk jenis ini";


      rincianPelanggaran
        .appendChild(
          option
        );

    }

  }
);


// =====================================================
// SIMPAN PELANGGARAN
// =====================================================

const pelanggaranForm =
  document.getElementById(
    "pelanggaranForm"
  );


const formMessage =
  document.getElementById(
    "formMessage"
  );


pelanggaranForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    if (!siswaTerpilih) {

      formMessage.textContent =
        "Silakan pilih siswa terlebih dahulu.";

      formMessage.className =
        "message error";

      return;

    }


    if (!userAktif) {

      formMessage.textContent =
        "Sesi pengguna tidak ditemukan.";

      formMessage.className =
        "message error";

      return;

    }


    const tanggal =
      document
        .getElementById(
          "tanggal"
        )
        .value;


    const jenis =
      jenisPelanggaran.value;


    const rincianId =
      rincianPelanggaran.value;


    const waktu =
      document
        .getElementById(
          "waktu"
        )
        .value;


    if (
      !tanggal ||
      !jenis ||
      !rincianId ||
      !waktu
    ) {

      formMessage.textContent =
        "Semua data pelanggaran harus diisi.";

      formMessage.className =
        "message error";

      return;

    }


    const option =
      rincianPelanggaran
        .options[
          rincianPelanggaran.selectedIndex
        ];


    const namaRincian =
      option.dataset.nama ||
      option.textContent;


    const bobot =
      jenis === "ringan"
        ? 1
        : jenis === "sedang"
          ? 5
          : 10;


    const btnSimpan =
      document.getElementById(
        "btnSimpan"
      );


    btnSimpan.disabled =
      true;


    btnSimpan.textContent =
      "MENYIMPAN...";


    formMessage.textContent =
      "";


    try {

      await addDoc(
        collection(
          db,
          "pelanggaran"
        ),
        {

          siswaId:
            siswaTerpilih.id,

          namaSiswa:
            siswaTerpilih.nama,

          nisn:
            siswaTerpilih.nisn,

          kelas:
            siswaTerpilih.kelas,

          tanggal:
            tanggal,

          jenis:
            jenis,

          rincian:
            namaRincian,

          rincianId:
            rincianId,

          waktu:
            waktu,

          bobot:
            bobot,

          petugasId:
            userAktif.uid,

          petugasNama:
            userAktif.nama,

          createdAt:
            serverTimestamp()

        }
      );


      formMessage.textContent =
        "Pelanggaran berhasil disimpan.";

      formMessage.className =
        "message success";


      resetFormSetelahSimpan();

    }

    catch (error) {

      console.error(
        "Gagal menyimpan pelanggaran:",
        error
      );


      formMessage.textContent =
        "Gagal menyimpan data: "
        + error.message;

      formMessage.className =
        "message error";

    }

    finally {

      btnSimpan.disabled =
        false;

      btnSimpan.textContent =
        "SIMPAN PELANGGARAN";

    }

  }
);


// =====================================================
// RESET FORM SETELAH SIMPAN
// =====================================================

function resetFormSetelahSimpan() {

  document
    .getElementById(
      "tanggal"
    )
    .value =
      "";


  jenisPelanggaran.value =
    "";


  rincianPelanggaran.innerHTML = `
    <option value="">
      Pilih jenis terlebih dahulu
    </option>
  `;


  rincianPelanggaran.disabled =
    true;


  nilaiBobot.textContent =
    "-";


  document
    .getElementById(
      "waktu"
    )
    .value =
      "";


  jenisTerpilih =
    null;

}


// =====================================================
// RESET SEMUA FORM
// =====================================================

function resetFormPelanggaran() {

  siswaTerpilih =
    null;


  jenisTerpilih =
    null;


  searchSiswa.disabled =
    false;


  searchSiswa.value =
    "";


  hasilSiswa.innerHTML =
    "";


  document
    .getElementById(
      "siswaTerpilih"
    )
    .classList
    .add("hidden");


  document
    .getElementById(
      "pelanggaranForm"
    )
    .classList
    .add("hidden");


  document
    .getElementById(
      "tanggal"
    )
    .value =
      "";


  jenisPelanggaran.value =
    "";


  rincianPelanggaran.innerHTML = `
    <option value="">
      Pilih jenis terlebih dahulu
    </option>
  `;


  rincianPelanggaran.disabled =
    true;


  nilaiBobot.textContent =
    "-";


  document
    .getElementById(
      "waktu"
    )
    .value =
      "";


  formMessage.textContent =
    "";

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
