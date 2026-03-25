import { initScanner, startScanner } from "./modules/scanner.js";
import { hideModal, showSentModal, hideSentModal } from "./modules/modal.js";
import { getState, resetState, scannedSet } from "./modules/state.js";
import { sendScannerData } from "./api/api.js";

const TIMEOUT = 3000;

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
  fps: 15,
  qrbox: { width: 280, height: 240 },
  // aspectRatio: window.innerWidth / window.innerHeight,
  aspectRatio: window.innerHeight / window.innerWidth,
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

    observer.disconnect();

    video.addEventListener("loadedmetadata", () => {
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
  const state = getState();

  console.log(
    "Отправка...",
    JSON.stringify({
      ...state,
      scannedSet: [...state.scannedSet],
    }),
  );

  const scannedArray = [...state.scannedSet];
  const scannerData = scannedArray.map((item) => ({
    text: item.decodedText,
    format: item.result?.format?.formatName,
    date: new Date().toISOString(),
  }));

  const res = sendScannerData(scannerData);

  showSentModal();
  hideModal();
  setTimeout(resetState, TIMEOUT);
  setTimeout(hideSentModal, TIMEOUT);
  setTimeout(startScanner, TIMEOUT);
});

// Отправка... {"scannedSet":[{"decodedText":"\u001d0104602441024650215ormOJdNxoNzv\u001d93bwZV","result":{"text":"\u001d0104602441024650215ormOJdNxoNzv\u001d93bwZV","format":{"format":6,"formatName":"DATA_MATRIX"},"debugData":{"decoderName":"zxing-js"}}}],"scannedIndex":{},"count":1}
