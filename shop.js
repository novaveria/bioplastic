/* =========================================================
   MATCHACIH BIOPLASTIC — SHOP.JS
   Data produk, keranjang (localStorage), akun dummy, dan
   referral. Tidak ada backend — sama seperti script.js,
   pemesanan akhirnya dirakit jadi pesan WhatsApp.
   Membutuhkan WA_CONFIG & buildWaLink() dari script.js,
   jadi file ini harus dimuat SETELAH script.js.
   ========================================================= */
"use strict";

/* ---------------------------------------------------------
   0. DATA PRODUK
   Ganti gambar/harga di sini saat aset asli sudah tersedia.
   --------------------------------------------------------- */
const PRODUCTS = [
  {
    slug: "kantong-belanja",
    badge: "01 — Katalog",
    name: "Kantong Belanja Biodegradable",
    price: 2500,
    unit: "pcs",
    minOrder: 500,
    tags: ["Food-grade", "Bulk order", "Garansi produk"],
    image: "img/bioplastik.jpg",
    description:
      "Kantong belanja biodegradable Matchacih dibuat dari pati kulit singkong, kitosan, CMC, dan gliserol. Ukuran kecil hingga besar untuk toko kelontong, warung makan, dan retail — kuat menahan beban harian dengan warna alami kecokelatan khas bahan nabati, dan dirancang terurai lebih menyeluruh tanpa meninggalkan residu mikroplastik.",
  },
  // {
  //   slug: "kemasan-food-grade",
  //   badge: "02 — Katalog",
  //   name: "Kemasan Food-Grade",
  //   price: 3200,
  //   unit: "pcs",
  //   minOrder: 300,
  //   tags: ["Tahan air", "Panduan pembuangan", "Free sample"],
  //   image: "img/mockup_Bioplastik.png",
  //   description:
  //     "Kemasan food-grade untuk UMKM kuliner yang butuh pembungkus aman dan tahan terhadap makanan berkuah, tanpa menaikkan biaya modal secara signifikan. Setiap kemasan dilengkapi panduan pembuangan agar konsumen tahu cara menguraikannya dengan benar.",
  // },
  {
    slug: "custom-packaging-b2b",
    badge: "02 — Katalog",
    name: "Custom Packaging B2B",
    price: 4500,
    unit: "pcs",
    minOrder: 1000,
    tags: ["Cetak logo", "Kontrak harga", "Dukungan ESG/CSR"],
    image: "img/bioplastik_B2B.jpg",
    description:
      "Untuk supermarket, FMCG, packaging converter, dan restoran: kontrak harga berdasarkan volume, cetak logo custom, pengiriman terjadwal, dan konsultasi khusus untuk mendukung target ESG/CSR perusahaan Anda. Harga di bawah adalah harga dasar sebelum negosiasi volume.",
  },
];

/* Biodata dummy — TIDAK terhubung ke sistem login apa pun. */
const DUMMY_USER = {
  name: "Dimas Aditya Pratama",
  initials: "DA",
  business: "Warung Berkah Jaya",
  tier: "Gold Partner",
  phone: "+62 812-3456-7890",
  email: "dimas.aditya@email.com",
  memberSince: "Januari 2025",
  points: 1250,
  referralCode: "MATCHA-DIMAS25",
};

function formatRupiah(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function getProduct(slug) {
  return PRODUCTS.find(function (p) {
    return p.slug === slug;
  });
}

/* ---------------------------------------------------------
   1. KERANJANG (localStorage, tanpa backend)
   Struktur: [{ slug, qty }, ...]
   --------------------------------------------------------- */
const CART_KEY = "matchacih_cart";

function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}

function addToCart(slug, qty) {
  const cart = getCart();
  const existing = cart.find(function (i) {
    return i.slug === slug;
  });
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ slug: slug, qty: qty });
  }
  saveCart(cart);
}

/* qty <= 0 menghapus item dari keranjang. */
function updateCartQty(slug, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(function (i) {
      return i.slug !== slug;
    });
  } else {
    cart.forEach(function (i) {
      if (i.slug === slug) i.qty = qty;
    });
  }
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce(function (sum, i) {
    return sum + i.qty;
  }, 0);
}

function cartTotal() {
  return getCart().reduce(function (sum, i) {
    const product = getProduct(i.slug);
    return product ? sum + product.price * i.qty : sum;
  }, 0);
}

/* Semua elemen ber-atribut data-cart-badge disinkronkan sekaligus,
   supaya badge di header tiap halaman selalu konsisten. */
function renderCartBadge() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-badge]").forEach(function (el) {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
}

/* ---------------------------------------------------------
   2. USER PANEL (profil dummy)
   --------------------------------------------------------- */
function populateUserPanel() {
  const map = {
    "[data-user-name]": DUMMY_USER.name,
    "[data-user-initials]": DUMMY_USER.initials,
    "[data-user-business]": DUMMY_USER.business,
    "[data-user-tier]": DUMMY_USER.tier,
    "[data-user-phone]": DUMMY_USER.phone,
    "[data-user-email]": DUMMY_USER.email,
    "[data-user-member-since]": DUMMY_USER.memberSince,
    "[data-user-points]": DUMMY_USER.points.toLocaleString("id-ID"),
    "[data-referral-code]": DUMMY_USER.referralCode,
  };
  Object.keys(map).forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.textContent = map[sel];
    });
  });
}

function initUserPanel() {
  const panel = document.getElementById("userPanel");
  if (!panel) return;

  function open() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
  }
  function close() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-open-user]").forEach(function (el) {
    el.addEventListener("click", open);
  });
  panel.querySelectorAll("[data-close-user]").forEach(function (el) {
    el.addEventListener("click", close);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
}

/* ---------------------------------------------------------
   3. POP-UP BAGIKAN REFERRAL
   --------------------------------------------------------- */
function initReferralModal() {
  const modal = document.getElementById("referralModal");
  if (!modal) return;

  function open() {
    /* Tutup panel user dulu (bila terbuka) supaya modal tidak bertumpuk. */
    const userPanel = document.getElementById("userPanel");
    if (userPanel) {
      userPanel.classList.remove("is-open");
      userPanel.setAttribute("aria-hidden", "true");
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-open-referral]").forEach(function (el) {
    el.addEventListener("click", open);
  });
  modal.querySelectorAll("[data-close-referral]").forEach(function (el) {
    el.addEventListener("click", close);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  const copyBtn = document.getElementById("copyReferralBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      const finish = function () {
        const original = copyBtn.textContent;
        copyBtn.textContent = "Tersalin!";
        setTimeout(function () {
          copyBtn.textContent = original;
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(DUMMY_USER.referralCode)
          .then(finish, finish);
      } else {
        finish();
      }
    });
  }

  const shareBtn = document.getElementById("shareReferralBtn");
  if (shareBtn) {
    const text =
      "Halo! Saya pakai Matchacih BioPlastic untuk kemasan usaha saya dan mau ajak Anda coba juga. " +
      "Gunakan kode referral saya " +
      DUMMY_USER.referralCode +
      " untuk dapat diskon 10% di pemesanan pertama ya!";
    shareBtn.href = buildWaLink(text);
  }
}

/* ---------------------------------------------------------
   4. HALAMAN DETAIL PRODUK (product.html?slug=...)
   --------------------------------------------------------- */
function initProductPage() {
  const root = document.getElementById("productDetail");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || PRODUCTS[0].slug;
  const product = getProduct(slug) || PRODUCTS[0];

  document.title = product.name + " — Matchacih BioPlastic";
  const imgEl = document.getElementById("pdImage");
  imgEl.src = product.image;
  imgEl.alt = product.name;
  document.getElementById("pdBadge").textContent = product.badge;
  document.getElementById("pdName").textContent = product.name;
  document.getElementById("pdPrice").textContent =
    formatRupiah(product.price) + " / " + product.unit;
  document.getElementById("pdMoq").textContent =
    "Minimum order " +
    product.minOrder.toLocaleString("id-ID") +
    " " +
    product.unit;
  document.getElementById("pdDesc").textContent = product.description;

  const tagList = document.getElementById("pdTags");
  tagList.innerHTML = "";
  product.tags.forEach(function (tag) {
    const li = document.createElement("li");
    li.className = "tag";
    li.textContent = tag;
    tagList.appendChild(li);
  });

  const step = product.minOrder >= 100 ? 50 : 1;
  const qtyInput = document.getElementById("pdQty");
  qtyInput.value = product.minOrder;
  qtyInput.min = String(product.minOrder);
  qtyInput.step = String(step);

  const subtotalEl = document.getElementById("pdSubtotal");
  function currentQty() {
    return Math.max(
      product.minOrder,
      parseInt(qtyInput.value, 10) || product.minOrder,
    );
  }
  function updateSubtotal() {
    subtotalEl.textContent = formatRupiah(currentQty() * product.price);
  }
  updateSubtotal();
  qtyInput.addEventListener("input", updateSubtotal);
  qtyInput.addEventListener("change", function () {
    qtyInput.value = currentQty();
    updateSubtotal();
  });

  document.getElementById("pdQtyMinus").addEventListener("click", function () {
    qtyInput.value = Math.max(product.minOrder, currentQty() - step);
    updateSubtotal();
  });
  document.getElementById("pdQtyPlus").addEventListener("click", function () {
    qtyInput.value = currentQty() + step;
    updateSubtotal();
  });

  const addCartBtn = document.getElementById("pdAddCart");
  addCartBtn.addEventListener("click", function () {
    addToCart(product.slug, currentQty());
    const original = addCartBtn.textContent;
    addCartBtn.textContent = "✓ Ditambahkan";
    setTimeout(function () {
      addCartBtn.textContent = original;
    }, 1200);
  });

  document.getElementById("pdCheckout").addEventListener("click", function () {
    addToCart(product.slug, currentQty());
    window.location.href = "checkout.html";
  });

  /* Produk lainnya, agar pengguna bisa lanjut menjelajah tanpa kembali ke katalog. */
  const relatedGrid = document.getElementById("relatedGrid");
  if (relatedGrid) {
    PRODUCTS.filter(function (p) {
      return p.slug !== product.slug;
    }).forEach(function (p) {
      const card = document.createElement("a");
      card.className = "related__card";
      card.href = "product.html?slug=" + p.slug;
      card.innerHTML =
        '<img src="' +
        p.image +
        '" alt="' +
        p.name +
        '" />' +
        '<div class="related__card-body">' +
        "<h3>" +
        p.name +
        "</h3>" +
        "<span>" +
        formatRupiah(p.price) +
        " / " +
        p.unit +
        "</span>" +
        "</div>";
      relatedGrid.appendChild(card);
    });
  }
}

/* ---------------------------------------------------------
   5. HALAMAN CHECKOUT (checkout.html)
   --------------------------------------------------------- */
function initCheckoutPage() {
  const root = document.getElementById("checkoutPage");
  if (!root) return;

  const itemsEl = document.getElementById("cartItems");
  const emptyEl = document.getElementById("cartEmpty");
  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("sumSubtotal");
  const totalEl = document.getElementById("sumTotal");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  function render() {
    const cart = getCart();
    itemsEl.innerHTML = "";
    countEl.textContent = String(cartCount());
    emptyEl.hidden = cart.length !== 0;
    placeOrderBtn.disabled = cart.length === 0;

    cart.forEach(function (item) {
      const product = getProduct(item.slug);
      if (!product) return;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<img class="cart-item__img" src="' +
        product.image +
        '" alt="' +
        product.name +
        '" />' +
        '<div class="cart-item__info">' +
        "<h3>" +
        product.name +
        "</h3>" +
        "<p>" +
        formatRupiah(product.price) +
        " / " +
        product.unit +
        "</p>" +
        "</div>" +
        '<div class="cart-item__qty">' +
        '<button type="button" data-action="minus" aria-label="Kurangi jumlah">−</button>' +
        '<input type="number" value="' +
        item.qty +
        '" />' +
        '<button type="button" data-action="plus" aria-label="Tambah jumlah">+</button>' +
        "</div>" +
        '<div class="cart-item__subtotal">' +
        formatRupiah(product.price * item.qty) +
        "</div>" +
        '<button type="button" class="cart-item__remove">Hapus</button>';

      const step = product.minOrder >= 100 ? 50 : 1;
      const qtyInput = row.querySelector("input");

      row
        .querySelector('[data-action="minus"]')
        .addEventListener("click", function () {
          updateCartQty(
            product.slug,
            Math.max(product.minOrder, item.qty - step),
          );
          render();
        });
      row
        .querySelector('[data-action="plus"]')
        .addEventListener("click", function () {
          updateCartQty(product.slug, item.qty + step);
          render();
        });
      qtyInput.addEventListener("change", function () {
        const val = Math.max(
          product.minOrder,
          parseInt(qtyInput.value, 10) || product.minOrder,
        );
        updateCartQty(product.slug, val);
        render();
      });
      row
        .querySelector(".cart-item__remove")
        .addEventListener("click", function () {
          updateCartQty(product.slug, 0);
          render();
        });

      itemsEl.appendChild(row);
    });

    const total = cartTotal();
    subtotalEl.textContent = formatRupiah(total);
    totalEl.textContent = formatRupiah(total);
  }

  render();

  placeOrderBtn.addEventListener("click", function () {
    const cart = getCart();
    if (!cart.length) return;

    const nameInput = document.getElementById("coName");
    const businessInput = document.getElementById("coBusiness");
    const addressInput = document.getElementById("coAddress");
    const errorBox = document.getElementById("coError");

    const name = nameInput.value.trim();
    const business = businessInput.value.trim();
    const address = addressInput.value.trim();
    const payment = document.querySelector('input[name="payment"]:checked');

    if (name.length < 2) {
      if (errorBox) {
        errorBox.textContent = "Mohon isi nama pemesan terlebih dahulu.";
        errorBox.hidden = false;
      }
      nameInput.focus();
      return;
    }
    if (errorBox) errorBox.hidden = true;

    const lines = cart.map(function (item) {
      const product = getProduct(item.slug);
      return (
        "- " +
        product.name +
        " x" +
        item.qty +
        " " +
        product.unit +
        " = " +
        formatRupiah(product.price * item.qty)
      );
    });

    const text =
      "Halo Matchacih BioPlastic, saya ingin memesan:\n\n" +
      lines.join("\n") +
      "\n\nTotal: " +
      formatRupiah(cartTotal()) +
      "\n\nNama: " +
      name +
      "\nUsaha: " +
      (business || "-") +
      "\nAlamat: " +
      (address || "-") +
      "\nMetode Pembayaran: " +
      (payment ? payment.value : "-");

    window.open(buildWaLink(text), "_blank", "noopener");
  });
}

/* ---------------------------------------------------------
   6. INISIALISASI
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  renderCartBadge();
  populateUserPanel();
  initUserPanel();
  initReferralModal();
  initProductPage();
  initCheckoutPage();
});
