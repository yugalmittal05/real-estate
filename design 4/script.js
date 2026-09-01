// ---------- Data ----------
const PROPERTIES = [
  {
    id: "p1",
    type: "Apartment",
    area: "Downtown Dubai",
    price: 2450000,
    name: "The Address Residences",
    beds: 2, baths: 3, sqft: 1240,
    img: "https://images.unsplash.com/photo-1753029111752-f12018752cd3?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "p2",
    type: "Penthouse",
    area: "Downtown Dubai",
    price: 8900000,
    name: "Burj Vista Sky Suite",
    beds: 4, baths: 5, sqft: 3600,
    img: "https://images.unsplash.com/photo-1748626083682-611d0a66cb50?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "p3",
    type: "Apartment",
    area: "Dubai Marina",
    price: 2980000,
    name: "Marina Horizon Residence",
    beds: 3, baths: 3, sqft: 1510,
    img: "https://images.unsplash.com/photo-1746731341047-76b2652ea843?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "p4",
    type: "Apartment",
    area: "Business Bay",
    price: 1680000,
    name: "Bay Central Loft",
    beds: 1, baths: 2, sqft: 820,
    img: "https://images.unsplash.com/photo-1745750434535-5943ef2fd31a?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "p5",
    type: "Villa",
    area: "Palm Jumeirah",
    price: 14200000,
    name: "Frond Signature Villa",
    beds: 5, baths: 6, sqft: 6100,
    img: "https://images.unsplash.com/photo-1749273858638-ea678cb48e94?auto=format&fit=crop&w=1600&q=80"
  }
];

// ---------- State ----------
let activeType = "all";
let activeArea = "all";
let maxPrice = 20000000;
let index = 1;
let topIsA = true;
const saved = new Set();

// ---------- Elements ----------
const typeFilterEl = document.getElementById("typeFilter");
const areaFilterEl = document.getElementById("areaFilter");
const priceFilterEl = document.getElementById("priceFilter");
const priceOutEl = document.getElementById("priceOut");
const resultNoteEl = document.getElementById("resultNote");

const imgA = document.getElementById("imgA");
const imgB = document.getElementById("imgB");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const saveBtn = document.getElementById("saveBtn");
const savedPill = document.getElementById("savedPill");
const savedCount = document.getElementById("savedCount");
const dotsEl = document.getElementById("dots");
//const emptyStateEl = document.getElementById("emptyState");
const resetFiltersBtn = document.getElementById("resetFilters");

const pPrice = document.getElementById("pPrice");
const pName = document.getElementById("pName");
const pLocation = document.getElementById("pLocation");
const pSpecs = document.getElementById("pSpecs");

// ---------- Helpers ----------
function formatPrice(n) {
  if (n >= 1000000) return "AED " + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
  return "AED " + Math.round(n / 1000) + "K";
}

function formatSliderLabel(n) {
  return n >= 20000000 ? "AED 20M+" : formatPrice(n);
}

function getFiltered() {
  return PROPERTIES.filter(p => {
    const typeOk = activeType === "all" || p.type === activeType;
    const areaOk = activeArea === "all" || p.area === activeArea;
    const priceOk = p.price <= maxPrice;
    return typeOk && areaOk && priceOk;
  });
}

// ---------- Render ----------
function render() {
  const list = getFiltered();
  // resultNoteEl.textContent = list.length === 0
  //   ? "No homes match your search"
  //   : `${list.length} home${list.length === 1 ? "" : "s"} match your search`;

  // if (list.length === 0) {
  //   emptyStateEl.hidden = true;
  //   dotsEl.innerHTML = "";
  //   return;
  // }
  // emptyStateEl.hidden = true;

  if (index >= list.length) index = 0;
  const current = list[index];

  // crossfade
  const showing = topIsA ? imgA : imgB;
  const hidden = topIsA ? imgB : imgA;
  hidden.src = current.img;
  hidden.alt = current.name + ", " + current.area;
  requestAnimationFrame(() => {
    showing.classList.remove("is-top");
    hidden.classList.add("is-top");
    topIsA = !topIsA;
  });

  pPrice.textContent = formatPrice(current.price);
  pName.textContent = current.name;
  pLocation.textContent = current.area;
  pSpecs.textContent = `${current.beds} bed · ${current.baths} bath · ${current.sqft.toLocaleString()} sqft`;

  saveBtn.classList.toggle("is-saved", saved.has(current.id));
  saveBtn.setAttribute("aria-pressed", saved.has(current.id));

  // dots
  dotsEl.innerHTML = "";
  list.forEach((p, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = i === index ? "is-active" : "";
    b.setAttribute("aria-label", "Show " + p.name);
    b.addEventListener("click", () => { index = i; render(); });
    dotsEl.appendChild(b);
  });
}

function currentProperty() {
  const list = getFiltered();
  return list[index] || null;
}

// ---------- Events ----------
typeFilterEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".pill");
  if (!btn) return;
  typeFilterEl.querySelectorAll(".pill").forEach(p => p.classList.remove("is-active"));
  btn.classList.add("is-active");
  activeType = btn.dataset.type;
  index = 0;
  render();
});

areaFilterEl.addEventListener("change", () => {
  activeArea = areaFilterEl.value;
  index = 0;
  render();
});

priceFilterEl.addEventListener("input", () => {
  maxPrice = Number(priceFilterEl.value);
  priceOutEl.textContent = formatSliderLabel(maxPrice);
  index = 0;
  render();
});

prevBtn.addEventListener("click", () => {
  const list = getFiltered();
  if (!list.length) return;
  index = (index - 1 + list.length) % list.length;
  render();
});

nextBtn.addEventListener("click", () => {
  const list = getFiltered();
  if (!list.length) return;
  index = (index + 1) % list.length;
  render();
});

saveBtn.addEventListener("click", () => {
  const p = currentProperty();
  if (!p) return;
  if (saved.has(p.id)) saved.delete(p.id); else saved.add(p.id);
  savedCount.textContent = saved.size;
  savedPill.classList.toggle("has-saved", saved.size > 0);
  render();
});

resetFiltersBtn.addEventListener("click", () => {
  activeType = "all";
  activeArea = "all";
  maxPrice = 20000000;
  index = 0;
  typeFilterEl.querySelectorAll(".pill").forEach(p => p.classList.remove("is-active"));
  typeFilterEl.querySelector('[data-type="all"]').classList.add("is-active");
  areaFilterEl.value = "all";
  priceFilterEl.value = 20000000;
  priceOutEl.textContent = "AED 20M+";
  render();
});

document.querySelectorAll(".navlink").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".navlink").forEach(n => n.classList.remove("is-active"));
    btn.classList.add("is-active");
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevBtn.click();
  if (e.key === "ArrowRight") nextBtn.click();
});

// ---------- Init ----------
priceOutEl.textContent = formatSliderLabel(maxPrice);
render();
