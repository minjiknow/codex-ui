/******************************
Start: Gnb
******************************/
document.querySelectorAll(".site-header").forEach((header) => {
  const panelButtons = header.querySelectorAll(".nav-toggle, .utility-toggle");
  const target = (button) => document.getElementById(button.getAttribute("aria-controls"));
  let openButton = null;

  const directory = header.querySelector(".mobile-directory");
  const directoryList = directory.querySelector(".directory");
  const directoryIndex = directory.querySelector(".directory-index");
  const sectionLinks = Array.from(directoryIndex.querySelectorAll(".directory-index-link"));
  const sections = sectionLinks.map((link) => directory.querySelector(link.hash));
  let currentSectionLink = null;

  function syncDirectoryIndex() {
    if (directory.hidden) return;
    const listTop = directoryList.getBoundingClientRect().top;
    const index = sections.findLastIndex(
      (section) => section.getBoundingClientRect().top <= listTop + 1,
    );
    const link = sectionLinks[Math.max(0, index)];
    if (link !== currentSectionLink) {
      currentSectionLink?.removeAttribute("aria-current");
      link.setAttribute("aria-current", "location");
      currentSectionLink = link;
    }
    const item = link.getBoundingClientRect();
    const pane = directoryIndex.getBoundingClientRect();
    if (item.top < pane.top) directoryIndex.scrollTop += item.top - pane.top;
    else if (item.bottom > pane.bottom) directoryIndex.scrollTop += item.bottom - pane.bottom;
  }
  directoryList.addEventListener("scroll", syncDirectoryIndex, {
    passive: true,
  });
  new ResizeObserver(syncDirectoryIndex).observe(directoryList);
  const background = [...header.children, ...document.body.children].filter(
    (element) => element !== directory && element !== header && element.tagName !== "SCRIPT",
  );
  let locked = [];

  function setDirectoryOpen(open) {
    if (open) {
      locked = background.filter((element) => !element.inert);
      locked.forEach((element) => {
        element.inert = true;
      });
      directoryList.scrollTop = 0;
      directoryIndex.scrollTop = 0;
      syncDirectoryIndex();
    } else {
      locked.forEach((element) => {
        element.inert = false;
      });
      locked = [];
    }
  }

  sectionLinks.forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const section = directory.querySelector(link.hash);
      section.querySelector(".directory-tit").focus({ preventScroll: true });
      directoryList.scrollBy({
        top: section.getBoundingClientRect().top - directoryList.getBoundingClientRect().top,
      });
      syncDirectoryIndex();
    }),
  );
  directoryList.addEventListener("click", (event) => {
    const item = event.target.closest("button.directory-link");
    if (!item) return;
    directoryList.querySelector('[aria-pressed="true"]')?.setAttribute("aria-pressed", "false");
    item.setAttribute("aria-pressed", "true");
  });
  const directorySearch = directory.querySelector(".directory-search");
  const directoryStatus = directory.querySelector(".directory-search-status");
  directorySearch.addEventListener("submit", (event) => {
    event.preventDefault();
    const field = directorySearch.querySelector(".directory-field");
    if (!field.value.trim()) {
      field.focus();
      return;
    }
    directoryStatus.textContent = "미리보기에서는 검색 서비스를 제공하지 않습니다.";
  });
  directorySearch.addEventListener("input", () => {
    directoryStatus.textContent = "";
  });
  directory.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = directory.querySelectorAll("a[href], button, input");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (
      (event.shiftKey && document.activeElement === first) ||
      (!event.shiftKey && document.activeElement === last)
    ) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });
  matchMedia("(max-width: 1280px)").addEventListener("change", (event) => {
    if (event.matches && openButton?.closest(".main-nav")) {
      closePanel();
      header.querySelector('[aria-controls="directory"]').focus();
    } else if (!event.matches && openButton && target(openButton) === directory) {
      closePanel();
      header.querySelector(".nav-toggle").focus();
    }
  });

  function collapse(button) {
    button.setAttribute("aria-expanded", "false");
    target(button).hidden = true;
  }

  function closePanel(restoreFocus = false) {
    if (!openButton) return;
    target(openButton).querySelectorAll('.group-toggle[aria-expanded="true"]').forEach(collapse);
    if (target(openButton) === directory) setDirectoryOpen(false);
    collapse(openButton);
    if (restoreFocus) openButton.focus();
    openButton = null;
  }

  panelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const wasOpen = button === openButton;
      closePanel();
      if (wasOpen) return;
      openButton = button;
      button.setAttribute("aria-expanded", "true");
      target(button).hidden = false;
      if (target(button) === directory) setDirectoryOpen(true);
      target(button).querySelector(".group-list .group-toggle")?.click();
      if (button.classList.contains("utility-toggle")) {
        target(button).querySelector(".field, .close").focus();
      }
    });
  });

  header.querySelectorAll(".group-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const wasOpen = !target(button).hidden;
      button.closest(".menu-list").querySelectorAll(".group-toggle").forEach(collapse);
      button.setAttribute("aria-expanded", String(!wasOpen));
      target(button).hidden = wasOpen;
    });
  });
  header
    .querySelectorAll(".close")
    .forEach((button) => button.addEventListener("click", () => closePanel(true)));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !openButton) return;
    const group = target(openButton).querySelector('.group-toggle[aria-expanded="true"]');
    if (group) {
      collapse(group);
      group.focus();
    } else closePanel(true);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!header.contains(event.target)) closePanel();
  });
  header.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) closePanel();
  });
});
/******************************
End: Gnb
******************************/
/******************************
Start: 통합검색
******************************/
document.querySelectorAll(".search-input").forEach((input) => {
  const clear = input.form.querySelector(".clear-search");
  function updateClearButton() {
    clear.hidden = input.value.length === 0;
  }
  clear.addEventListener("click", () => {
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  });
  input.addEventListener("input", updateClearButton);
  updateClearButton();
});
document.querySelectorAll(".preview-search").forEach((form) => {
  const input = form.querySelector('.field');
  const status = form.parentElement.querySelector(".search-status");
  const recent = form.parentElement.querySelector(".recent-search");
  const chips = recent.querySelector(".recent-chips");
  const eraseAll = recent.querySelector(".clear-history");
  const storageKey = "library-recent-searches";
  let terms = [...libraryPreviewData.recentSearches];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) terms = saved.filter((term) => typeof term === "string" && term.trim());
  } catch {
    // File previews can use in-memory history when storage is unavailable.
  }

  function renderHistory() {
    chips.replaceChildren();
    eraseAll.hidden = terms.length === 0;
    recent.querySelector(".chip-empty").hidden = terms.length !== 0;
    for (const [index, term] of terms.entries()) {
      const chip = recent.querySelector(".chip-template").content.cloneNode(true);
      const keyword = chip.querySelector(".recent-keyword");
      const remove = chip.querySelector(".chip-delete");
      keyword.textContent = term;
      keyword.addEventListener("click", () => {
        input.value = term;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
        form.requestSubmit();
      });
      remove.setAttribute("aria-label", term + " 삭제");
      remove.addEventListener("click", () => {
        saveHistory(terms.filter((value) => value !== term));
        const next = chips.children[Math.min(index, terms.length - 1)];
        (next?.querySelector(".chip-delete") || input).focus();
      });
      chips.append(chip);
    }
  }

  function saveHistory(updated) {
    terms = updated;
    try {
      localStorage.setItem(storageKey, JSON.stringify(terms));
    } catch {
      // Keep the current session usable without persistent storage.
    }
    renderHistory();
  }

  eraseAll.addEventListener("click", () => {
    saveHistory([]);
    input.focus();
  });
  renderHistory();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const term = input.value.trim();
    if (!term) {
      input.focus();
      return;
    }
    saveHistory([term, ...terms.filter((value) => value !== term)]);
    status.textContent = "미리보기에서는 검색 서비스를 제공하지 않습니다.";
  });
  form.addEventListener("input", () => {
    status.textContent = "";
  });
});
/******************************
End: 통합검색
******************************/
/******************************
Start: 선택박스
******************************/
function initDropbox(box) {
  const trigger = box.querySelector(".selected-text");
  const list = box.querySelector(".dropbox-option");
  const options = Array.from(list.querySelectorAll('[role=option]:not([aria-disabled="true"])'));
  const initial = box.dataset.value;

  function close() {
    list.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }
  function focusOption(index) {
    list.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    options[(index + options.length) % options.length].focus();
  }
  function syncOption(option) {
    options.forEach((item) => {
      item.classList.toggle("selected", item === option);
      item.setAttribute("aria-selected", String(item === option));
    });
    box.dataset.value = option.dataset.value;
    trigger.textContent = option.textContent.trim();
    trigger.setAttribute(
      "aria-label",
      list.getAttribute("aria-label") + ": " + trigger.textContent,
    );
  }
  function choose(option) {
    syncOption(option);
    close();
    box.dispatchEvent(
      new CustomEvent("dropdown:change", {
        bubbles: true,
        detail: { value: trigger.textContent, id: option.dataset.value },
      }),
    );
  }
  trigger.addEventListener("click", () => {
    if (list.hidden)
      focusOption(options.findIndex((item) => item.dataset.value === box.dataset.value));
    else close();
  });
  options.forEach((item) =>
    item.addEventListener("click", () => {
      choose(item);
      trigger.focus();
    }),
  );
  box.addEventListener("keydown", (event) => {
    const focused = options.indexOf(document.activeElement);
    const active = options.findIndex((item) => item.dataset.value === box.dataset.value);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Home") focusOption(0);
      else if (event.key === "End") focusOption(options.length - 1);
      else focusOption(focused < 0 ? active : focused + (event.key === "ArrowDown" ? 1 : -1));
    } else if (!list.hidden && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      trigger.focus();
    } else if (focused >= 0 && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      options[focused].click();
    } else if (event.key === "Tab" && !list.hidden) {
      close();
      trigger.focus();
    }
  });
  box.addEventListener("focusout", (event) => {
    if (!box.contains(event.relatedTarget)) close();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!box.contains(event.target)) close();
  });
  box
    .closest("form")
    ?.addEventListener("reset", () =>
      choose(options.find((item) => item.dataset.value === initial)),
    );
  return syncOption;
}
document.querySelectorAll(".dropbox").forEach(initDropbox);
/******************************
End: 선택박스
******************************/

/******************************
Start: 푸터
******************************/
document.querySelectorAll(".footer-bar").forEach((bar) => {
  const toggle = bar.querySelector(".org-toggle");
  const panel = bar.querySelector(".org-panel");
  const dismiss = panel.querySelector(".close");
  let background = [];
  toggle.addEventListener("click", () => {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    for (let node = panel; node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (
          sibling !== node &&
          !sibling.inert &&
          !["TEMPLATE", "SCRIPT"].includes(sibling.tagName)
        ) {
          sibling.inert = true;
          background.push(sibling);
        }
      }
    }
    dismiss.focus();
  });
  function close() {
    background.forEach((element) => {
      element.inert = false;
    });
    background = [];
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus({ preventScroll: true });
  }
  dismiss.addEventListener("click", close);
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    if (event.key === "Tab") {
      event.preventDefault();
      dismiss.focus();
    }
  });
});
/******************************
End: 푸터
******************************/

/******************************
Start: 콘텐츠 탭
******************************/
document.querySelectorAll(".tab-set").forEach((section) => {
  const tablist = section.querySelector('[role="tablist"]');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  let syncPicker;
  if (tablist.matches(".tabs.type2") && tabs.every((tab) => tab.matches(".tab.type1"))) {
    const picker = document.createElement("div");
    picker.className = "dropbox tab-select";
    picker.dataset.value = tabs.find((tab) => tab.getAttribute("aria-selected") === "true").id;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "selected-text";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const list = document.createElement("ul");
    list.className = "dropbox-option";
    list.id = tabs[0].id + "-options";
    list.hidden = true;
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", tablist.getAttribute("aria-label"));
    trigger.setAttribute("aria-controls", list.id);
    const options = new Map();
    tabs.forEach((tab) => {
      const option = document.createElement("li");
      option.className = "option-item";
      option.tabIndex = -1;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");
      if (tab.disabled) option.setAttribute("aria-disabled", "true");
      option.textContent = tab.textContent.trim();
      option.dataset.value = tab.id;
      list.append(option);
      options.set(tab.id, option);
    });
    picker.append(trigger, list);
    tablist.before(picker);
    const syncOption = initDropbox(picker);
    syncPicker = (tab) => syncOption(options.get(tab.id));
    picker.addEventListener("dropdown:change", (event) =>
      select(tabs.find((tab) => tab.id === event.detail.id)),
    );
  }
  function select(tab) {
    syncPicker?.(tab);
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      const panel = section.querySelector("#" + item.getAttribute("aria-controls"));
      panel.hidden = !active;
      if (active) section.dispatchEvent(new CustomEvent("tab:change", { bubbles: true, detail: { panel } }));
    });
  }
  select(tabs.find((tab) => tab.getAttribute("aria-selected") === "true"));
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const destinations = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = tabs[destinations[event.key]];
      if (!next) return;
      event.preventDefault();
      select(next);
      next.focus();
    });
  });
});
/******************************
End: 콘텐츠 탭
******************************/
/******************************
Start: 아코디언
******************************/
document.querySelectorAll("button.accordion").forEach((button) => {
  const panel = document.getElementById(button.getAttribute("aria-controls"));
  button.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
  });
});
/******************************
End: 아코디언
******************************/
