// =====================================================
// FIREBASE APP
// APLIKASI PELANGGARAN SISWA
// SMAN 2 RANGKASBITUNG
// TAHAP 4
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
  deleteDoc,
  serverTimestamp
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
// DATA GDS
// =====================================================

let userAktif = null;

let dataSiswa = [];

let dataJenisPelanggaran = [];

let siswaTerpilih = null;


// =====================================================
// DATA GURU
// =====================================================

let semuaPelanggaran = [];

let rankingSiswa = [];

let siswaDetailAktif = null;


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

      loginMessage.textContent = "";

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
// AUTH STATE
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


      userAktif = {

        uid:
          user.uid,

        email:
          user.email,

        nama:
          userData.nama ||
          user.email,

        role:
          userData.role

      };


      if (
        userAktif.role ===
        "gds"
      ) {

        showGds(
          userAktif.nama
        );

        await loadMasterFirebase();

        resetFormPelanggaran();

      }

      else if (
        userAktif.role ===
        "guru"
      ) {

        showGuru(
          userAktif.nama
        );

        await loadDashboardGuru();

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
        "Auth state error:",
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
// LOGOUT
// =====================================================

document
  .getElementById("logoutGds")
  .addEventListener(
    "click",
    async function() {

      await signOut(auth);

    }
  );


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
      collection(
        db,
        "siswa"
      )
    );


  dataSiswa = [];


  snapshot.forEach(
    function(docSnapshot) {

      const data =
        docSnapshot.data();


      dataSiswa.push({

        id:
          docSnapshot.id,

        nama:
          data.nama || "",

        nisn:
          data.nisn || "",

        kelas:
          data.kelas || ""

      });

    }
  );


  dataSiswa.sort(
    function(a, b) {

      return a.nama.localeCompare(
        b.nama,
        "id"
      );

    }
  );
}


// =====================================================
// LOAD MASTER PELANGGARAN
// =====================================================

async function
ambilJenisPelanggaranFirebase() {

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

        id:
          docSnapshot.id,

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
}


// =====================================================
// LOAD MASTER
// =====================================================

async function loadMasterFirebase() {

  try {

    await ambilDataSiswaFirebase();

    await ambilJenisPelanggaranFirebase();

  }

  catch (error) {

    console.error(
      "Gagal load master:",
      error
    );

    const formMessage =
      document.getElementById(
        "formMessage"
      );

    formMessage.textContent =
      "Gagal mengambil data Firebase.";

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
            ${escapeHtml(
              siswa.nama
            )}
          </strong>

          <small>
            NISN:
            ${escapeHtml(
              siswa.nisn
            )}
            |
            Kelas:
            ${escapeHtml(
              siswa.kelas
            )}
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
      "namasiswaTerpilih"
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


  searchSiswa.value = "";

  hasilSiswa.innerHTML = "";

  searchSiswa.disabled = true;
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

      siswaTerpilih = null;

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
      dataJenisPelanggaran.filter(
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


    rincianPelanggaran.innerHTML = `
      <option value="">
        Pilih rincian pelanggaran
      </option>
    `;


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


        rincianPelanggaran
          .appendChild(
            option
          );

      }
    );


    if (daftar.length === 0) {

      rincianPelanggaran.innerHTML += `
        <option value="">
          Belum ada rincian untuk jenis ini
        </option>
      `;
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

      tampilkanPesanForm(
        "Silakan pilih siswa terlebih dahulu.",
        "error"
      );

      return;
    }


    if (
      !userAktif ||
      userAktif.role !== "gds"
    ) {

      tampilkanPesanForm(
        "Anda tidak memiliki akses sebagai Petugas GDS.",
        "error"
      );

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


    const rincianid =
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
      !rincianid ||
      !waktu
    ) {

      tampilkanPesanForm(
        "Semua data pelanggaran harus diisi.",
        "error"
      );

      return;
    }


    const option =
      rincianPelanggaran.options[
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


    try {

      await addDoc(
        collection(
          db,
          "pelanggaran"
        ),
        {

          siswaid:
            siswaTerpilih.id,

          namasiswa:
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

          rincianid:
            rincianid,

          waktu:
            waktu,

          bobot:
            bobot,

          petugasid:
            userAktif.uid,

          petugasnama:
            userAktif.nama,

          createdat:
            serverTimestamp()

        }
      );


      tampilkanPesanForm(
        "Pelanggaran berhasil disimpan.",
        "success"
      );


      resetFormSetelahSimpan();

    }

    catch (error) {

      console.error(
        "Gagal menyimpan:",
        error
      );


      tampilkanPesanForm(
        "Gagal menyimpan data: "
        + error.message,
        "error"
      );

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
// PESAN FORM
// =====================================================

function tampilkanPesanForm(
  pesan,
  tipe
) {

  formMessage.textContent =
    pesan;

  formMessage.className =
    "message " + tipe;
}


// =====================================================
// RESET FORM
// =====================================================

function resetFormSetelahSimpan() {

  document
    .getElementById(
      "tanggal"
    )
    .value = "";

  jenisPelanggaran.value = "";

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
    .value = "";
}


function resetFormPelanggaran() {

  siswaTerpilih = null;

  searchSiswa.disabled =
    false;

  searchSiswa.value = "";

  hasilSiswa.innerHTML = "";

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
    .value = "";

  jenisPelanggaran.value = "";

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
    .value = "";

  formMessage.textContent = "";
}


// =====================================================
// =====================================================
//                 DASHBOARD GURU
// =====================================================
// =====================================================


// =====================================================
// LOAD SEMUA PELANGGARAN
// =====================================================

async function loadDashboardGuru() {

  const loading =
    document.getElementById(
      "loadingGuru"
    );


  loading.classList.remove(
    "hidden"
  );


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "pelanggaran"
        )
      );


    semuaPelanggaran = [];


    snapshot.forEach(
      function(docSnapshot) {

        const data =
          docSnapshot.data();


        semuaPelanggaran.push({

          id:
            docSnapshot.id,

          siswaid:
            data.siswaid || "",

          namasiswa:
            data.namasiswa || "",

          nisn:
            data.nisn || "",

          kelas:
            data.kelas || "",

          tanggal:
            data.tanggal || "",

          jenis:
            String(
              data.jenis || ""
            ).toLowerCase(),

          rincian:
            data.rincian || "",

          waktu:
            data.waktu || "",

          bobot:
            Number(
              data.bobot || 0
            ),

          petugasnama:
            data.petugasnama || ""

        });

      }
    );


    buatFilterKelas();


    tampilkanRanking();


  }

  catch (error) {

    console.error(
      "Gagal mengambil data pelanggaran:",
      error
    );


    loading.textContent =
      "Gagal mengambil data pelanggaran.";

  }

  finally {

    loading.classList.add(
      "hidden"
    );

  }

}


// =====================================================
// BUAT FILTER KELAS
// =====================================================

function buatFilterKelas() {

  const select =
    document.getElementById(
      "filterKelas"
    );


  const kelasSet =
    new Set();


  semuaPelanggaran.forEach(
    function(item) {

      if (item.kelas) {

        kelasSet.add(
          item.kelas
        );

      }

    }
  );


  const kelasArray =
    Array.from(
      kelasSet
    ).sort(
      function(a, b) {

        return a.localeCompare(
          b,
          "id"
        );

      }
    );


  select.innerHTML = `
    <option value="">
      Semua Kelas
    </option>
  `;


  kelasArray.forEach(
    function(kelas) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        kelas;

      option.textContent =
        kelas;

      select.appendChild(
        option
      );

    }
  );

}


// =====================================================
// FILTER
// =====================================================

document
  .getElementById(
    "filterKelas"
  )
  .addEventListener(
    "change",
    function() {

      tampilkanRanking();

    }
  );


document
  .getElementById(
    "filterTanggal"
  )
  .addEventListener(
    "change",
    function() {

      tampilkanRanking();

    }
  );


document
  .getElementById(
    "btnResetFilter"
  )
  .addEventListener(
    "click",
    function() {

      document
        .getElementById(
          "filterKelas"
        )
        .value = "";

      document
        .getElementById(
          "filterTanggal"
        )
        .value = "";

      tampilkanRanking();

    }
  );


document
  .getElementById(
    "btnRefreshGuru"
  )
  .addEventListener(
    "click",
    async function() {

      await loadDashboardGuru();

    }
  );


// =====================================================
// PROSES RANKING
// =====================================================

function prosesRanking() {

  const kelas =
    document
      .getElementById(
        "filterKelas"
      )
      .value;


  const tanggal =
    document
      .getElementById(
        "filterTanggal"
      )
      .value;


  let data =
    [...semuaPelanggaran];


  if (kelas) {

    data =
      data.filter(
        function(item) {

          return item.kelas ===
            kelas;

        }
      );

  }


  if (tanggal) {

    data =
      data.filter(
        function(item) {

          return item.tanggal ===
            tanggal;

        }
      );

  }


  const kelompok =
    {};


  data.forEach(
    function(item) {

      const key =
        item.siswaid ||
        item.nisn ||
        item.namasiswa;


      if (!kelompok[key]) {

        kelompok[key] = {

          siswaid:
            item.siswaid,

          namasiswa:
            item.namasiswa,

          nisn:
            item.nisn,

          kelas:
            item.kelas,

          ringan: 0,

          sedang: 0,

          berat: 0,

          totalBobot: 0,

          jumlahPelanggaran: 0

        };

      }


      kelompok[key]
        .jumlahPelanggaran++;


      kelompok[key]
        .totalBobot +=
          item.bobot;


      if (
        item.jenis ===
        "ringan"
      ) {

        kelompok[key].ringan++;

      }

      else if (
        item.jenis ===
        "sedang"
      ) {

        kelompok[key].sedang++;

      }

      else if (
        item.jenis ===
        "berat"
      ) {

        kelompok[key].berat++;

      }

    }
  );


  rankingSiswa =
    Object.values(
      kelompok
    );


  rankingSiswa.sort(
    function(a, b) {

      if (
        b.totalBobot !==
        a.totalBobot
      ) {

        return (
          b.totalBobot -
          a.totalBobot
        );

      }


      return a.namasiswa.localeCompare(
        b.namasiswa,
        "id"
      );

    }
  );


  return rankingSiswa;

}


// =====================================================
// TAMPILKAN RANKING
// =====================================================

function tampilkanRanking() {

  const data =
    prosesRanking();


  const container =
    document.getElementById(
      "rankingContainer"
    );


  const totalSiswa =
    document.getElementById(
      "totalSiswa"
    );


  const totalPelanggaran =
    document.getElementById(
      "totalPelanggaran"
    );


  const totalBobot =
    document.getElementById(
      "totalBobot"
    );


  const totalPelanggaranFilter =
    semuaPelanggaran.filter(
      function(item) {

        const kelas =
          document
            .getElementById(
              "filterKelas"
            )
            .value;

        const tanggal =
          document
            .getElementById(
              "filterTanggal"
            )
            .value;


        return (
          (!kelas ||
            item.kelas === kelas)
          &&
          (!tanggal ||
            item.tanggal === tanggal)
        );

      }
    );


  totalSiswa.textContent =
    data.length;


  totalPelanggaran.textContent =
    totalPelanggaranFilter.length;


  totalBobot.textContent =
    totalPelanggaranFilter.reduce(
      function(total, item) {

        return total + item.bobot;

      },
      0
    );


  if (data.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        Belum ada data pelanggaran.
      </div>
    `;

    return;
  }


  let html = `

    <table class="ranking-table">

      <thead>

        <tr>

          <th>
            Rank
          </th>

          <th>
            Siswa
          </th>

          <th>
            Kelas
          </th>

          <th>
            Ringan
          </th>

          <th>
            Sedang
          </th>

          <th>
            Berat
          </th>

          <th>
            Total
          </th>

        </tr>

      </thead>

      <tbody>

  `;


  data.forEach(
    function(item, index) {

      html += `

        <tr
          data-siswa-id="${escapeHtml(
            item.siswaid
          )}"
        >

          <td>

            <span class="rank-number">
              ${index + 1}
            </span>

          </td>


          <td class="nama-cell">

            ${escapeHtml(
              item.namasiswa
            )}

          </td>


          <td>

            ${escapeHtml(
              item.kelas
            )}

          </td>


          <td>
            ${item.ringan}
          </td>


          <td>
            ${item.sedang}
          </td>


          <td>
            ${item.berat}
          </td>


          <td>

            <span class="total-bobot">
              ${item.totalBobot}
            </span>

          </td>

        </tr>

      `;

    }
  );


  html += `

      </tbody>

    </table>

  `;


  container.innerHTML =
    html;


  const rows =
    container.querySelectorAll(
      "tbody tr"
    );


  rows.forEach(
    function(row) {

      row.addEventListener(
        "click",
        function() {

          const siswaid =
            row.dataset.siswaid;


          bukaDetailSiswa(
            siswaid
          );

        }
      );

    }
  );

}


// =====================================================
// DETAIL SISWA
// =====================================================

function bukaDetailSiswa(
  siswaid
) {

  const data =
    semuaPelanggaran.filter(
      function(item) {

        return item.siswaid ===
          siswaid;

      }
    );


  if (data.length === 0) {

    return;
  }


  siswaDetailAktif =
    siswaid;


  const siswa =
    data[0];


  document
    .getElementById(
      "detailnamasiswa"
    )
    .textContent =
      siswa.namasiswa;


  document
    .getElementById(
      "detailInfoSiswa"
    )
    .textContent =
      "NISN: "
      + siswa.nisn
      + " | Kelas: "
      + siswa.kelas;


  const container =
    document.getElementById(
      "detailPelanggaranContainer"
    );


  data.sort(
    function(a, b) {

      if (
        a.tanggal !==
        b.tanggal
      ) {

        return b.tanggal.localeCompare(
          a.tanggal
        );

      }


      return b.waktu.localeCompare(
        a.waktu
      );

    }
  );


  let html = `

    <div class="table-wrapper">

      <table class="detail-table">

        <thead>

          <tr>

            <th>
              Tanggal
            </th>

            <th>
              Waktu
            </th>

            <th>
              Jenis
            </th>

            <th>
              Rincian
            </th>

            <th>
              Bobot
            </th>

            <th>
              Petugas
            </th>

            <th>
              Aksi
            </th>

          </tr>

        </thead>

        <tbody>

  `;


  data.forEach(
    function(item) {

      html += `

        <tr>

          <td>
            ${formatTanggal(
              item.tanggal
            )}
          </td>

          <td>
            ${escapeHtml(
              item.waktu
            )}
          </td>

          <td>
            ${formatJenis(
              item.jenis
            )}
          </td>

          <td>
            ${escapeHtml(
              item.rincian
            )}
          </td>

          <td class="bobot">
            ${item.bobot}
          </td>

          <td>
            ${escapeHtml(
              item.petugasnama
            )}
          </td>

          <td>

            <button
              class="delete-button"
              data-id="${escapeHtml(
                item.id
              )}"
            >
              Hapus
            </button>

          </td>

        </tr>

      `;

    }
  );


  html += `

        </tbody>

      </table>

    </div>

  `;


  container.innerHTML =
    html;


  document
    .getElementById(
      "detailSiswaCard"
    )
    .classList
    .remove("hidden");


  const deleteButtons =
    container.querySelectorAll(
      ".delete-button"
    );


  deleteButtons.forEach(
    function(button) {

      button.addEventListener(
        "click",
        async function(event) {

          event.stopPropagation();


          const id =
            button.dataset.id;


          await hapusPelanggaran(
            id
          );

        }
      );

    }
  );


  document
    .getElementById(
      "detailSiswaCard"
    )
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

}


// =====================================================
// HAPUS PELANGGARAN
// =====================================================

async function hapusPelanggaran(
  id
) {

  if (
    !userAktif ||
    userAktif.role !== "guru"
  ) {

    alert(
      "Hanya Guru yang dapat menghapus data."
    );

    return;
  }


  const yakin =
    confirm(
      "Apakah Anda yakin ingin menghapus data pelanggaran ini?"
    );


  if (!yakin) {

    return;
  }


  try {

    await deleteDoc(
      doc(
        db,
        "pelanggaran",
        id
      )
    );


    alert(
      "Data pelanggaran berhasil dihapus."
    );


    await loadDashboardGuru();


    if (siswaDetailAktif) {

      bukaDetailSiswa(
        siswaDetailAktif
      );

    }

  }

  catch (error) {

    console.error(
      "Gagal menghapus:",
      error
    );


    alert(
      "Gagal menghapus data: "
      + error.message
    );

  }

}


// =====================================================
// TUTUP DETAIL
// =====================================================

document
  .getElementById(
    "btnTutupDetail"
  )
  .addEventListener(
    "click",
    function() {

      document
        .getElementById(
          "detailSiswaCard"
        )
        .classList
        .add("hidden");

      siswaDetailAktif =
        null;

    }
  );


// =====================================================
// FORMAT JENIS
// =====================================================

function formatJenis(
  jenis
) {

  if (jenis === "ringan") {

    return "Ringan";

  }


  if (jenis === "sedang") {

    return "Sedang";

  }


  if (jenis === "berat") {

    return "Berat";

  }


  return jenis;

}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(
  tanggal
) {

  if (!tanggal) {

    return "-";

  }


  const bagian =
    tanggal.split("-");


  if (bagian.length !== 3) {

    return tanggal;

  }


  return (
    bagian[2]
    + "/"
    + bagian[1]
    + "/"
    + bagian[0]
  );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
  value
) {

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
