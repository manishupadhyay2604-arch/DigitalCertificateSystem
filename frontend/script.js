
const API_URL = "https://digitalcertificatesystem.onrender.com/verify";

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

async function verifyCertificate(id) {
  id = id.trim();

  if (!id) {
    showPopup("warn", "Empty ID", "Please enter a certificate ID first.");
    return;
  }

  // Support both a certificate ID and a QR code containing a URL.
  try {
    if (id.startsWith("http://") || id.startsWith("https://")) {
      const qrUrl = new URL(id);
      const qrId = qrUrl.searchParams.get("id");

      if (qrId) {
        id = qrId.trim();
      } else {
        showPopup("warn", "Invalid QR Code", "This QR code does not contain a certificate ID.");
        return;
      }
    }
  } catch (error) {
    showPopup("warn", "Invalid QR Code", "Could not read the certificate ID from this QR code.");
    return;
  }

  try {
    verifyBtn.disabled = true;

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(id)}`
    );

    const data = await response.json();

    if (response.ok && data.found) {
      showPopup("valid", "VALID Certificate", null, data);
    } else if (response.status === 404 || data.found === false) {
      showPopup(
        "invalid",
        "Certificate Not Found",
        "This ID does not exist in our records."
      );
    } else {
      showPopup(
        "invalid",
        "Verification Error",
        data.error || "The certificate could not be verified."
      );
    }
  } catch (error) {
    showPopup(
      "invalid",
      "Server Error",
      "Could not reach the Java backend. Make sure the server is running."
    );
  } finally {
    verifyBtn.disabled = false;
  }
}

function showPopup(type, title, message, data) {
  modalBox.className = "modal-box " + type;

  modalIcon.textContent =
    type === "valid" ? "✅" :
    type === "invalid" ? "❌" : "⚠️";

  modalTitle.textContent = title;
  modalDetails.innerHTML = "";

  if (data) {
    addDetail("Certificate ID", data.certificateId);
    addDetail("Student Name", data.studentName);
    addDetail("Event", data.eventName);
    addDetail("Issue Date", data.issueDate);
    addDetail("Status", data.status);
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
  v.textContent = value ?? "Not available";

  row.appendChild(l);
  row.appendChild(v);
  modalDetails.appendChild(row);
}

function closePopup() {
  modal.classList.add("hidden");
}

document.getElementById("closeBtn")
  .addEventListener("click", closePopup);

document.getElementById("okBtn")
  .addEventListener("click", closePopup);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closePopup();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

verifyBtn.addEventListener("click", () => {
  verifyCertificate(certInput.value);
});

certInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    verifyCertificate(certInput.value);
  }
});

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
        await verifyCertificate(decodedText);
      }
    );

    scanning = true;
    scanBtn.textContent = "Stop Scanning";
  } catch (error) {
    scanner = null;
    showPopup(
      "warn",
      "Camera Error",
      "Could not start the camera. Allow camera access and try again."
    );
  }
});

async function stopScanner() {
  if (scanner && scanning) {
    try {
      await scanner.stop();
      scanner.clear();
    } catch (error) {
      console.error("Could not stop scanner:", error);
    }
  }

  scanner = null;
  scanning = false;
  scanBtn.textContent = "Start Scanning";
}
