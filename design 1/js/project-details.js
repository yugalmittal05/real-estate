"use strict";

/* --------------------------------
   Tab Navigation
--------------------------------- */

const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.dataset.tab;
    const targetPanel = document.getElementById(targetTab);

    if (!targetPanel) {
      return;
    }

    tabButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });

    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    button.classList.add("active");
    button.setAttribute("aria-selected", "true");
    targetPanel.classList.add("active");

    /*
      On mobile, automatically move the selected tab
      into the center of the horizontal tab rail.
    */
    button.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  });
});

/* --------------------------------
   Floor Plan Selection
--------------------------------- */

const planCards = document.querySelectorAll(".plan-card");

planCards.forEach((card) => {
  card.addEventListener("click", () => {
    planCards.forEach((item) => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");
  });
});

/* --------------------------------
   Gallery Lightbox
--------------------------------- */

const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightbox = document.querySelector(".close-lightbox");

function openLightbox(imageUrl, imageAlt) {
  lightboxImage.src = imageUrl;
  lightboxImage.alt = imageAlt;

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeGalleryLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.style.overflow = "";
}

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const imageUrl = item.dataset.image;
    const imageAlt = item.dataset.alt;

    openLightbox(imageUrl, imageAlt);
  });
});

closeLightbox.addEventListener("click", closeGalleryLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeGalleryLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeGalleryLightbox();
  }
});

/* --------------------------------
   Animated Counter
--------------------------------- */

const counters = document.querySelectorAll(".counter");

function animateCounter(counter) {
  const target = Number(counter.dataset.count);
  const duration = 1300;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(easedProgress * target);

    counter.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(updateCounter);
}

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.5
  }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

/* --------------------------------
   Save Project
--------------------------------- */

const saveButton = document.querySelector(".save-project");

saveButton.addEventListener("click", () => {
  saveButton.classList.toggle("active");

  const isSaved = saveButton.classList.contains("active");

  saveButton.textContent = isSaved ? "♥" : "♡";
  saveButton.setAttribute(
    "aria-label",
    isSaved ? "Remove project from saved items" : "Save project"
  );
});

/* --------------------------------
   Share Project
--------------------------------- */

const shareButton = document.querySelector(".share-project");

shareButton.addEventListener("click", async () => {
  const shareData = {
    title: "Azure Bay Residences",
    text: "Explore Azure Bay Residences in Dubai Creek Harbour.",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      alert("Project link copied to clipboard.");
    } else {
      alert("Copy this page URL to share the project.");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Sharing failed:", error);
    }
  }
});

/* --------------------------------
   Action Buttons
--------------------------------- */

const brochureButtons = document.querySelectorAll(".brochure-button");
const paymentButton = document.querySelector(".payment-button");

brochureButtons.forEach((button) => {
  button.addEventListener("click", () => {
    alert(
      "Thank you. A property consultant will contact you with the latest brochure and availability."
    );
  });
});

paymentButton.addEventListener("click", () => {
  alert(
    "Payment plan request submitted. A consultant will contact you shortly."
  );
});

/* --------------------------------
   Location Button
--------------------------------- */

const openMapButton = document.querySelector(".open-map");

openMapButton.addEventListener("click", () => {
  const mapUrl =
    "https://www.google.com/maps/search/Dubai+Creek+Harbour";

  window.open(mapUrl, "_blank", "noopener,noreferrer");
});