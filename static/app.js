const state = {
  artworks: [],
  cart: JSON.parse(localStorage.getItem("studio_cart") || "[]"),
  config: {},
  filter: "Tümü",
  user: null,
  profile: null,
  journal: [],
  archive: [],
  search: "",
  sort: "featured",
};
const $ = (selector) => document.querySelector(selector);
const api = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, { credentials: "include", ...options });
  } catch (_) {
    throw new Error(
      "İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || errorMessage(response.status));
    error.status = response.status;
    throw error;
  }
  return data;
};
const errorMessage = (status) =>
  ({
    400: "Gönderilen bilgileri kontrol edin.",
    401: "Bu işlem için giriş yapmalısınız.",
    403: "Bu işlem için yetkiniz yok.",
    404: "İstenen içerik bulunamadı.",
    413: "Dosya çok büyük. Maksimum 100 MB yükleyebilirsiniz.",
    422: "Formdaki alanları kontrol edin.",
    500: "Sunucu kısa süreliğine yanıt veremedi.",
    502: "Dosya depolama servisi yanıt vermedi.",
  })[status] || "İşlem tamamlanamadı.";
const toast = (message, type = "error") => {
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.setAttribute("role", "alert");
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 3500);
};
const saveCart = () => {
  localStorage.setItem("studio_cart", JSON.stringify(state.cart));
  $("#cart-count").textContent = state.cart.length;
};
const formatDate = (date) => new Date(date).toLocaleDateString("tr-TR");

function renderArtworks() {
  const section = $("#works");
  if (section) section.hidden = !state.artworks.length;
  let list = state.artworks.filter((item) => {
    const matchesCategory = state.filter === "Tümü" || item.category === state.filter;
    const needle = state.search.trim().toLocaleLowerCase("tr-TR");
    const haystack = [item.title, item.description, item.medium, item.code].join(" ").toLocaleLowerCase("tr-TR");
    return matchesCategory && (!needle || haystack.includes(needle));
  });
  list = [...list].sort((a, b) => {
    if (state.sort === "title") return a.title.localeCompare(b.title, "tr");
    if (state.sort === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (state.sort === "newest") return new Date(b.created_at) - new Date(a.created_at);
    return Number(b.featured) - Number(a.featured) || (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const resultCount = $("#art-result-count");
  if (resultCount) resultCount.textContent = `${list.length} eser`;
  if (!list.length) {
    $("#art-grid").innerHTML = '<div class="empty-gallery"><span class="eyebrow">Arşivde eşleşme yok</span><p>Arama kelimesini veya filtreyi değiştirerek tekrar deneyin.</p></div>';
    return;
  }
  $("#art-grid").innerHTML = list
    .map(
      (art, index) =>
        `<article class="card ${index % 2 ? "offset" : ""}"><div class="media" data-open="${art.id}">${art.video_url ? `<video src="${art.video_url}" muted playsinline preload="metadata"></video>` : `<img src="${art.image_url}" alt="${escapeHtml(art.title)}" loading="lazy">`}${art.video_url ? '<span class="media-badge">▶ Video</span>' : ""}<button class="favorite" data-favorite="${art.id}" aria-label="Favorile">♡</button></div><div class="card-info"><div><div class="card-meta">${escapeHtml(art.category)} / ${art.code}</div><div class="card-title">${escapeHtml(art.title)}</div><div class="small muted">${escapeHtml(art.medium)} · ${escapeHtml(art.dimensions)}</div></div><button class="icon-btn" data-add="${art.id}" aria-label="Seçkilere ekle">＋</button></div></article>`,
    )
    .join("");
  document.querySelectorAll("[data-open]").forEach(
    (node) =>
      (node.onclick = (event) => {
        if (event.target.closest("[data-favorite]")) return;
        openLightbox(
          state.artworks.find((item) => item.id === node.dataset.open),
        );
      }),
  );
  document
    .querySelectorAll("[data-add]")
    .forEach(
      (node) =>
        (node.onclick = () =>
          addCart(state.artworks.find((item) => item.id === node.dataset.add))),
    );
  document
    .querySelectorAll("[data-favorite]")
    .forEach((node) => (node.onclick = () => favorite(node.dataset.favorite)));
}
function renderArchive() {
  const target = $("#archive-grid");
  if (!target) return;
  const section = $("#instagram-archive");
  if (section) section.hidden = !state.archive.length;
  target.innerHTML = state.archive.length
    ? state.archive.map((entry) => `<article class="card archive-card"><div class="media">${entry.media_type === "video" ? `<video src="${entry.media_url}" controls playsinline preload="metadata"></video>` : `<img src="${entry.media_url}" alt="${escapeHtml(entry.title || "Arşiv görseli")}" loading="lazy">`}<span class="media-badge">${escapeHtml(entry.kind)}</span></div><div class="card-info"><div><div class="card-meta">${escapeHtml(entry.source)} / ${formatDate(entry.created_at)}</div><div class="card-title">${escapeHtml(entry.title || "Başlıksız içerik")}</div><div class="small muted">${escapeHtml(entry.caption || "")}</div></div></div></article>`).join("")
    : '<div class="empty-gallery"><span class="eyebrow">Seçili arşiv</span><p>Atölyeden seçilen gönderiler, videolar ve öne çıkanlar burada sıralanacak.</p></div>';
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[char],
  );
}
function addCart(art) {
  if (!state.cart.some((item) => item.id === art.id)) {
    state.cart.push(art);
    saveCart();
    toast("Eser sepete eklendi.");
  } else toast("Bu eser zaten sepetinde.");
}
function openModal(content) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `<div class="modal">${content}</div>`;
  backdrop.onclick = (event) => {
    if (event.target === backdrop || event.target.closest("[data-close]"))
      backdrop.remove();
  };
  document.body.appendChild(backdrop);
  return backdrop;
}
function orderMessage(items) {
  return `Merhaba Mahmut Hocam, sitenizden şu eserlerle ilgileniyorum:\n\n${items.map((item) => `• ${item.title} (${item.code})`).join("\n")}\n\nFiyat ve detayları konuşabilir miyiz?`;
}
async function copyMessage(message) {
  try {
    await navigator.clipboard.writeText(message);
    return true;
  } catch (_) {
    const helper = document.createElement("textarea");
    helper.value = message;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const copied = document.execCommand("copy");
    helper.remove();
    return copied;
  }
}
async function sendMessage(message, channel = "whatsapp") {
  if (channel === "whatsapp" && state.config.whatsapp_number) {
    window.open(
      `https://wa.me/${state.config.whatsapp_number}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }
  if (channel === "instagram" && state.config.instagram_username) {
    const instagramWindow = window.open(
      `https://www.instagram.com/${encodeURIComponent(state.config.instagram_username)}/`,
      "_blank",
      "noopener,noreferrer",
    );
    const copied = await copyMessage(message);
    toast(
      copied
        ? "Mesaj kopyalandı. Instagram açılıyor; mesaj kutusuna yapıştırabilirsiniz."
        : "Instagram açılıyor. Mesajı kopyalayamadık; metni elle yazabilirsiniz.",
      "success",
    );
    if (!instagramWindow) toast("Instagram penceresi tarayıcı tarafından engellendi. Pop-up izni verin.");
    return;
  }
  toast(
    channel === "whatsapp"
      ? "WhatsApp numarası henüz yapılandırılmamış."
      : "Instagram kullanıcı adı henüz yapılandırılmamış.",
  );
}
function openOrder() {
  const modal = openModal(
    `<div class="modal-head"><div><div class="eyebrow">Atölyeden sana</div><h2>Bir hikâye çizelim.</h2></div><button class="icon-btn" data-close>×</button></div><label class="field">Çizim türü<select id="order-type"><option>Karakalem portre</option><option>Yağlı boya portre</option><option>Renkli portre</option><option>Evcil hayvan portresi</option><option>Dijital illüstrasyon</option></select></label><label class="field">Detay<textarea id="order-detail" rows="5" placeholder="Kimi çizelim, hangi duyguyu taşısın?"></textarea></label><label class="field">Referans fotoğrafı <span class="muted">(isteğe bağlı)</span><input id="order-reference" type="file" accept="image/jpeg,image/png,image/webp"></label><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-dark" id="send-whatsapp">WhatsApp’tan yaz ↗</button><button class="btn" id="send-instagram">Instagram’dan yaz ↗</button></div><p class="small muted">WhatsApp mesajı hazır açılır. Instagram seçilirse mesaj clipboard’a kopyalanır ve profil açılır.</p><p class="small muted">Ödeme sitede alınmaz. Referans yüklemek için hesabına giriş yapmalısın.</p>`,
  );
  const collectOrderMessage = async () => {
    const detail = modal.querySelector("#order-detail").value.trim();
    if (!detail) {
      toast("Lütfen çizim detayını yazın.");
      return null;
    }
    let reference = "";
    const file = modal.querySelector("#order-reference").files[0];
    if (file) {
      if (!state.user) return openAuth();
      try {
        const form = new FormData();
        form.append("file", file);
        reference = (
          await api("/api/commission/reference", { method: "POST", body: form })
        ).url;
      } catch (error) {
        return toast(error.message);
      }
    }
    const message = `Merhaba Mahmut Hocam, kişiye özel ${modal.querySelector("#order-type").value} siparişi vermek istiyorum.\n\nDetaylarım: ${detail}${reference ? `\n\nReferans fotoğrafı: ${reference}` : ""}`;
    return message;
  };
  const submitOrder = async (channel) => {
    try {
      const message = await collectOrderMessage(modal);
      if (!message) return;
      await sendMessage(message, channel);
      modal.remove();
    } catch (error) {
      toast(error.message);
    }
  };
  modal.querySelector("#send-whatsapp").onclick = () => submitOrder("whatsapp");
  modal.querySelector("#send-instagram").onclick = () => submitOrder("instagram");
}
function openAuth() {
  const modal = openModal(
    `<div class="modal-head"><div><div class="eyebrow">Studio üyeliği</div><h2>Hesabınla devam et.</h2></div><button class="icon-btn" data-close>×</button></div><div id="auth-message" class="small muted"></div><label class="field">Ad soyad<input id="auth-name" placeholder="Kayıtta gerekli" /></label><label class="field">E-posta<input id="auth-email" type="email" /></label><label class="field">Şifre<input id="auth-password" type="password" minlength="8" /></label><div style="display:flex;gap:10px"><button class="btn btn-dark" id="register">Hesap oluştur</button><button class="btn" id="login">Giriş yap</button></div>`,
  );
  const run = async (mode) => {
    try {
      const data = await api(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: $("#auth-email").value,
          password: $("#auth-password").value,
          name: $("#auth-name").value,
        }),
      });
      state.user = data.user;
      toast("Giriş başarılı.");
      modal.remove();
    } catch (error) {
      $("#auth-message").textContent = error.message;
    }
  };
  $("#register").onclick = () => run("register");
  $("#login").onclick = () => run("login");
}
function openCart() {
  const drawer = document.createElement("div");
  drawer.innerHTML = `<div class="modal-backdrop" style="justify-content:flex-end"><aside class="drawer"><div class="modal-head"><div><div class="eyebrow">Seçtiklerin</div><h2 style="font:44px 'Playfair Display',serif;margin:12px 0">Sepet (${state.cart.length})</h2></div><button class="icon-btn" data-close>×</button></div><div class="drawer-list">${state.cart.length ? state.cart.map((item) => `<div class="drawer-item"><img src="${item.image_url}" alt=""><div><div class="card-meta">${item.code}</div><div class="card-title">${escapeHtml(item.title)}</div><button class="icon-btn muted" data-remove="${item.id}">Kaldır</button></div></div>`).join("") : '<p class="muted">Sepetin henüz boş.</p>'}</div><button class="btn btn-dark" id="checkout" ${state.cart.length ? "" : "disabled"}>WhatsApp’tan konuş ↗</button><button class="btn" style="margin-top:10px" id="cart-custom">Kişiye özel çizim ✦</button></aside></div>`;
  document.body.appendChild(drawer);
  drawer.querySelector("[data-close]").onclick = () => drawer.remove();
  drawer.querySelectorAll("[data-remove]").forEach(
    (node) =>
      (node.onclick = () => {
        state.cart = state.cart.filter(
          (item) => item.id !== node.dataset.remove,
        );
        saveCart();
        drawer.remove();
        openCart();
      }),
  );
  drawer.querySelector("#checkout").onclick = () =>
    sendMessage(orderMessage(state.cart));
  drawer.querySelector("#cart-custom").onclick = () => {
    drawer.remove();
    openOrder();
  };
}
async function openLightbox(art) {
  const modal = openModal(
    `<div class="modal-head"><div><div class="eyebrow">${art.category} / ${art.code}</div><h2>${escapeHtml(art.title)}</h2></div><button class="icon-btn" data-close>×</button></div>${art.video_url ? `<video src="${art.video_url}" controls autoplay style="width:100%;max-height:430px"></video>` : `<img src="${art.image_url}" alt="${escapeHtml(art.title)}" style="width:100%;max-height:430px;object-fit:contain;background:#e6e0d5">`}<div class="detail-meta"><span>${escapeHtml(art.medium)}</span><span>${escapeHtml(art.dimensions)}</span><strong>${escapeHtml(art.price_label)}</strong></div><p>${escapeHtml(art.description)}</p><button class="btn btn-dark" id="detail-order">Bu eser hakkında iletişime geç ↗</button><div id="review-area"></div>`,
  );
  $("#detail-order").onclick = () => sendMessage(`Merhaba Mahmut Hocam, ${art.code} kodlu “${art.title}” eseriyle ilgileniyorum. Fiyat ve teslimat detaylarını öğrenebilir miyim?`, "whatsapp");
  try {
    const data = await api(`/api/reviews/${art.id}`);
    $("#review-area").innerHTML =
      `<div class="eyebrow">Yorumlar</div>${data.map((review) => `<blockquote>“${escapeHtml(review.body)}” <span class="muted">— ${escapeHtml(review.user_name)}</span></blockquote>`).join("")}<form id="review-form"><label class="field">Satın alma kodun<input name="purchase_code" placeholder="MS-XXXXXX" pattern="MS-[A-Z0-9]{6}" required></label><label class="field">Puan<select name="rating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label class="field">Yorumun<textarea name="body" rows="3" required placeholder="Eser sende ne hissettirdi?"></textarea></label><button class="btn btn-dark">Yorumu gönder</button><span class="small muted">Yorumun önce hocanın onayına düşer.</span></form>`;
    $("#review-form").onsubmit = async (event) => {
      event.preventDefault();
      if (!state.user) return openAuth();
      const payload = Object.fromEntries(new FormData(event.currentTarget));
      payload.artwork_id = art.id;
      payload.rating = Number(payload.rating);
      try {
        await api("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast("Yorumun onaya gönderildi.");
        event.currentTarget.reset();
      } catch (error) {
        toast(error.message);
      }
    };
  } catch (_) {}
}
async function favorite(id) {
  if (!state.user) return openAuth();
  try {
    await api(`/api/favorites/${id}`, { method: "POST" });
    toast("Favorilere eklendi.");
  } catch (error) {
    toast(error.message);
  }
}
function renderProfile() {
  if (!state.profile) return;
  $("#profile-name").textContent = state.profile.display_name || "Mahmut Saltık";
  $("#profile-location").textContent = state.profile.location
    ? `Profil · ${state.profile.location}`
    : "Sanatçı profili";
  $("#profile-headline").innerHTML = escapeHtml(state.profile.headline).replace(
    "\n",
    "<br>",
  );
  $("#profile-bio").textContent = state.profile.bio || "";
  const aboutBio = $("#about-bio");
  if (aboutBio) aboutBio.textContent = state.profile.bio || "";
  const aboutHeading = $("#about-heading");
  if (aboutHeading) aboutHeading.textContent = state.profile.display_name || "Mahmut Saltık";
  $("#art-count").textContent = state.artworks.length;
  $("#journal-count").textContent = state.journal.length;
}
function renderJournal() {
  const target = $("#journal-grid");
  if (!target) return;
  const section = $("#journal");
  if (section) section.hidden = !state.journal.length;
  target.innerHTML = state.journal.length
    ? state.journal
        .map(
          (entry) =>
            `<article class="card"><div class="media">${entry.media_url ? (entry.media_type === "video" ? `<video src="${entry.media_url}" controls style="width:100%;height:100%;object-fit:cover"></video>` : `<img src="${entry.media_url}" alt="${escapeHtml(entry.title)}" loading="lazy">`) : `<div style="height:100%;display:grid;place-items:center;padding:30px;text-align:center;font:26px 'Playfair Display',serif">${escapeHtml(entry.body.slice(0, 90))}</div>`}</div><div class="card-info"><div><div class="card-meta">${formatDate(entry.created_at)} / Stüdyo notu</div><div class="card-title">${escapeHtml(entry.title)}</div><div class="small muted">${escapeHtml(entry.body)}</div></div></div></article>`,
        )
        .join("")
    : "";
}
function renderHighlights() {
  const target = $("#highlight-row");
  if (!target) return;
  const entries = state.journal.filter((entry) => entry.featured).slice(0, 6);
  const section = $("#highlights-section");
  if (section) section.hidden = !entries.length;
  target.innerHTML = entries
    .map(
      (entry) =>
        `<a class="highlight" href="#journal" title="${escapeHtml(entry.title)}"><span class="highlight-ring"><span>${entry.media_url ? (entry.media_type === "video" ? "▶" : "✦") : "MS"}</span></span><small>${escapeHtml(entry.title).slice(0, 16)}</small></a>`,
    )
    .join("");
  target.classList.toggle("is-empty", !entries.length);
}

function bind() {
  $("#cart-count").textContent = state.cart.length;
  const orderButton = $("#order-btn") || $("#hero-order");
  if (orderButton) orderButton.onclick = openOrder;
  $("#account-btn").onclick = openAuth;
  $("#cart-btn").onclick = openCart;
  $("#instagram-profile").onclick = () => {
    if (!state.config.instagram_username)
      return toast("Instagram bağlantısı henüz yapılandırılmamış.");
    window.open(
      `https://www.instagram.com/${encodeURIComponent(state.config.instagram_username)}/`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  document.querySelectorAll("[data-filter]").forEach(
    (button) =>
      (button.onclick = () => {
        document
          .querySelectorAll("[data-filter]")
          .forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        state.filter = button.dataset.filter;
        renderArtworks();
      }),
  );
  const search = $("#art-search");
  if (search) search.oninput = () => { state.search = search.value; renderArtworks(); };
  const sort = $("#art-sort");
  if (sort) sort.onchange = () => { state.sort = sort.value; renderArtworks(); };
}
async function boot() {
  try {
    const [artworks, config, profile, journal, archive] = await Promise.all([
      api("/api/artworks"),
      api("/api/config"),
      api("/api/profile"),
      api("/api/journal"),
      api("/api/archive"),
    ]);
    state.artworks = artworks;
    state.config = config;
    state.profile = profile;
    state.journal = journal;
    state.archive = archive;
    try {
      state.user = (await api("/api/auth/me")).user;
    } catch (_) {}
    renderProfile();
    renderJournal();
    renderHighlights();
    renderArtworks();
    renderArchive();
    bind();
  } catch (error) {
    toast(error.message);
  }
}
boot();

// Motion fallback: Higgsfield hero video becomes an optional enhancement when a paid asset is available.
// The public site stays animated without depending on a remote generation job.
function installMotionFallback() {
  const progress = document.querySelector("#scroll-progress-bar");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
  const header = document.querySelector(".hero-v2");
  if (!header || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const visual = document.querySelector(".hero-v2-visual");
  if (visual) {
    header.addEventListener("pointermove", (event) => {
      const rect = header.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
      visual.style.transform = `translate(${x}px, ${y}px)`;
    });
    header.addEventListener("pointerleave", () => {
      visual.style.transform = "";
    });
  }
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("motion-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
}

installMotionFallback();
