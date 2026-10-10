"use strict";
const media = document.getElementById("media");
const fileInput = document.getElementById("file");
const empty = document.getElementById("empty");
const filename = document.getElementById("filename");
const feedback = document.getElementById("feedback");
const clear = document.getElementById("clear");
const loop = document.getElementById("loop");
const speed = document.getElementById("speed");
let objectURL = null;
function releaseFile() {
  media.pause();
  media.removeAttribute("src");
  media.load();
  if (objectURL) URL.revokeObjectURL(objectURL);
  objectURL = null;
}
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  releaseFile();
  objectURL = URL.createObjectURL(file);
  filename.textContent = file.name;
  empty.hidden = true;
  media.hidden = false;
  clear.disabled = false;
  feedback.textContent = "Loading your local file…";
  media.src = objectURL;
  media.load();
});
media.addEventListener("loadedmetadata", () => {
  media.playbackRate = Number(speed.value);
  feedback.textContent = "Ready. Press play in the player. Your file stays on this device.";
});
media.addEventListener("error", () => {
  if (!objectURL) return;
  feedback.textContent = "This browser could not play the file. Try MP3 audio or an H.264/AAC MP4 video, or choose another file.";
});
speed.addEventListener("change", () => { media.playbackRate = Number(speed.value); });
loop.addEventListener("click", () => {
  media.loop = !media.loop;
  loop.setAttribute("aria-pressed", String(media.loop));
  loop.textContent = `Repeat: ${media.loop ? "on" : "off"}`;
});
clear.addEventListener("click", () => {
  releaseFile();
  fileInput.value = "";
  filename.textContent = "Nothing selected yet";
  empty.hidden = false;
  media.hidden = true;
  clear.disabled = true;
  feedback.textContent = "File cleared. Choose another song or video whenever you like.";
});
window.addEventListener("pagehide", releaseFile);
const tips = [
  "Choose a song or video to get started. I’ll keep the controls close.",
  "Try the playback speed menu for a slower lesson or a quicker listen.",
  "Turn repeat on to keep a favourite track playing.",
  "This preview uses your browser’s codecs. MP3 and H.264/AAC MP4 are good starting points.",
  "Your selected file is not uploaded. Clear it whenever you’re finished."
];
let tipIndex = 0;
document.getElementById("next-tip").addEventListener("click", () => {
  tipIndex = (tipIndex + 1) % tips.length;
  document.getElementById("tip").textContent = tips[tipIndex];
});

// Keep the gallery and local player from playing over each other.
const auraPlayers = Array.from(document.querySelectorAll("video"));
auraPlayers.forEach(player => {
  player.addEventListener("play", () => {
    auraPlayers.forEach(other => { if (other !== player) other.pause(); });
  });
});
