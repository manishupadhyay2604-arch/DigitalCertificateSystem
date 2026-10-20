const API_URL = "http://localhost:8080/verify";

// true = test with fake data (no Java backend needed)
// change to false once the Java backend is running
const USE_MOCK = false;

const certInput = document.getElementById("certId");
const verifyBtn = document.getElementById("verifyBtn");
const scanBtn = document.getElementById("scanBtn");

const modal = document.getElementById("modal");
const modalBox = document.getElementById("modalBox");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalDetails = document.getElementById("modalDetails");

let scanner = null;
let scanning = false;

// ---------- Talk to backend ----------
async function verifyCertificate(id) {
  id = id.trim();
  if (!id) {
    showPopup("warn", "Empty ID", "Please enter a certificate ID first.");
    return;
  }

  try {
    let data;
    if (USE_MOCK) {
      data = id === "TCET2026001"
        ? { found: true, certificateId: id, studentName: "Rahul Sharma", eventName: "Java Workshop", issueDate: "2026-01-15", status: "Valid" }
        : { found: false };
    } else {
      const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`);
      data = await response.json();
    }

    if (data.found) {
      showPopup("valid", "VALID Certificate", null, data);
    } else {
      showPopup("invalid", "Certificate Not Found", "This ID does not exist in our records.");
    }
  } catch (error) {
    showPopup("invalid", "Server Error", "Could not reach the server. Is the Java backend running?");
  }
}

// ---------- Popup ----------
function showPopup(type, title, message, data) {
  modalBox.className = "modal-box " + type;
  modalIcon.textContent = type === "valid" ? "✅" : type === "invalid" ? "❌" : "⚠️";
  modalTitle.textContent = title;
  modalDetails.innerHTML = "";

  if (data) {
    addDetail("Certificate ID", data.certificateId);
    addDetail("Student Name", data.studentName);
    addDetail("Event", data.eventName);
    addDetail("Issue Date", data.issueDate);
  } else {
    const p = document.createElement("p");
    p.textContent = message;
    modalDetails.appendChild(p);
  }

  modal.classList.remove("hidden");
}

function addDetail(label, value) {
  const row = document.createElement("div");
  row.className = "detail";
  const l = document.createElement("b");
  l.textContent = label;
  const v = document.createElement("span");
  v.textContent = value;
  row.appendChild(l);
  row.appendChild(v);
  modalDetails.appendChild(row);
}

function closePopup() {
  modal.classList.add("hidden");
}

document.getElementById("closeBtn").addEventListener("click", closePopup);
document.getElementById("okBtn").addEventListener("click", closePopup);
modal.addEventListener("click", (e) => { if (e.target === modal) closePopup(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePopup(); });

// ---------- Manual verification ----------
verifyBtn.addEventListener("click", () => verifyCertificate(certInput.value));
certInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") verifyCertificate(certInput.value);
});

// ---------- QR scanning ----------
scanBtn.addEventListener("click", async () => {
  if (scanning) {
    await stopScanner();
    return;
  }

  scanner = new Html5Qrcode("reader");
  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      async (decodedText) => {
        await stopScanner();
        certInput.value = decodedText;
        verifyCertificate(decodedText);
      }
    );
    scanning = true;
    scanBtn.textContent = "Stop Scanning";
  } catch (err) {
    showPopup("warn", "Camera Error", "Could not start the camera. Please allow camera access.");
  }
});

async function stopScanner() {
  if (scanner && scanning) {
    await scanner.stop();
    scanner.clear();
  }
  scanning = false;
  scanBtn.textContent = "Start Scanning";
}