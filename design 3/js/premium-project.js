"use strict";

/* --------------------------------
   Helper Functions
--------------------------------- */

const $ = (selector, parent = document) => {
  return parent.querySelector(selector);
};

const $$ = (selector, parent = document) => {
  return Array.from(parent.querySelectorAll(selector));
};

/* --------------------------------
   Toast Notification
--------------------------------- */

const toast = $("#toast-message");
let toastTimer = null;

function showToast(message) {
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(toastTimer);

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

/* --------------------------------
   Project Tabs
--------------------------------- */

const projectTabs = $$(".project-tab");
const contentPanels = $$(".content-panel");

function activateTab(tabName, shouldScroll = false) {
  const selectedTab = $(`.project-tab[data-tab="${tabName}"]`);
  const selectedPanel = document.getElementById(tabName);

  if (!selectedTab || !selectedPanel) {
    return;
  }

  projectTabs.forEach((tab) => {
    const isActive = tab === selectedTab;

    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  contentPanels.forEach((panel) => {
    panel.classList.toggle("active", panel === selectedPanel);
  });

  if (window.innerWidth <= 680) {
    selectedTab.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }

  if (shouldScroll) {
    window.setTimeout(() => {
      selectedPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  }
}

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activateTab(tab.dataset.tab);
  });
});

/* --------------------------------
   Location CTA
--------------------------------- */

const locationScrollButton = $(".location-scroll-button");

if (locationScrollButton) {
  locationScrollButton.addEventListener("click", () => {
    activateTab("location", true);
  });
}

/* --------------------------------
   Enhanced SVG Floor Plan
--------------------------------- */

const floorSvg = $("#isometricFloorPlan");
const floorModel = $("#floorModel");
const floorStage = $("#enhancedFloorStage");

let floorRotation = 0;
let floorZoom = 1;

let isDraggingFloor = false;
let floorDragStartX = 0;
let floorDragStartRotation = 0;

let floorAnimationFrame = null;

function updateFloorTransform(animate = true) {
  if (!floorModel) {
    return;
  }

  const transform = [
    "translate(330 210)",
    `rotate(${floorRotation})`,
    `scale(${floorZoom})`,
    "translate(-330 -210)"
  ].join(" ");

  if (!animate && floorAnimationFrame) {
    window.cancelAnimationFrame(floorAnimationFrame);
  }

  /*
    SVG transform is used instead of CSS transform.
    This keeps the isometric geometry stable in browsers
    and avoids distorted room labels.
  */
  if (animate) {
    floorModel.style.transition =
      "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
  } else {
    floorModel.style.transition = "none";
  }

  floorModel.setAttribute("transform", transform);
}

function rotateFloor(amount) {
  floorRotation += amount;

  if (floorRotation > 360) {
    floorRotation -= 360;
  }

  if (floorRotation < -360) {
    floorRotation += 360;
  }

  updateFloorTransform(true);
}

function zoomFloor(amount) {
  floorZoom += amount;
  floorZoom = Math.max(0.78, Math.min(1.25, floorZoom));

  updateFloorTransform(true);
}

function resetFloorPlan() {
  floorRotation = 0;
  floorZoom = 1;

  updateFloorTransform(true);
}

const floorControlButtons = $$("[data-floor-action]");

floorControlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.floorAction;

    switch (action) {
      case "rotate-left":
        rotateFloor(-12);
        break;

      case "rotate-right":
        rotateFloor(12);
        break;

      case "zoom-in":
        zoomFloor(0.08);
        break;

      case "zoom-out":
        zoomFloor(-0.08);
        break;

      case "reset":
        resetFloorPlan();
        break;

      default:
        break;
    }
  });
});

/* --------------------------------
   Floor Plan Dragging
--------------------------------- */

function startFloorDrag(event) {
  if (!floorSvg) {
    return;
  }

  isDraggingFloor = true;
  floorDragStartX = event.clientX;
  floorDragStartRotation = floorRotation;

  floorSvg.style.cursor = "grabbing";

  if (floorSvg.setPointerCapture) {
    floorSvg.setPointerCapture(event.pointerId);
  }

  event.preventDefault();
}

function moveFloorDrag(event) {
  if (!isDraggingFloor) {
    return;
  }

  const distance = event.clientX - floorDragStartX;

  floorRotation = floorDragStartRotation + distance * 0.45;

  /*
    Keep the SVG rotation number within a manageable range.
  */
  if (floorRotation > 720 || floorRotation < -720) {
    floorRotation %= 360;
  }

  updateFloorTransform(false);
}

function stopFloorDrag(event) {
  if (!isDraggingFloor) {
    return;
  }

  isDraggingFloor = false;

  if (floorSvg) {
    floorSvg.style.cursor = "grab";

    if (
      event &&
      floorSvg.releasePointerCapture &&
      floorSvg.hasPointerCapture(event.pointerId)
    ) {
      floorSvg.releasePointerCapture(event.pointerId);
    }
  }
}

if (floorSvg) {
  floorSvg.addEventListener("pointerdown", startFloorDrag);
  floorSvg.addEventListener("pointermove", moveFloorDrag);
  floorSvg.addEventListener("pointerup", stopFloorDrag);
  floorSvg.addEventListener("pointercancel", stopFloorDrag);
  floorSvg.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      stopFloorDrag(event);
    }
  });

  floorSvg.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();

      if (event.deltaY < 0) {
        zoomFloor(0.05);
      } else {
        zoomFloor(-0.05);
      }
    },
    { passive: false }
  );
}

const planChoices = $$(".plan-choice");
const selectedPlanName = $("#selectedPlanName");
const selectedPlanSize = $("#selectedPlanSize");
const selectedPlanPrice = $("#selectedPlanPrice");

planChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    planChoices.forEach((item) => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });

    choice.classList.add("selected");
    choice.setAttribute("aria-pressed", "true");

    if (selectedPlanName) {
      selectedPlanName.textContent = choice.dataset.name;
    }

    if (selectedPlanSize) {
      selectedPlanSize.textContent = choice.dataset.size;
    }

    if (selectedPlanPrice) {
      selectedPlanPrice.textContent = choice.dataset.price;
    }

    /*
      A small rotation gives feedback when another
      residence type is selected.
    */
    floorRotation += 5;
    updateFloorTransform(true);

    showToast(`${choice.dataset.name} layout selected.`);
  });
});

if (floorModel) {
  floorModel.setAttribute("transform", "translate(330 210) scale(1) translate(-330 -210)");
}

/* --------------------------------
   Amenities
--------------------------------- */

const amenityButtons = $$(".amenity-orbit");
const amenityFocus = $("#amenityFocus");

amenityButtons.forEach((button) => {
  const updateAmenity = () => {
    if (amenityFocus) {
      amenityFocus.textContent = button.dataset.amenity;
    }
  };

  const resetAmenity = () => {
    if (
      amenityFocus &&
      !button.matches(":hover") &&
      document.activeElement !== button
    ) {
      amenityFocus.textContent = "Your lifestyle";
    }
  };

  button.addEventListener("mouseenter", updateAmenity);
  button.addEventListener("focus", updateAmenity);
  button.addEventListener("click", updateAmenity);
  button.addEventListener("mouseleave", resetAmenity);
  button.addEventListener("blur", resetAmenity);
});

/* --------------------------------
   Gallery Lightbox
--------------------------------- */

const galleryCards = $$(".gallery-card");
const lightbox = $("#lightbox");
const lightboxImage = $("#lightbox-image");
const lightboxClose = $(".lightbox-close");

function openLightbox(imageUrl, imageAlt) {
  if (!lightbox || !lightboxImage) {
    return;
  }

  lightboxImage.src = imageUrl;
  lightboxImage.alt = imageAlt;

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeGalleryLightbox() {
  if (!lightbox || !lightboxImage) {
    return;
  }

  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");

  lightboxImage.src = "";
  lightboxImage.alt = "";

  document.body.style.overflow = "";
}

galleryCards.forEach((card) => {
  card.addEventListener("click", () => {
    openLightbox(card.dataset.image, card.dataset.alt);
  });
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeGalleryLightbox);
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeGalleryLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeGalleryLightbox();
  }
});

/* --------------------------------
   Gallery Desktop Tilt Effect
--------------------------------- */

galleryCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    if (window.innerWidth <= 680) {
      return;
    }

    const rect = card.getBoundingClientRect();

    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    const rotateX = ((pointerY / rect.height) - 0.5) * -4;
    const rotateY = ((pointerX / rect.width) - 0.5) * 4;

    card.style.transform =
      `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* --------------------------------
   Save Project
--------------------------------- */

const saveButton = $(".save-button");

if (saveButton) {
  saveButton.addEventListener("click", () => {
    const saved = saveButton.classList.toggle("active");

    saveButton.textContent = saved ? "♥" : "♡";

    saveButton.setAttribute(
      "aria-label",
      saved ? "Remove project from saved items" : "Save project"
    );

    showToast(
      saved
        ? "Project saved."
        : "Project removed from saved items."
    );
  });
}

/* --------------------------------
   Share Project
--------------------------------- */

const shareButton = $(".share-button");

if (shareButton) {
  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: "Azure Bay Residences",
      text: "Explore Azure Bay Residences in Dubai Creek Harbour.",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Project link copied.");
        return;
      }

      showToast("Copy the page URL to share this project.");
    } catch (error) {
      if (error.name !== "AbortError") {
        showToast("Unable to share the project.");
      }
    }
  });
}

/* --------------------------------
   Brochure and Request Buttons
--------------------------------- */

const brochureButtons = $$(".brochure-button");
const paymentButton = $(".payment-button");

brochureButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showToast("Brochure request submitted.");
  });
});

if (paymentButton) {
  paymentButton.addEventListener("click", () => {
    showToast("Payment plan request submitted.");
  });
}

/* --------------------------------
   Map Button
--------------------------------- */

const openMapButton = $(".open-map");

if (openMapButton) {
  openMapButton.addEventListener("click", () => {
    window.open(
      "https://www.google.com/maps/search/Dubai+Creek+Harbour",
      "_blank",
      "noopener,noreferrer"
    );
  });
}

/* --------------------------------
   Optional Number Counters
--------------------------------- */

const counters = $$(".counter");

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
      window.requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target.toLocaleString();
    }
  }

  window.requestAnimationFrame(updateCounter);
}

if (counters.length > 0) {
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
}

/* --------------------------------
   Initial Setup
--------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  activateTab("overview");

  if (floorModel) {
    floorModel.setAttribute(
      "transform",
      "translate(330 210) rotate(0) scale(1) translate(-330 -210)"
    );
  }
});