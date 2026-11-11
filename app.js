// GANTI DENGAN FIREBASE CONFIG ANDA
const firebaseConfig = {
    apiKey: "AIzaSyC2bt-bN0bnonX1ROPR-59G6cA4eo_xZ2A",
    authDomain: "jamur-esp.firebaseapp.com",
    databaseURL: "https://jamur-esp-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "jamur-esp",
    storageBucket: "jamur-esp.firebasestorage.app",
    messagingSenderId: "772846279758",
    appId: "1:772846279758:web:ca3f4a9396b1aa9409f71f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Elemen HTML
const suhuEl = document.getElementById('suhuVal');
const lembabEl = document.getElementById('lembabVal');
const statusPompaEl = document.getElementById('statusPompa');
const autoToggle = document.getElementById('autoToggle');
const manualToggle = document.getElementById('manualToggle');
const humidFill = document.getElementById('humidFill');
const suhuMarker = document.getElementById('suhuMarker');
const connStatus = document.getElementById('connStatus');
const connText = document.getElementById('connText');

// Rentang gambar jamur (sesuai SVG) dan skala suhu
const SHROOM_BOTTOM = 132, SHROOM_RANGE = 126;
const SUHU_MIN = 15, SUHU_MAX = 40;

function setHumidityLevel(pct) {
    const p = Math.max(0, Math.min(100, pct));
    const h = (p / 100) * SHROOM_RANGE;
    humidFill.setAttribute('y', SHROOM_BOTTOM - h);
    humidFill.setAttribute('height', h);
}

function setTempMarker(t) {
    const p = Math.max(0, Math.min(100, ((t - SUHU_MIN) / (SUHU_MAX - SUHU_MIN)) * 100));
    suhuMarker.style.left = p + '%';
    suhuMarker.style.opacity = 1;
}

// Status koneksi Firebase
db.ref('.info/connected').on('value', (snap) => {
    const online = snap.val() === true;
    connStatus.classList.toggle('online', online);
    connStatus.classList.toggle('offline', !online);
    connText.innerText = online ? 'Terhubung' : 'Terputus';
});

// Membaca Data Realtime
db.ref('monitoring').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.suhu != null) {
            suhuEl.innerText = Number(data.suhu).toFixed(1) + ' °C';
            setTempMarker(Number(data.suhu));
        } else {
            suhuEl.innerText = '-- °C';
        }
        if (data.kelembapan != null) {
            lembabEl.innerText = Number(data.kelembapan).toFixed(1) + ' %';
            setHumidityLevel(Number(data.kelembapan));
        } else {
            lembabEl.innerText = '-- %';
        }
    }
});

db.ref('status/pompa').on('value', (snapshot) => {
    const status = snapshot.val() || 'Mati';
    statusPompaEl.innerText = "Status Pompa: " + status;
    statusPompaEl.classList.toggle('on', /hidup|nyala|on/i.test(String(status)));
});

db.ref('kontrol').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        autoToggle.checked = data.mode_otomatis;
        manualToggle.checked = data.pompa_manual;

        // Matikan switch manual jika mode otomatis nyala
        manualToggle.disabled = data.mode_otomatis;
    }
});

// Mengirim Perintah ke Firebase
function updateFirebase(type) {
    if (type === 'auto') {
        db.ref('kontrol').update({ mode_otomatis: autoToggle.checked });
    } else if (type === 'manual') {
        db.ref('kontrol').update({ pompa_manual: manualToggle.checked });
    }
}