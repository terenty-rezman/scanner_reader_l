import { initScanner, startScanner } from "./modules/scanner.js";
import { hideModal, showSentModal, hideSentModal } from "./modules/modal.js";
import { resetState, scannedSet } from "./modules/state.js";
import { detectBrowser } from "./modules/browser.js";

const TIMEOUT = 3000;

console.log("Браузер:", detectBrowser());

// const browser = detectBrowser();

const screenResolution = {
  screenWidth: screen.width,
  screenHeight: screen.height,
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  devicePixelRatio: window.devicePixelRatio,
};

console.log("screenWidth", screenResolution.screenWidth);
console.log("screenHeight", screenResolution.screenHeight);
console.log("viewportWidth", screenResolution.viewportWidth);
console.log("viewportHeight", screenResolution.viewportHeight);
console.log("devicePixelRatio", screenResolution.devicePixelRatio);

document.getElementById("screenWidth_id").textContent =
  `screenWidth: ${screenResolution.screenWidth}`;
document.getElementById("screenHeight_id").textContent =
  `screenHeight: ${screenResolution.screenHeight}`;

document.getElementById("viewportWidth_id").textContent =
  `viewportWidth: ${screenResolution.viewportWidth}`;
document.getElementById("viewportHeight_id").textContent =
  `viewportHeight: ${screenResolution.viewportHeight}`;

const config = {
  fps: 20,
  qrbox: { width: 320, height: 240 },
  aspectRatio: window.innerWidth / window.innerHeight,
  // aspectRatio: window.innerHeight / window.innerWidth,
  rememberLastUsedCamera: true,
  formatsToSupport: [Html5QrcodeSupportedFormats.DATA_MATRIX],
};

initScanner("reader", config);

window.onload = () => {
  document.getElementById("ratio-size").textContent =
    `Ratio: ${config.aspectRatio}`;

  const observer = new MutationObserver(() => {
    const video = document.querySelector("video");

    if (!video) return;

    console.log("video найден", video);
    observer.disconnect();

    video.addEventListener("loadedmetadata", () => {
      console.log("Before update:", video.clientWidth, video.clientHeight);

      document.getElementById("video_el_w_id").textContent =
        `video_el_width: ${video.clientWidth}`;
      document.getElementById("video_el_h_id").textContent =
        `video_el_height: ${video.clientHeight}`;
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

document.getElementById("rescan-btn").addEventListener("click", () => {
  hideModal();
  resetState();
  startScanner();
});

document.getElementById("send-btn").addEventListener("click", () => {
  console.log(`Отправка... `, scannedSet);
  showSentModal();
  hideModal();
  resetState();
  setTimeout(hideSentModal, TIMEOUT);
  setTimeout(startScanner, TIMEOUT);
});
