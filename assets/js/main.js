const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursor = document.getElementById("cursor");
const toast = document.getElementById("toast");
const soundToggle = document.getElementById("soundToggle");
const themeToggle = document.getElementById("themeToggle");
const copyEmail = document.getElementById("copyEmail");
const copyFeedback = document.getElementById("copyFeedback");
const strategyStar = document.getElementById("strategyStar");
const mobileMenu = document.getElementById("mobileMenu");
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");

document.getElementById("year").textContent = new Date().getFullYear();

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

function showToast(message) {
  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translate(-50%, 0)";

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 20px)";
  }, 2800);
}

if (!prefersReducedMotion && cursor) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetX = cursorX;
  let targetY = cursorY;

  window.addEventListener("mousemove", (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  });

  function animateCursor() {
    cursorX += (targetX - cursorX) * 0.18;
    cursorY += (targetY - cursorY) * 0.18;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("mouseenter", () => {
      cursor.style.width = "42px";
      cursor.style.height = "42px";
      cursor.style.background = "rgba(109, 91, 255, 0.22)";
    });

    element.addEventListener("mouseleave", () => {
      cursor.style.width = "16px";
      cursor.style.height = "16px";
      cursor.style.background = "transparent";
    });
  });
}

if (!prefersReducedMotion && window.gsap) {
  gsap.from("#heroTitle", {
    duration: 1.4,
    y: 60,
    opacity: 0,
    filter: "blur(14px)",
    ease: "power3.out"
  });

  gsap.from(".hero-subtitle, .trait-constellation, .hero-actions", {
    duration: 1,
    y: 35,
    opacity: 0,
    stagger: 0.12,
    delay: 0.35,
    ease: "power3.out"
  });

  gsap.to(".constellation-route", {
    scrollTrigger: {
      trigger: ".hero",
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    strokeDashoffset: 0,
    duration: 2.2,
    ease: "power2.inOut"
  });

  gsap.to(".constellation-stars circle", {
    scrollTrigger: {
      trigger: ".hero",
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    opacity: 1,
    duration: 0.5,
    stagger: 0.16,
    ease: "power2.out"
  });

  gsap.utils.toArray(".glass-panel, .glass-card, .atlas-node").forEach((element) => {
    gsap.from(element, {
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        toggleActions: "play none none reverse"
      },
      duration: 0.9,
      y: 45,
      opacity: 0,
      ease: "power3.out"
    });
  });

  document.querySelectorAll(".magnetic").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.18,
        y: y * 0.18,
        duration: 0.35,
        ease: "power2.out"
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });
}

document.querySelectorAll(".atlas-node").forEach((node) => {
  if (prefersReducedMotion) return;

  node.addEventListener("mousemove", (event) => {
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    node.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
  });

  node.addEventListener("mouseleave", () => {
    node.style.transform = "";
  });
});

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
  themeToggle.querySelector("span").textContent = isDark ? "☀" : "☾";
  showToast(isDark ? "Daybreak atlas activated" : "Twilight atlas activated");
});

let audioContext = null;
let masterGain = null;
let ambientNodes = [];

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function createAmbience() {
  const context = ensureAudioContext();

  masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.0001, context.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.16, context.currentTime + 1.8);
  masterGain.connect(context.destination);

  const frequencies = [98, 146.83, 196, 293.66];

  frequencies.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = index % 2 === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;

    const oscillatorGain = context.createGain();
    oscillatorGain.gain.value = index === 0 ? 0.35 : 0.14;

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 850;

    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(filter);
    filter.connect(masterGain);

    oscillator.start();
    ambientNodes.push(oscillator);
  });
}

function stopAmbience() {
  if (!audioContext || !masterGain) return;

  const now = audioContext.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.7);

  ambientNodes.forEach((node) => {
    try {
      node.stop(now + 0.8);
    } catch {
      // Oscillator may already be stopped.
    }
  });

  ambientNodes = [];
}

function playUiSound(frequency = 660, duration = 0.09) {
  if (soundToggle.getAttribute("aria-pressed") !== "true") return;

  const context = ensureAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.07, context.currentTime + 0.015);
  gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
}

soundToggle.addEventListener("click", () => {
  const enabled = soundToggle.getAttribute("aria-pressed") === "true";

  if (enabled) {
    stopAmbience();
    soundToggle.setAttribute("aria-pressed", "false");
    showToast("Signal silenced");
    return;
  }

  createAmbience();
  soundToggle.setAttribute("aria-pressed", "true");
  showToast("Ambient signal active");
  playUiSound(880, 0.12);
});

document.querySelectorAll(".btn, .icon-btn, .atlas-node").forEach((element) => {
  element.addEventListener("click", () => {
    playUiSound(660, 0.07);
  });
});

copyEmail.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("revanthkm13@gmail.com");
    copyFeedback.textContent = "Coordinates copied: revanthkm13@gmail.com";
    showToast("Coordinates copied");
  } catch {
    copyFeedback.textContent = "Email: revanthkm13@gmail.com";
    showToast("Copy unavailable — email shown below");
  }
});

let deepSpaceActive = false;

function activateHyperJump() {
  if (deepSpaceActive) {
    deactivateDeepSpace();
    return;
  }

  deepSpaceActive = true;
  document.body.classList.add("hyper-jump");

  showToast("Hyper Jump engaged");
  playUiSound(1180, 0.18);

  setTimeout(() => {
    showToast("Think strategically. Plan hard. Execute brutally perfect. Destroy opponents.");
  }, 900);
}

function deactivateDeepSpace() {
  deepSpaceActive = false;
  document.body.classList.remove("hyper-jump");
  showToast("Returned to normal coordinates");
  playUiSound(420, 0.12);
}

strategyStar.addEventListener("click", activateHyperJump);

document.addEventListener("keydown", (event) => {
  if (event.altKey && event.key.toLowerCase() === "a") {
    event.preventDefault();
    activateHyperJump();
  }

  if (event.key === "Escape" && deepSpaceActive) {
    deactivateDeepSpace();
  }
});

const hiddenStar = document.createElement("button");
hiddenStar.className = "hidden-star";
hiddenStar.setAttribute("aria-label", "Reveal a hidden thought");
hiddenStar.textContent = "✦";
document.querySelector(".site-footer").appendChild(hiddenStar);

hiddenStar.addEventListener("click", () => {
  showToast("“Knowledge is of no value unless you put it into practice.” — Anton Chekhov");
});

openMenu.addEventListener("click", () => {
  mobileMenu.showModal();
  playUiSound(760, 0.08);
});

closeMenu.addEventListener("click", () => {
  mobileMenu.close();
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.close();
  });
});
