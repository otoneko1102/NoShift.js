document.addEventListener("DOMContentLoaded", () => {
  const btnJa = document.getElementById("btn-ja");
  const btnEn = document.getElementById("btn-en");
  const contentJa = document.getElementById("content-ja");
  const contentEn = document.getElementById("content-en");

  if (!btnJa || !btnEn || !contentJa || !contentEn) {
    console.error("Language switching elements not found.");
    return;
  }

  function showContent(lang) {
    if (lang === "ja") {
      contentJa.classList.remove("hidden");
      contentEn.classList.add("hidden");
      btnJa.classList.add("active");
      btnEn.classList.remove("active");
      document.documentElement.lang = "ja";
    } else {
      contentEn.classList.remove("hidden");
      contentJa.classList.add("hidden");
      btnEn.classList.add("active");
      btnJa.classList.remove("active");
      document.documentElement.lang = "en";
    }
  }

  btnJa.addEventListener("click", () => showContent("ja"));
  btnEn.addEventListener("click", () => showContent("en"));

  showContent("ja");
});
