import { addScan, getState } from "./state.js";
import { showModal } from "./modal.js";

let html5Qrcode;
let cameraId;
let config;

async function getEnvironmentCameraId() {
  let stream;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: "environment" },
      },
    });
  } catch (err) {
    console.warn(
      "Exact environment camera not available, fallback to ideal",
      err,
    );

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
    });
  }

  try {
    const tracks = stream.getVideoTracks();

    if (!tracks.length) {
      throw new Error("No video tracks in MediaStream");
    }

    const track = tracks[0];
    const settings = track.getSettings();

    console.log("Video tracks:", tracks);

    document.getElementById("cameras_back").innerHTML = tracks
      .map(
        (c, index) => `
        <div style="margin-bottom:8px">
          <div><strong>Back Camera ID${index + 1}</strong></div>
          <div>id: ${c.id}<div>
          <div>label: ${c.label || "Без названия"}</div>
        </div>
      `,
      )
      .join("");

    // console.log("Using track:", track);
    // console.log("Track settings:", settings);

    return {
      id: settings.deviceId || null,
      label: track.label || null,
    };
  } finally {
    stream.getTracks().forEach((t) => t.stop());
  }
}

export async function initScanner(readerId, scannerConfig) {
  config = scannerConfig;
  html5Qrcode = new Html5Qrcode(readerId, config);

  let envCamera;

  try {
    envCamera = await getEnvironmentCameraId();
    console.log("Environment camera:", envCamera.id, envCamera.label);

    document.getElementById("env_camera").textContent =
      `Environment camera: ${envCamera.label}`;

    //   document.getElementById("cameras_back").innerHTML = `
    //   <div>Back Camera ID: ${envCamera.id}</div>
    //   <div>Back Camera Label: ${envCamera.label || "Без названия"}</div>
    // `;
  } catch (e) {
    console.warn("Environment camera not available, fallback", e);
  }

  const cameras = await Html5Qrcode.getCameras();

  cameras.forEach((c) => {
    console.log("Camera obj:", c);
    console.log(c.label || "Без названия", {
      back: /back/i.test(c.label),
      rear: /rear/i.test(c.label),
      environment: /environment/i.test(c.label),
    });
  });

  // document.getElementById("cameras_id").innerHTML = cameras
  //   .map(
  //     (c, index) => `
  //       <div style="margin-bottom:8px">
  //         <div><strong>Camera ${index + 1}</strong></div>
  //         <div>id: ${c.id}<div>
  //         <div>label: ${c.label || "Без названия"}</div>
  //       </div>
  //     `,
  //   )
  //   .join("");

  const backCamera =
    cameras.find((c) => /back|rear|environment/i.test(c.label)) || cameras[0];

  // cameraId = backCamera.id;

  cameraId =
    cameras.find((c) => c.id === envCamera?.id)?.id ||
    cameras.find((c) => /back|rear|environment/i.test(c.label))?.id ||
    cameras[0].id;

  document.getElementById("camera-in-use").textContent =
    `Camera: ${backCamera.label || "default"}`;

  startScanner();
}

export function startScanner() {
  html5Qrcode.start({ deviceId: cameraId }, config, onScanSuccess, onScanError);

  const video = document.querySelector("video");

  video.style.height = "100vh";
  video.style.position = "fixed";
  video.style.objectFit = "cover";

  const reader = document.getElementById("reader");
  reader.style.height = "100vh";
  reader.style.position = "fixed";
  reader.style.objectFit = "cover";
}

export function stopScanner() {
  return html5Qrcode.stop();
}

function onScanSuccess(text, result) {
  console.log("onScanSuccess - start");

  if (result.result.format.formatName !== "DATA_MATRIX") return;

  const added = addScan(result.decodedText, result);
  if (!added) return;

  updateUI();
  stopScanner().then(showModal);
}

function onScanError(err) {
  console.warn("SCAN ERROR:", err);
}

function updateUI() {
  const { scannedSet, scannedIndex, count } = getState();

  document.getElementById("count_id").textContent = `Count: ${count}`;
  document.getElementById("set-size").textContent =
    `Set size: ${scannedSet.size}`;
  document.getElementById("set-info").textContent =
    `Set info:\n${[...scannedIndex.keys()].join("\n")}`;
}
