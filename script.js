/* =========================================================
   MATCHACIH BIOPLASTIC — SCRIPT.JS
   Vanilla JavaScript, tanpa library.
   ========================================================= */

/* 'use strict' membuat kesalahan umum (misal variabel tanpa deklarasi)
   dilaporkan sebagai error, bukan diam-diam lolos. */
"use strict";

/* ---------------------------------------------------------
   0. KONFIGURASI TERPUSAT
   Ubah nomor di SINI SAJA. Script akan menimpa semua link
   WhatsApp di halaman secara otomatis.
   Format: kode negara tanpa "+" dan tanpa "0" di depan.
   --------------------------------------------------------- */
const WA_CONFIG = {
  number: "628XXXXXXXXXX",
  defaultText: "Halo saya tertarik dengan Matchacih BioPlastic",
};

/* Membuat URL WhatsApp yang valid.
   encodeURIComponent() mengubah spasi jadi %20 dan karakter khusus
   jadi aman untuk URL — wajib, kalau tidak pesan bisa terpotong. */
function buildWaLink(text) {
  const message = text || WA_CONFIG.defaultText;
  return (
    "https://wa.me/" + WA_CONFIG.number + "?text=" + encodeURIComponent(message)
  );
}

/* Menimpa href semua elemen ber-atribut data-wa dengan nomor dari WA_CONFIG.
   Href di HTML tetap ditulis lengkap sebagai fallback bila JS gagal dimuat. */
function syncWhatsAppLinks() {
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.href = buildWaLink();
  });

  /* Menampilkan nomor dalam format enak dibaca di seksi Contact. */
  const display = document.querySelector("[data-wa-display]");
  if (display) {
    const n = WA_CONFIG.number;
    display.textContent =
      "+" +
      n.slice(0, 2) +
      " " +
      n.slice(2, 5) +
      "-" +
      n.slice(5, 9) +
      "-" +
      n.slice(9);
  }
}

/* ---------------------------------------------------------
   1. STICKY HEADER
   CSS sudah menangani position:sticky. JS hanya menambah class
   .is-scrolled agar header menyusut dan mendapat bayangan.
   --------------------------------------------------------- */
function initStickyHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  function onScroll() {
    /* window.scrollY = jarak scroll vertikal dalam piksel.
       classList.toggle(nama, kondisi) menambah class bila kondisi true,
       menghapusnya bila false — lebih ringkas daripada if/else. */
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  /* { passive: true } memberi tahu browser bahwa handler ini tidak akan
     memanggil preventDefault(), sehingga scrolling tetap mulus. */
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // jalankan sekali saat load, untuk kasus halaman dibuka di tengah
}

/* ---------------------------------------------------------
   2. MENU MOBILE (HAMBURGER)
   --------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    /* aria-expanded memberitahu screen reader status menu.
       Nilainya harus string 'true'/'false', bukan boolean. */
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  /* Menu ditutup otomatis setelah link diklik, supaya konten langsung terlihat. */
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* Tutup dengan tombol Escape (kebiasaan standar UI). */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* Tutup bila klik di luar area header. .closest() menelusuri ke atas
     dari elemen yang diklik untuk mencari induk yang cocok. */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".site-header")) closeMenu();
  });
}

/* ---------------------------------------------------------
   3. SCROLLSPY — menandai menu aktif sesuai posisi scroll
   --------------------------------------------------------- */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll("[data-nav]"));
  /* Ambil elemen seksi berdasarkan href tiap link (#hero, #katalog, ...).
     .filter(Boolean) membuang hasil null bila id-nya tidak ditemukan. */
  const sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if (!sections.length) return;

  function onScroll() {
    /* Offset 140px = tinggi header + sedikit jeda, agar seksi dianggap
       "aktif" tepat saat judulnya masuk ke area baca. */
    const pos = window.scrollY + 140;
    let currentIndex = 0;

    sections.forEach(function (section, i) {
      if (section.offsetTop <= pos) currentIndex = i;
    });

    links.forEach(function (link, i) {
      link.classList.toggle("is-active", i === currentIndex);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------
   4. REVEAL ON SCROLL (IntersectionObserver)
   Lebih hemat daripada mendengarkan event scroll, karena browser
   yang memberi tahu kita saat elemen masuk viewport.
   --------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  /* Fallback: kalau browser tidak mendukung API-nya, tampilkan semua
     langsung supaya konten tidak pernah tak terlihat. */
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          /* unobserve = berhenti memantau elemen ini; animasinya cukup sekali. */
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12, // 12% elemen terlihat sudah cukup untuk memicu
      rootMargin: "0px 0px -60px 0px", // memicu sedikit lebih awal dari dasar layar
    },
  );

  items.forEach(function (el) {
    observer.observe(el);
  });
}

/* ---------------------------------------------------------
   5. COUNTER ANGKA STATISTIK
   --------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length || !("IntersectionObserver" in window)) return;

  function animate(el) {
    const target = parseFloat(el.dataset.count); // dataset.count = atribut data-count
    const suffix = el.dataset.suffix || "";
    const duration = 1400; // milidetik
    const start = performance.now();

    /* requestAnimationFrame menjalankan fungsi tepat sebelum frame berikutnya
       digambar (±60x/detik), jauh lebih mulus daripada setInterval. */
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      /* Easing "ease-out": cepat di awal, melambat di akhir. */
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });
}

/* ---------------------------------------------------------
   6. HOTSPOT PRODUK — sinkronisasi titik dengan kartu keterangan
   --------------------------------------------------------- */
function initHotspots() {
  const hotspots = document.querySelectorAll(".hotspot");
  const callouts = document.querySelectorAll("[data-callout]");
  if (!hotspots.length) return;

  function setActive(key) {
    hotspots.forEach(function (h) {
      h.classList.toggle("is-active", h.dataset.target === key);
    });
    callouts.forEach(function (c) {
      c.classList.toggle("is-active", c.dataset.callout === key);
    });
  }

  hotspots.forEach(function (hotspot) {
    /* mouseenter untuk desktop, click untuk perangkat sentuh & keyboard. */
    hotspot.addEventListener("mouseenter", function () {
      setActive(hotspot.dataset.target);
    });
    hotspot.addEventListener("click", function () {
      setActive(hotspot.dataset.target);
    });
    hotspot.addEventListener("focus", function () {
      setActive(hotspot.dataset.target);
    });
  });

  /* Sorot item pertama secara default agar interaksinya terlihat jelas. */
  setActive(hotspots[0].dataset.target);
}

/* ---------------------------------------------------------
   7. FLOATING WHATSAPP — muncul setelah melewati hero
   --------------------------------------------------------- */
function initFloatingWa() {
  const float = document.getElementById("waFloat");
  if (!float) return;

  function onScroll() {
    /* window.innerHeight = tinggi viewport. Tombol muncul setelah
       pengguna scroll melewati sekitar 60% layar pertama. */
    float.classList.toggle(
      "is-shown",
      window.scrollY > window.innerHeight * 0.6,
    );
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------
   8. FORM KONTAK → PESAN WHATSAPP
   Tidak ada backend. Isi form dirakit menjadi teks, lalu dibuka
   di WhatsApp. Konsekuensinya: data tidak tersimpan di mana pun.
   --------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("waForm");
  const errorBox = document.getElementById("formError");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    /* preventDefault() menghentikan perilaku bawaan form (reload halaman). */
    e.preventDefault();

    const nama = form.nama.value.trim(); // form.nama = input dengan name="nama"
    const usaha = form.usaha.value.trim();
    const kebutuhan = form.kebutuhan.value;
    const pesan = form.pesan.value.trim();

    /* Validasi minimal di sisi klien. Ini bukan keamanan, hanya kenyamanan. */
    if (nama.length < 2) {
      errorBox.textContent = "Mohon isi nama Anda terlebih dahulu.";
      errorBox.hidden = false;
      form.nama.focus();
      return;
    }
    errorBox.hidden = true;

    /* Template literal (backtick) memudahkan menyusun teks multi-baris.
       \n akan menjadi baris baru di dalam chat WhatsApp. */
    const text =
      `Halo Matchacih BioPlastic, saya tertarik dengan produk Anda.\n\n` +
      `Nama: ${nama}\n` +
      `Usaha: ${usaha || "-"}\n` +
      `Kebutuhan: ${kebutuhan}\n` +
      `Pesan: ${pesan || "-"}`;

    /* window.open dengan '_blank' membuka tab baru.
       'noopener' mencegah halaman tujuan mengakses window.opener (praktik keamanan). */
    window.open(buildWaLink(text), "_blank", "noopener");
  });
}

/* ---------------------------------------------------------
   9. TAHUN OTOMATIS DI FOOTER
   --------------------------------------------------------- */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   10. INISIALISASI
   DOMContentLoaded menunggu seluruh HTML selesai diparse,
   sehingga querySelector tidak mengembalikan null.
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  syncWhatsAppLinks();
  initStickyHeader();
  initMobileNav();
  initScrollSpy();
  initReveal();
  initCounters();
  initHotspots();
  initFloatingWa();
  initContactForm();
  initYear();
});
