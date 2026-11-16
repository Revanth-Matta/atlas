const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursor = document.getElementById("cursor");
const toast = document.getElementById("toast");
const soundToggle = document.getElementById("soundToggle");
const themeToggle = document.getElementById("themeToggle");
const copyEmail = document.getElementById("copyEmail");
const copyFeedback = document.getElementById("copyFeedback");

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
  }, 2400);
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
let ambientNodes = [];

function createAmbience() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gain = audioContext.createGain();
  gain.gain.value = 0.025;
  gain.connect(audioContext.destination);

  [110, 164.81, 220].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const oscillatorGain = audioContext.createGain();
    oscillatorGain.gain.value = index === 0 ? 0.5 : 0.22;

    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(gain);
    oscillator.start();
    ambientNodes.push(oscillator);
  });
}

soundToggle.addEventListener("click", () => {
  const enabled = soundToggle.getAttribute("aria-pressed") === "true";

  if (enabled) {
    ambientNodes.forEach((node) => node.stop());
    ambientNodes = [];
    soundToggle.setAttribute("aria-pressed", "false");
    showToast("Signal silenced");
    return;
  }

  createAmbience();
  soundToggle.setAttribute("aria-pressed", "true");
  showToast("Ambient signal active");
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

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "a" && event.altKey) {
    document.body.style.filter = "hue-rotate(35deg) saturate(1.25)";
    showToast("Deep Space mode engaged");
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
