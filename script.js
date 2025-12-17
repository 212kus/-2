// --- メガメニュー（PC） ---
document.querySelectorAll(".navItem .navBtn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // 外側クリック判定との干渉を防ぐ
    const item = btn.closest(".navItem");
    const isOpen = item.classList.contains("open");

    // 全てのメニューを一旦リセット
    document.querySelectorAll(".navItem").forEach(i => {
      i.classList.remove("open");
      i.querySelector(".navBtn").setAttribute("aria-expanded", "false");
    });

    // クリックされたものだけトグル
    if (!isOpen) {
      item.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// メニュー外クリックで閉じる
document.addEventListener("click", () => {
  document.querySelectorAll(".navItem").forEach(i => i.classList.remove("open"));
  document.querySelectorAll(".navItem .navBtn").forEach(b => b.setAttribute("aria-expanded", "false"));
});

// --- スマホ：ハンバーガーメニュー ---
const ham = document.querySelector(".hamburger");
const gnav = document.querySelector(".gnav");

if (ham && gnav) {
  ham.addEventListener("click", () => {
    const isOpen = ham.classList.toggle("active"); // クラスの付け替えで制御
    gnav.classList.toggle("mobile-open", isOpen);
    ham.setAttribute("aria-expanded", String(isOpen));
  });
}
