/******************************
Start: 바구니
******************************/
document.querySelectorAll(".basket-content .tabcontents").forEach((panel) => {
  const status = panel.querySelector(".basket-status");
  panel.querySelector(".view-list").addEventListener("click", () => {
    const count = panel.querySelector(".dropbox").dataset.value;
    status.textContent = count + "개씩 보기 · 표시할 자료가 없습니다.";
  });
  panel.querySelector(".previous-results").addEventListener("click", () => {
    status.textContent = "이전에 조회한 검색목록이 없습니다.";
    status.scrollIntoView({ block: "nearest" });
  });
});
document.querySelectorAll(".application-action").forEach((button) => {
  button.addEventListener("click", () => {
    const feedback = button.closest(".application-card").querySelector(".application-feedback");
    feedback.textContent = "바구니에 신청할 자료가 없습니다.";
  });
});
/******************************
End: 바구니
******************************/

/******************************
Start: 보도자료
******************************/
document.querySelectorAll(".press-board").forEach((board) => {
  const find = (selector) => board.querySelector(selector);
  const list = find(".press-results");
  const template = find(".press-template");
  const input = find(".press-input input");
  const clear = find(".press-clear");
  const pages = find(".press-pages");
  const records = libraryPreviewData.pressReleases;
  let matches = records.slice();
  let page = 1;
  let pageSize = 9;

  function setView(view) {
    list.classList.toggle("is-grid", view === "grid");
    board.querySelectorAll("[data-view]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    });
  }

  function render() {
    const totalPages = Math.ceil(matches.length / pageSize);
    const start = (page - 1) * pageSize;
    const rows = matches.slice(start, start + pageSize).map((record) => {
      const row = template.content.cloneNode(true);
      row.querySelector("a").href = "https://www.nl.go.kr/NL/contents/N50603000000.do?schM=view&id=" + record.id;
      row.querySelector("img").src = record.image;
      row.querySelector("strong").textContent = record.title;
      const date = row.querySelector("time");
      date.dateTime = date.textContent = record.date;
      row.querySelector(".press-hits").textContent = "조회 : " + record.hits;
      return row;
    });
    list.replaceChildren(...rows);
    find(".press-empty").hidden = matches.length > 0;
    pages.replaceChildren();
    pages.hidden = totalPages < 2;
    function addPage(label, target, disabled, current) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "page-button";
      button.textContent = label;
      button.dataset.page = target;
      button.disabled = disabled;
      if (current) button.setAttribute("aria-current", "page");
      pages.append(button);
    }
    if (totalPages > 1) {
      addPage("이전", page - 1, page === 1, false);
      for (let number = 1; number <= totalPages; number++) {
        addPage(String(number), number, false, page === number);
      }
      addPage("다음", page + 1, page === totalPages, false);
    }
    find(".press-status").textContent = "미리보기 자료 " + records.length + "건 중 " + matches.length + "건" +
      (totalPages ? " · " + page + " / " + totalPages + " 페이지" : "");
  }

  function apply() {
    const term = input.value.trim().toLocaleLowerCase();
    const field = find(".press-field").dataset.value;
    matches = records.filter((record) => {
      const text = field === "all" ? record.title + " " + record.summary : record[field];
      return text.toLocaleLowerCase().includes(term);
    });
    if (find(".press-sort").dataset.value === "oldest") matches.reverse();
    pageSize = Number(find(".press-count").dataset.value);
    page = 1;
    render();
  }

  find(".press-search").addEventListener("submit", (event) => {
    event.preventDefault();
    apply();
  });
  find(".press-apply").addEventListener("click", apply);
  input.addEventListener("input", () => { clear.hidden = !input.value; });
  clear.addEventListener("click", () => {
    input.value = "";
    clear.hidden = true;
    input.focus();
  });
  pages.addEventListener("click", (event) => {
    const button = event.target.closest(".page-button");
    if (button) pages.dispatchEvent(new CustomEvent("pagination:change", {detail: {page: Number(button.dataset.page)}}));
  });
  pages.addEventListener("pagination:change", (event) => {
    page = event.detail.page;
    render();
    list.querySelector("a")?.focus();
  });
  board.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
      try { localStorage.setItem("press-board-view", button.dataset.view); } catch {}
    });
  });
  let initialView = "list";
  try {
    if (localStorage.getItem("press-board-view") === "grid") initialView = "grid";
  } catch { /* 파일 저장소가 제한된 경우 기본 목록을 사용한다. */ }
  setView(initialView);
  render();
});
/******************************
End: 보도자료
******************************/
