// Live Clock
function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = `| ${now.toLocaleTimeString()}`;
}
setInterval(updateClock, 1000);
updateClock();

// Geolocation
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    document.getElementById("location").textContent = `Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`;
  },
  () => {
    document.getElementById("location").textContent = "Unable to fetch location.";
  }
);

// Network Info + Canvas
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

function drawNetworkSpeed(downlink) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#007bff";
  ctx.fillRect(0, canvas.height - downlink * 10, 100, downlink * 10);
  ctx.font = "14px Arial";
  ctx.fillStyle = document.body.classList.contains('dark-mode') ? "#fff" : "#000";
  ctx.fillText(`${downlink} Mbps`, 5, canvas.height - downlink * 10 - 5);
}

function updateNetworkInfo() {
  if (connection) {
    const info = `Type: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps, Save-Data: ${connection.saveData}`;
    document.getElementById("network").textContent = info;
    drawNetworkSpeed(connection.downlink);
  } else {
    document.getElementById("network").textContent = "Network info not available.";
  }
}
updateNetworkInfo();
connection && connection.addEventListener("change", updateNetworkInfo);

// Background Sync Progress
async function backgroundTask() {
  const progress = document.getElementById("progress");
  document.getElementById("sync-status").textContent = "⏳ Sync in progress...";
  progress.style.width = "0%";

  for (let i = 1; i <= 100; i++) {
    await new Promise(res => setTimeout(res, 20));
    progress.style.width = `${i}%`;
  }

  const timestamp = new Date().toLocaleTimeString();
  document.getElementById("sync-status").textContent = `✅ Synced at ${timestamp}`;
}

backgroundTask();
setInterval(backgroundTask, 10000);

// Auto-dark redraw on mode toggle
const observer = new MutationObserver(() => updateNetworkInfo());
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
