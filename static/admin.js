const A = {
  artworks: [],
  reviews: [],
  journal: [],
  archive: [],
  commissions: [],
  profile: null,
  tab: "works",
  user: null,
};
const $ = (s) => document.querySelector(s);
const api = async (u, o = {}) => {
  const r = await fetch(u, { credentials: "include", ...o }),
    d = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(d.detail || "İşlem başarısız.");
  return d;
};
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>'"]/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#039;",
        '"': "&quot;",
      })[c],
  );
const toast = (m) => {
  const n = document.createElement("div");
  n.className = "toast";
  n.textContent = m;
  document.body.append(n);
  setTimeout(() => n.remove(), 2600);
};
function login() {
  document.body.innerHTML = `<main style="min-height:100vh;background:var(--ink);display:grid;place-items:center;padding:20px"><form id="login-form" class="modal" style="max-width:440px"><a class="brand" href="/"><span class="mark">M</span> Mahmut Saltık</a><div class="eyebrow" style="margin-top:55px">Yönetim alanı</div><h2>Hoş geldin,<br><i>Mahmut.</i></h2><label class="field">Güvenlik şifresi<input id="password" type="password" autofocus required></label><button class="btn btn-dark" style="width:100%">Panele gir ↗</button><p id="login-error" class="small muted"></p></form></main>`;
  $("#login-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const d = await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ password: $("#password").value }),
      });
      A.user = d.user;
      await dashboard();
    } catch (err) {
      $("#login-error").textContent = err.message;
    }
  };
}
async function dashboard() {
  [A.artworks, A.reviews, A.journal, A.profile, A.archive, A.commissions] = await Promise.all([
    api("/api/artworks?include_unpublished=true"),
    api("/api/admin/reviews"),
    api("/api/admin/journal"),
    api("/api/profile"),
    api("/api/admin/archive"),
    api("/api/admin/commission-requests"),
  ]);
  renderShell();
  renderTab();
}
function renderShell() {
  document.body.innerHTML = `<div class="admin-shell"><header class="admin-nav"><div class="container"><a href="/" class="brand"><span class="mark">M</span> Mahmut Saltık / Yönetim</a><button id="logout" class="btn" style="color:var(--paper);border-color:rgba(243,240,233,.3)">Siteden çık ↗</button></div></header><div class="container admin-layout"><aside class="side"><button class="active" data-tab="works">Eserler</button><button data-tab="upload">Yeni yükleme</button><button data-tab="archive">Instagram arşivi</button><button data-tab="commissions">Sipariş talepleri</button><button data-tab="reviews">Yorumlar <span id="pending-count"></span></button><button data-tab="journal">Stüdyo Günlüğü</button><button data-tab="profile">Profil</button><button data-tab="settings">Kurulum notları</button></aside><main id="dashboard-main"></main></div></div>`;
  document.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        A.tab = b.dataset.tab;
        document
          .querySelectorAll("[data-tab]")
          .forEach((x) => x.classList.toggle("active", x === b));
        renderTab();
      }),
  );
  $("#logout").onclick = async () => {
    await api("/api/auth/logout", { method: "POST" });
    login();
  };
}
function renderTab() {
  const main = $("#dashboard-main");
  if (A.tab === "works") main.innerHTML = worksView();
  if (A.tab === "upload") main.innerHTML = uploadView();
  if (A.tab === "reviews") main.innerHTML = reviewsView();
  if (A.tab === "journal") main.innerHTML = journalView();
  if (A.tab === "archive") main.innerHTML = archiveView();
  if (A.tab === "commissions") main.innerHTML = commissionsView();
  if (A.tab === "profile") main.innerHTML = profileView();
  if (A.tab === "settings") main.innerHTML = settingsView();
  bindTab();
}
function worksView() {
  const published = A.artworks.filter((x) => x.published).length;
  return `<div class="dash-head"><div><div class="eyebrow">Kontrol merkezi</div><h1>Atölyenin vitrini.</h1><p class="muted">Eserlerini sen yönet. Yükle, düzenle, yayından kaldır.</p></div><button class="btn btn-dark" data-goto="upload">+ Yeni eser</button></div><div class="stats"><div class="stat"><div class="eyebrow">Toplam eser</div><strong>${A.artworks.length}</strong></div><div class="stat"><div class="eyebrow">Yayında</div><strong>${published}</strong></div><div class="stat"><div class="eyebrow">Bekleyen yorum</div><strong>${A.reviews.filter((x) => !x.approved).length}</strong></div></div><div class="panel"><h3>Eserlerin</h3><div class="table-scroll"><table class="admin-table"><thead><tr><th>Görsel</th><th>Başlık</th><th>Kod</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>${A.artworks.map((a) => `<tr><td><img class="thumb" src="${a.image_url}" alt=""></td><td><strong>${esc(a.title)}</strong><br><span class="small muted">${esc(a.category)} · ${esc(a.medium)}</span></td><td class="mono">${a.code}</td><td><span class="status ${a.published ? "ok" : "off"}">${a.published ? "Yayında" : "Gizli"}</span></td><td><button class="btn" data-edit="${a.id}">Düzenle</button> <button class="btn" data-delete="${a.id}">Sil</button></td></tr>`).join("")}</tbody></table></div></div>`;
}
function uploadView(edit) {
  return `<div class="dash-head"><div><div class="eyebrow">İçerik üret</div><h1>${edit ? "Eseri düzenle" : "Yeni eser ekle"}</h1><p class="muted">Fotoğraf veya MP4 video yükle. Sistem otomatik MS kodu üretir.</p></div></div><div class="panel"><form id="art-form" data-edit="${edit?.id || ""}" enctype="multipart/form-data"><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 28px"><label class="field">Eser adı<input name="title" required value="${esc(edit?.title || "")}"></label><label class="field">Kategori<select name="category"><option>Karakalem</option><option>Yağlı Boya</option><option>Renkli</option><option>Dijital</option><option>Video</option></select></label><label class="field">Teknik<input name="medium" required value="${esc(edit?.medium || "Grafit ve kömür")}"></label><label class="field">Boyut<input name="dimensions" required value="${esc(edit?.dimensions || "Belirtilmedi")}"></label><label class="field">Fiyat etiketi<input name="price_label" required value="${esc(edit?.price_label || "Bilgi için iletişim")}"></label><label class="field">Sıra numarası<input name="sort_order" type="number" min="0" value="${edit?.sort_order || 0}"></label><label class="field"><input type="checkbox" name="featured" ${edit?.featured ? "checked" : ""}> Portfolyoda öne çıkar</label></div><label class="field">Açıklama<textarea name="description" rows="5" required>${esc(edit?.description || "")}</textarea></label>${edit ? `<label class="field"><input type="checkbox" name="published" ${edit.published ? "checked" : ""}> Bu eseri sitede yayınla</label>` : `<label class="field"><input type="checkbox" name="published"> Yükleme tamamlanınca hemen yayınla</label><div class="dropzone" id="media-dropzone"><strong>Görsel veya video dosyanı seç</strong><br><span class="small muted">JPG, PNG, WEBP, MP4, WEBM · Maksimum 100 MB</span><input name="file" type="file" accept="image/*,video/*" required><div id="media-preview" class="media-preview"></div></div>`}<button class="btn btn-dark" style="margin-top:22px">${edit ? "Değişiklikleri kaydet" : "Taslağı kaydet"} ↗</button></form></div>`;
}
function reviewsView() {
  const pending = A.reviews.filter((x) => !x.approved);
  $("#pending-count").textContent = pending.length ? `(${pending.length})` : "";
  return `<div class="dash-head"><div><div class="eyebrow">Topluluk</div><h1>Yorumlar.</h1><p class="muted">Müşteri koduyla gelen yorumları burada onayla veya kaldır.</p></div></div><div class="panel">${A.reviews.length ? A.reviews.map((r) => `<div class="review"><div class="review-body"><div class="card-meta">${r.code} · ${esc(r.artwork_title)} · ${"★".repeat(r.rating)}</div><p>“${esc(r.body)}”</p><span class="small muted">${esc(r.user_name)} · ${formatDate(r.created_at)} · ${r.approved ? "Yayında" : "Onay bekliyor"}</span></div><div class="review-actions">${!r.approved ? `<button class="btn btn-dark" data-approve="${r.id}">Onayla</button>` : ""}<button class="btn" data-review-delete="${r.id}">Sil</button></div></div>`).join("") : '<p class="muted">Henüz yorum yok.</p>'}</div>`;
}
function archiveView() {
  return `<div class="dash-head"><div><div class="eyebrow">Instagram’dan bağımsız arşiv</div><h1>Öne çıkanlar.</h1><p class="muted">Export’tan seçilen gönderi ve videoları burada sıralı biçimde yayınla.</p></div></div><div class="panel"><h3>Arşive medya ekle</h3><form id="archive-form" enctype="multipart/form-data"><label class="field">İçerik türü<select name="kind"><option value="highlight">Öne çıkan</option><option value="post">Gönderi</option><option value="video">Video</option></select></label><label class="field">Başlık<input name="title"></label><label class="field">Açıklama<textarea name="caption" rows="4"></textarea></label><label class="field">Sıra numarası<input name="sort_order" type="number" min="0" value="${A.archive.length}"></label><label class="field"><input type="checkbox" name="published"> Hemen yayınla</label><div class="dropzone"><strong>Görsel veya video seç</strong><input name="file" type="file" accept="image/*,video/*" required></div><button class="btn btn-dark" style="margin-top:18px">Arşive ekle ↗</button></form></div><div class="panel" style="margin-top:20px"><h3>Sıralı içerikler</h3>${A.archive.length ? A.archive.map((entry) => `<div class="review"><div class="review-body"><div class="card-meta">${entry.sort_order} · ${esc(entry.kind)} · ${entry.published ? "Yayında" : "Taslak"}</div><strong>${esc(entry.title || "Başlıksız içerik")}</strong><p>${esc(entry.caption || "Açıklama yok")}</p></div><div class="review-actions"><button class="btn" data-archive-toggle="${entry.id}" data-published="${entry.published}">${entry.published ? "Gizle" : "Yayınla"}</button><button class="btn" data-archive-delete="${entry.id}">Sil</button></div></div>`).join("") : '<p class="muted">Henüz arşiv içeriği yok.</p>'}</div>`;
}
function commissionsView() {
  return `<div class="dash-head"><div><div class="eyebrow">Özel çizim</div><h1>Sipariş talepleri.</h1><p class="muted">Ana sayfadaki formdan gelen talepler burada kalıcı olarak tutulur.</p></div></div><div class="panel"><h3>${A.commissions.length} talep</h3>${A.commissions.length ? A.commissions.map((request) => `<div class="review"><div class="review-body"><div class="card-meta">${esc(request.drawing_type)} · ${formatDate(request.created_at)} · ${esc(request.channel)}</div><strong>${esc(request.name)}${request.email ? ` · ${esc(request.email)}` : ""}</strong><p>${esc(request.details)}</p>${request.reference_url ? `<a class="small" href="${esc(request.reference_url)}" target="_blank" rel="noreferrer">Referans görselini aç ↗</a>` : ""}</div><div class="review-actions"><select data-commission-status="${request.id}"><option value="new" ${request.status === "new" ? "selected" : ""}>Yeni</option><option value="contacted" ${request.status === "contacted" ? "selected" : ""}>İletişime geçildi</option><option value="completed" ${request.status === "completed" ? "selected" : ""}>Tamamlandı</option><option value="cancelled" ${request.status === "cancelled" ? "selected" : ""}>İptal</option></select><button class="btn" data-commission-delete="${request.id}">Sil</button></div></div>`).join("") : '<p class="muted">Henüz sipariş talebi yok.</p>'}</div>`;
}
function settingsView() {
  return `<div class="dash-head"><div><div class="eyebrow">Kurulum notları</div><h1>Basitçe yönet.</h1></div></div><div class="panel"><h3>Günlük kullanım</h3><p>Yeni bir eser için <strong>Yeni yükleme</strong> sekmesine gir, görseli veya MP4 videoyu seç ve yayınla. Sistem otomatik benzersiz bir MS kodu üretir.</p><p>Müşteri, satın aldığı eserin MS kodunu girerek yorum bırakabilir. Yorumlar önce burada bekler; sen onayladığında ana sayfada görünür.</p><p class="muted small">Sipariş ve ödeme bu sitede alınmaz. Müşteri, sepet veya özel çizim formundan WhatsApp / Instagram’a yönlendirilir.</p></div>`;
}
function profileView() {
  const profile = A.profile || {};
  return `<div class="dash-head"><div><div class="eyebrow">Kimlik</div><h1>Profilin.</h1><p class="muted">Ana sayfadaki biyografi ve iletişim kimliğini buradan güncelle.</p></div></div><div class="panel"><form id="profile-form"><label class="field">İsim<input name="display_name" required value="${esc(profile.display_name || "Mahmut Saltık")}"></label><label class="field">Başlık<input name="headline" required value="${esc(profile.headline || "Çizgi, bir izdir.")}"></label><label class="field">Biyografi<textarea name="bio" rows="7" required>${esc(profile.bio || "")}</textarea></label><label class="field">Konum<input name="location" value="${esc(profile.location || "")}" placeholder="İsteğe bağlı"></label><label class="field">Instagram profil bağlantısı<input name="instagram_url" type="url" value="${esc(profile.instagram_url || "")}" placeholder="https://instagram.com/..." /></label><button class="btn btn-dark">Profili kaydet ↗</button></form></div>`;
}
function journalView() {
  return `<div class="dash-head"><div><div class="eyebrow">Atölye notları</div><h1>Stüdyo Günlüğü.</h1><p class="muted">Instagram kopyası değil; hocanın kendi seçtiği süreç, not ve video arşivi.</p></div></div><div class="panel"><h3>Yeni günlük kaydı</h3><form id="journal-form" enctype="multipart/form-data"><label class="field">Başlık<input name="title" required placeholder="Bugün grafit biraz daha sessizdi."></label><label class="field">Not<textarea name="body" rows="5" required></textarea></label><label class="field">Fotoğraf / video <input name="file" type="file" accept="image/*,video/*"></label><label class="field"><input type="checkbox" name="featured"> Günlüğün başında öne çıkar</label><button class="btn btn-dark">Günlüğe ekle ↗</button></form></div><div class="panel" style="margin-top:20px"><h3>Yayınlanan notlar</h3>${A.journal.length ? A.journal.map((entry) => `<div class="review"><div class="review-body"><div class="card-meta">${formatDate(entry.created_at)} · ${entry.published ? "Yayında" : "Gizli"}</div><strong>${esc(entry.title)}</strong><p>${esc(entry.body)}</p></div><div class="review-actions"><button class="btn" data-journal-toggle="${entry.id}" data-published="${entry.published}">${entry.published ? "Gizle" : "Yayınla"}</button><button class="btn" data-journal-delete="${entry.id}">Sil</button></div></div>`).join("") : '<p class="muted">Henüz günlük notu yok.</p>'}</div>`;
}

function bindTab() {
  document.querySelectorAll("[data-goto]").forEach(
    (b) =>
      (b.onclick = () => {
        A.tab = b.dataset.goto;
        renderTab();
      }),
  );
  document.querySelectorAll("[data-edit]").forEach(
    (b) =>
      (b.onclick = () => {
        A.tab = "upload";
        $("#dashboard-main").innerHTML = uploadView(
          A.artworks.find((x) => x.id === b.dataset.edit),
        );
        bindTab();
      }),
  );
  document.querySelectorAll("[data-delete]").forEach(
    (b) =>
      (b.onclick = async () => {
        if (confirm("Bu eseri silmek istediğine emin misin?")) {
          await api(`/api/admin/artworks/${b.dataset.delete}`, {
            method: "DELETE",
          });
          await dashboard();
        }
      }),
  );
  document
    .querySelectorAll("[data-approve]")
    .forEach((b) => (b.onclick = () => moderate(b.dataset.approve, true)));
  document.querySelectorAll("[data-review-delete]").forEach(
    (b) =>
      (b.onclick = async () => {
        if (confirm("Bu yorumu silmek istediğine emin misin?")) {
          await api(`/api/admin/reviews/${b.dataset.reviewDelete}`, {
            method: "DELETE",
          });
          await dashboard();
        }
      }),
  );
  document.querySelectorAll("[data-commission-status]").forEach((select) => {
    select.onchange = async () => {
      try {
        await api(`/api/admin/commission-requests/${select.dataset.commissionStatus}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: select.value }) });
        toast("Sipariş durumu güncellendi.");
      } catch (error) {
        toast(error.message);
      }
    };
  });
  document.querySelectorAll("[data-commission-delete]").forEach((button) => {
    button.onclick = async () => {
      if (!confirm("Bu sipariş talebini silmek istediğine emin misin?")) return;
      await api(`/api/admin/commission-requests/${button.dataset.commissionDelete}`, { method: "DELETE" });
      await dashboard();
    };
  });
  const form = $("#art-form");
  const fileInput = form?.elements.file;
  const preview = $("#media-preview");
  if (fileInput && preview)
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      preview.innerHTML = file.type.startsWith("video/")
        ? `<video src="${url}" controls></video>`
        : `<img src="${url}" alt="Seçilen medya önizlemesi">`;
    };
  if (form)
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        const editId = form.dataset.edit;
        if (editId) {
          const payload = Object.fromEntries(new FormData(form));
          payload.featured = form.elements.featured.checked;
          payload.published = form.elements.published.checked;
          await api(`/api/admin/artworks/${editId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          await api("/api/admin/artworks", {
            method: "POST",
            body: new FormData(form),
          });
        }
        toast(editId ? "Eser güncellendi." : "Eser yüklendi ve kaydedildi.", "success");
        await dashboard();
      } catch (error) {
        toast(error.message);
      }
    };
  const profileForm = $("#profile-form");
  if (profileForm)
    profileForm.onsubmit = async (event) => {
      event.preventDefault();
      try {
        await api("/api/admin/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(profileForm))),
        });
        toast("Profil güncellendi.");
        await dashboard();
        A.tab = "profile";
        renderTab();
      } catch (error) {
        toast(error.message);
      }
    };
  const journalForm = $("#journal-form");
  if (journalForm)
    journalForm.onsubmit = async (event) => {
      event.preventDefault();
      try {
        await api("/api/admin/journal", {
          method: "POST",
          body: new FormData(journalForm),
        });
        toast("Günlük notu eklendi.");
        await dashboard();
        A.tab = "journal";
        renderTab();
      } catch (error) {
        toast(error.message);
      }
    };
  const archiveForm = $("#archive-form");
  if (archiveForm)
    archiveForm.onsubmit = async (event) => {
      event.preventDefault();
      try {
        await api("/api/admin/archive", { method: "POST", body: new FormData(archiveForm) });
        toast("Arşiv içeriği eklendi.");
        await dashboard();
        A.tab = "archive";
        renderTab();
      } catch (error) {
        toast(error.message);
      }
    };
  document.querySelectorAll("[data-archive-toggle]").forEach((button) => {
    button.onclick = async () => {
      await api(`/api/admin/archive/${button.dataset.archiveToggle}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: button.dataset.published !== "true" }),
      });
      await dashboard();
      A.tab = "archive";
      renderTab();
    };
  });
  document.querySelectorAll("[data-archive-delete]").forEach((button) => {
    button.onclick = async () => {
      if (!confirm("Bu arşiv içeriğini silmek istediğine emin misin?")) return;
      await api(`/api/admin/archive/${button.dataset.archiveDelete}`, { method: "DELETE" });
      await dashboard();
      A.tab = "archive";
      renderTab();
    };
  });
  document.querySelectorAll("[data-journal-delete]").forEach(
    (button) =>
      (button.onclick = async () => {
        if (confirm("Bu günlük kaydını silmek istediğine emin misin?")) {
          await api(`/api/admin/journal/${button.dataset.journalDelete}`, {
            method: "DELETE",
          });
          await dashboard();
          A.tab = "journal";
          renderTab();
        }
      }),
  );
  document.querySelectorAll("[data-journal-toggle]").forEach(
    (button) =>
      (button.onclick = async () => {
        const form = { published: button.dataset.published !== "true" };
        await api(`/api/admin/journal/${button.dataset.journalToggle}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        await dashboard();
        A.tab = "journal";
        renderTab();
      }),
  );
}
async function moderate(id, approved) {
  const form = new FormData();
  form.append("approved", approved);
  await api(`/api/admin/reviews/${id}`, { method: "PATCH", body: form });
  await dashboard();
}
function formatDate(date) {
  return new Date(date).toLocaleDateString("tr-TR");
}
login();
