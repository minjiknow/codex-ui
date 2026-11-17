/* Standalone date/month/time pickers. All values are local calendar dates or 24-hour times. */
(() => {
  "use strict";
  if (window.KwsPickers) {
    window.KwsPickers.init();
    return;
  }
  const states = new WeakMap();
  const assets = new URL("../assets/icons/", document.currentScript.src);
  const pad = (value) => String(value).padStart(2, "0");
  const dateValue = (date) =>
    `${String(date.getFullYear()).padStart(4, "0")}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const makeDate = (year, month, day = 1) => {
    const date = new Date(2000, 0, 1, 12);
    date.setFullYear(year, month, day);
    return date;
  };
  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (year < 1 || year > 9999 || month < 1 || month > 12) return null;
    const date = makeDate(year, month - 1, day);
    return dateValue(date) === value ? date : null;
  }
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  const validMonth = (value) =>
    /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && Number(value.slice(0, 4)) > 0;
  let sequence = 0,
    active = null;
  function find(scope) {
    return [
      ...(scope.matches?.(".picker") ? [scope] : []),
      ...scope.querySelectorAll(".picker"),
    ];
  }
  function groupStates(state) {
    const group = state.root.closest(".picker-range");
    return group
      ? [...group.querySelectorAll(".picker")]
          .filter((el) => el.closest(".picker-range") === group)
          .map((el) => states.get(el))
          .filter(Boolean)
      : [state];
  }
  function setError(state, message) {
    state.input.setCustomValidity(message);
    state.root.classList.toggle("has-error", Boolean(message));
    if (message) state.input.setAttribute("aria-invalid", "true");
    else state.input.removeAttribute("aria-invalid");
    state.error.textContent = message;
    state.error.hidden = !message;
  }
  function validateState(state) {
    const peers = groupStates(state);
    peers.forEach((peer) => {
      const value = peer.input.value.trim();
      let message = "";
      const valid =
        peer.kind === "time"
          ? validTime(value)
          : peer.kind === "month"
            ? validMonth(value)
            : parseDate(value);
      if (value && !valid)
        message =
          peer.kind === "time"
            ? "시간을 HH:MM 형식으로 입력하세요."
            : "올바른 날짜를 입력하세요.";
      if (
        !message &&
        value &&
        ((peer.root.dataset.min && value < peer.root.dataset.min) ||
          (peer.root.dataset.max && value > peer.root.dataset.max))
      )
        message = "선택 가능한 범위를 확인하세요.";
      if (
        !message &&
        value &&
        peer.kind === "time" &&
        Number(value.slice(3)) % peer.step
      )
        message = `${peer.step}분 단위로 입력하세요.`;
      setError(peer, message);
    });
    const start = peers.find((peer) => peer.root.dataset.rangeRole === "start");
    const end = peers.find((peer) => peer.root.dataset.rangeRole === "end");
    if (
      start &&
      end &&
      start.kind === end.kind &&
      start.input.value &&
      end.input.value &&
      !start.input.validationMessage &&
      !end.input.validationMessage &&
      start.input.value > end.input.value
    ) {
      const message =
        start.kind === "time"
          ? "종료시간은 시작시간보다 빠를 수 없습니다."
          : "종료일은 시작일보다 빠를 수 없습니다.";
      setError(end, message);
    }
    if (active && peers.includes(active)) position(active);
    return peers.every((peer) => peer.input.validity.valid);
  }
  function validate(scope = document) {
    init(scope);
    find(scope).forEach((root) => validateState(states.get(root)));
    return find(scope).every((root) => states.get(root).input.validity.valid);
  }
  function button(className, label, icon, action) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = className;
    el.setAttribute("aria-label", label);
    if (icon) {
      const img = document.createElement("img");
      img.src = new URL(`${icon}.svg`, assets).href;
      img.alt = "";
      el.append(img);
    } else el.textContent = label;
    if (action) el.dataset.pickerAction = action;
    return el;
  }
  function position(state) {
    if (state.panel.hidden) return;
    const anchor = state.input.getBoundingClientRect(),
      box = state.panel.getBoundingClientRect();
    const desired =
      state.kind === "time"
        ? anchor.left + (anchor.width - box.width) / 2
        : anchor.left;
    const left = Math.max(8, Math.min(desired, innerWidth - box.width - 8));
    let top = anchor.bottom + 4;
    if (top + box.height > innerHeight - 8 && anchor.top > box.height + 8)
      top = anchor.top - box.height - 4;
    state.panel.style.left = `${left}px`;
    state.panel.style.top = `${Math.max(8, top)}px`;
    state.panel.style.maxHeight = `${Math.max(80, innerHeight - Math.max(8, top) - 8)}px`;
    state.panel.style.overflowY = "auto";
    if (!state.error.hidden) {
      const placed = state.panel.getBoundingClientRect();
      Object.assign(state.error.style, {
        position: "fixed",
        zIndex: "1001",
        left: `${anchor.left}px`,
        top: `${placed.bottom + 2}px`,
        width: `${anchor.width}px`,
      });
    }
  }
  function close(state, restore = false) {
    state.panel.hidden = true;
    state.error.removeAttribute("style");
    state.toggle.setAttribute("aria-expanded", "false");
    state.input.setAttribute("aria-expanded", "false");
    if (active === state) active = null;
    if (restore) state.toggle.focus();
  }
  function commit(state, value, finish = false) {
    state.input.value = value;
    state.input.dispatchEvent(new Event("input", { bubbles: true }));
    state.input.dispatchEvent(new Event("change", { bubbles: true }));
    state.root.dispatchEvent(
      new CustomEvent("kws:picker-change", {
        bubbles: true,
        detail: { value, kind: state.kind },
      }),
    );
    if (finish) close(state, true);
  }
  function bounded(state, value) {
    return (
      (!state.root.dataset.min || value >= state.root.dataset.min) &&
      (!state.root.dataset.max || value <= state.root.dataset.max)
    );
  }
  function drawCalendar(state, focusValue) {
    const { panel, view } = state;
    panel.replaceChildren();
    const year = view.getFullYear(),
      month = view.getMonth(),
      months = state.mode === "months";
    const header = document.createElement("div");
    header.className = "picker-header";
    const nav = (label, icon, action, disabled) => {
      const el = button("picker-nav", label, icon, action);
      el.disabled = disabled;
      header.append(el);
    };
    if (!months)
      nav("이전 연도", "calendar-previous-year", "previous-year", year === 1);
    nav(
      months ? "이전 연도" : "이전 달",
      "calendar-previous-month",
      months ? "previous-year" : "previous-month",
      year === 1 && (months || month === 0),
    );
    const title = button(
      "picker-title text",
      months ? String(year) : `${year}-${pad(month + 1)}`,
      null,
      "months",
    );
    title.setAttribute(
      "aria-label",
      months
        ? `${year}년 날짜 선택으로 돌아가기`
        : `${year}년 ${month + 1}월, 월 선택 열기`,
    );
    header.append(title);
    nav(
      months ? "다음 연도" : "다음 달",
      months ? "calendar-next-year-single" : "calendar-next-month",
      months ? "next-year" : "next-month",
      year === 9999 && (months || month === 11),
    );
    if (!months)
      nav("다음 연도", "calendar-next-year", "next-year", year === 9999);
    panel.append(header);
    if (months) {
      const grid = document.createElement("div");
      grid.className = "picker-months";
      grid.setAttribute("role", "group");
      grid.setAttribute("aria-label", `${year}년 월 선택`);
      for (let i = 0; i < 12; i++) {
        const value = `${String(year).padStart(4, "0")}-${pad(i + 1)}`;
        const el = button("picker-month text", String(i + 1));
        el.dataset.month = i;
        el.setAttribute("aria-label", `${year}년 ${i + 1}월`);
        el.setAttribute(
          "aria-pressed",
          String(state.input.value.slice(0, 7) === value),
        );
        el.tabIndex = i === (Number(focusValue) || month + 1) - 1 ? 0 : -1;
        if (state.kind === "month") el.disabled = !bounded(state, value);
        grid.append(el);
      }
      panel.append(grid);
    } else {
      const table = document.createElement("table");
      table.className = "picker-calendar";
      table.setAttribute("role", "grid");
      table.setAttribute("aria-label", `${year}년 ${month + 1}월`);
      const head = table.createTHead().insertRow();
      ["일", "월", "화", "수", "목", "금", "토"].forEach((day) => {
        const th = document.createElement("th");
        th.className = "picker-weekday";
        th.scope = "col";
        th.textContent = day;
        head.append(th);
      });
      const body = table.createTBody(),
        first = makeDate(year, month),
        begin = makeDate(year, month, 1 - first.getDay());
      const count =
        Math.ceil(
          (first.getDay() + makeDate(year, month + 1, 0).getDate()) / 7,
        ) * 7;
      const chosen = state.input.value,
        today = dateValue(new Date());
      const target =
        focusValue ||
        (parseDate(chosen) && chosen.slice(0, 7) === dateValue(view).slice(0, 7)
          ? chosen
          : dateValue(first));
      const peers = groupStates(state);
      const start = peers.find((p) => p.root.dataset.rangeRole === "start")
        ?.input.value;
      const end = peers.find((p) => p.root.dataset.rangeRole === "end")?.input
        .value;
      let row;
      for (let i = 0; i < count; i++) {
        if (i % 7 === 0) row = body.insertRow();
        const day = new Date(begin);
        day.setDate(begin.getDate() + i);
        const value = dateValue(day);
        const cell = row.insertCell();
        cell.className = "picker-cell";
        const el = button("picker-day text", String(day.getDate()));
        el.dataset.date = value;
        el.setAttribute("aria-label", value);
        el.setAttribute("aria-pressed", String(chosen === value));
        el.tabIndex = value === target ? 0 : -1;
        el.disabled =
          day.getFullYear() < 1 ||
          day.getFullYear() > 9999 ||
          !bounded(state, value);
        if (day.getMonth() !== month) el.classList.add("picker-outside");
        if (start && end && start <= end && value >= start && value <= end)
          el.classList.add("picker-in-range");
        if (value === today) el.setAttribute("aria-current", "date");
        cell.append(el);
      }
      panel.append(table);
      if (!panel.querySelector('.picker-day[tabindex="0"]:not(:disabled)')) {
        const firstEnabled = panel.querySelector(".picker-day:not(:disabled)");
        if (firstEnabled) firstEnabled.tabIndex = 0;
      }
    }
    position(state);
  }
  function drawTime(state) {
    state.panel.replaceChildren();
    ["hour", "minute"].forEach((unit, i) => {
      if (i) {
        const separator = document.createElement("span");
        separator.textContent = ":";
        separator.setAttribute("aria-hidden", "true");
        state.panel.append(separator);
      }
      const col = document.createElement("div");
      col.className = "picker-time-column";
      col.append(
        button(
          "picker-step",
          `${i ? "분" : "시"} 증가`,
          "time-increase",
          `${unit}-up`,
        ),
      );
      const spin = document.createElement("input");
      spin.className = "picker-spin text large type1";
      spin.inputMode = "numeric";
      spin.maxLength = 2;
      spin.dataset.unit = unit;
      spin.setAttribute("role", "spinbutton");
      spin.setAttribute("aria-label", i ? "분" : "시");
      spin.setAttribute("aria-valuemin", "0");
      spin.setAttribute("aria-valuemax", String(i ? 60 - state.step : 23));
      col.append(
        spin,
        button(
          "picker-step",
          `${i ? "분" : "시"} 감소`,
          "time-decrease",
          `${unit}-down`,
        ),
      );
      state.panel.append(col);
    });
    updateTime(state);
  }
  function updateTime(state) {
    const values = (
      validTime(state.input.value) ? state.input.value : "00:00"
    ).split(":");
    state.panel.querySelectorAll(".picker-spin").forEach((spin, i) => {
      spin.value = values[i];
      spin.setAttribute("aria-valuenow", String(Number(values[i])));
    });
  }
  function adjustTime(state, unit, change, absolute) {
    const values = (validTime(state.input.value) ? state.input.value : "00:00")
      .split(":")
      .map(Number);
    const index = unit === "hour" ? 0 : 1,
      step = index ? state.step : 1,
      max = index ? 60 : 24;
    values[index] =
      absolute === undefined
        ? (Math.floor(values[index] / step) * step + change * step + max) % max
        : absolute;
    commit(state, values.map(pad).join(":"));
    updateTime(state);
  }
  function open(state, keyboard = false) {
    if (state.input.disabled || state.input.readOnly || state.toggle.disabled)
      return;
    if (active && active !== state) close(active);
    active = state;
    state.mode = state.kind === "month" ? "months" : "days";
    state.view =
      parseDate(
        state.kind === "month" ? `${state.input.value}-01` : state.input.value,
      ) || new Date();
    state.panel.hidden = false;
    state.toggle.setAttribute("aria-expanded", "true");
    state.input.setAttribute("aria-expanded", "true");
    if (state.kind === "time") drawTime(state);
    else drawCalendar(state);
    validateState(state);
    position(state);
    if (keyboard)
      state.panel.querySelector('.picker-spin, [tabindex="0"]')?.focus();
  }
  function init(scope = document) {
    find(scope).forEach((root) => {
      if (states.has(root)) return;
      const input = root.querySelector(".picker-input"),
        toggle = root.querySelector(".picker-toggle");
      if (!input || !toggle) return;
      root
        .querySelectorAll(".picker-popover, .picker-error")
        .forEach((el) => el.remove());
      const id = `picker-popup-${++sequence}`;
      const panel = document.createElement("div");
      panel.id = id;
      panel.className = "picker-popover";
      panel.hidden = true;
      panel.setAttribute("role", "dialog");
      panel.setAttribute(
        "aria-label",
        `${input.getAttribute("aria-label") || "날짜"} 선택`,
      );
      const error = document.createElement("p");
      error.id = `${id}-error`;
      error.className = "picker-error text small error";
      error.hidden = true;
      error.setAttribute("aria-live", "polite");
      const kind = root.dataset.picker || "date";
      const configuredStep = Number(root.dataset.minuteStep || 10);
      const step =
        Number.isInteger(configuredStep) &&
        configuredStep > 0 &&
        60 % configuredStep === 0
          ? configuredStep
          : 10;
      const state = {
        root,
        input,
        toggle,
        panel,
        error,
        kind,
        step,
        mode: "days",
        view: new Date(),
      };
      states.set(root, state);
      if (kind === "time") panel.classList.add("picker-time");
      root.append(panel, error);
      input.setAttribute(
        "aria-describedby",
        [
          ...(input.getAttribute("aria-describedby") || "")
            .split(" ")
            .filter((x) => x && !/^picker-popup-\d+-error(?:-\d+)?$/.test(x)),
          error.id,
        ].join(" "),
      );
      [input, toggle].forEach((el) => {
        el.setAttribute("aria-controls", id);
        el.setAttribute("aria-expanded", "false");
        el.setAttribute("aria-haspopup", "dialog");
      });
      toggle.addEventListener("click", (event) =>
        state.panel.hidden ? open(state, event.detail === 0) : close(state),
      );
      input.addEventListener("click", () => {
        if (panel.hidden) open(state);
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          open(state, true);
        }
      });
      input.addEventListener("input", () => {
        validateState(state);
        if (kind === "time" && !panel.hidden) updateTime(state);
      });
      input.addEventListener("change", () => {
        input.value = input.value.trim();
        validateState(state);
      });
      input.addEventListener("invalid", () => validateState(state));
      root.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) {
          event.preventDefault();
          event.stopPropagation();
          close(state, true);
        }
      });
      panel.addEventListener("click", (event) => {
        const el = event.target.closest("button");
        if (!el || el.disabled) return;
        if (el.dataset.date) {
          commit(state, el.dataset.date, true);
          return;
        }
        if (el.dataset.month !== undefined) {
          state.view = makeDate(
            state.view.getFullYear(),
            Number(el.dataset.month),
          );
          if (kind === "month")
            commit(state, dateValue(state.view).slice(0, 7), true);
          else {
            state.mode = "days";
            drawCalendar(state);
            panel.querySelector('[tabindex="0"]')?.focus();
          }
          return;
        }
        const action = el.dataset.pickerAction;
        if (kind === "time") {
          const [unit, direction] = action.split("-");
          adjustTime(state, unit, direction === "up" ? 1 : -1);
          return;
        }
        if (action === "months")
          state.mode = state.mode === "days" ? "months" : "days";
        else {
          const delta = action.startsWith("previous") ? -1 : 1;
          state.view = action.endsWith("year")
            ? makeDate(state.view.getFullYear() + delta, state.view.getMonth())
            : makeDate(state.view.getFullYear(), state.view.getMonth() + delta);
        }
        drawCalendar(state);
        panel.querySelector(`[data-picker-action="${action}"]`)?.focus();
      });
      panel.addEventListener("keydown", (event) => {
        const el = event.target;
        if (el.matches(".picker-spin")) {
          if (
            ["ArrowUp", "ArrowDown", "Home", "End", "Enter"].includes(event.key)
          ) {
            event.preventDefault();
            if (event.key === "Enter") {
              close(state, true);
              return;
            }
            const max = el.dataset.unit === "hour" ? 23 : 60 - step;
            adjustTime(
              state,
              el.dataset.unit,
              event.key === "ArrowUp" ? 1 : -1,
              event.key === "Home" ? 0 : event.key === "End" ? max : undefined,
            );
          }
          return;
        }
        const delta = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowUp: state.mode === "months" ? -4 : -7,
          ArrowDown: state.mode === "months" ? 4 : 7,
        }[event.key];
        if (
          el.dataset.date &&
          (delta !== undefined ||
            ["Home", "End", "PageUp", "PageDown"].includes(event.key))
        ) {
          event.preventDefault();
          const date = parseDate(el.dataset.date);
          if (delta !== undefined) date.setDate(date.getDate() + delta);
          else if (event.key === "Home" || event.key === "End")
            date.setDate(
              date.getDate() - date.getDay() + (event.key === "End" ? 6 : 0),
            );
          else {
            const day = date.getDate();
            date.setDate(1);
            date.setMonth(
              date.getMonth() +
                (event.key === "PageUp" ? -1 : 1) * (event.shiftKey ? 12 : 1),
            );
            date.setDate(
              Math.min(
                day,
                makeDate(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
              ),
            );
          }
          if (
            date.getFullYear() < 1 ||
            date.getFullYear() > 9999 ||
            !bounded(state, dateValue(date))
          )
            return;
          state.view = date;
          drawCalendar(state, dateValue(date));
          panel.querySelector(`[data-date="${dateValue(date)}"]`)?.focus();
        } else if (el.dataset.month !== undefined && delta !== undefined) {
          event.preventDefault();
          const month = (Number(el.dataset.month) + delta + 12) % 12;
          panel
            .querySelectorAll(".picker-month")
            .forEach(
              (b) => (b.tabIndex = Number(b.dataset.month) === month ? 0 : -1),
            );
          panel.querySelector(`[data-month="${month}"]`)?.focus();
        }
      });
      panel.addEventListener("change", (event) => {
        const spin = event.target;
        if (!spin.matches(".picker-spin")) return;
        const n = Number(spin.value),
          unit = spin.dataset.unit,
          max = unit === "hour" ? 23 : 60 - step;
        if (
          /^\d{1,2}$/.test(spin.value) &&
          n >= 0 &&
          n <= max &&
          (unit === "hour" || n % step === 0)
        )
          adjustTime(state, unit, 0, n);
        else updateTime(state);
      });
      input.form?.addEventListener("reset", () =>
        setTimeout(() => {
          close(state);
          setError(state, "");
        }, 0),
      );
    });
  }
  document.addEventListener("pointerdown", (event) => {
    if (active && !active.root.contains(event.target)) close(active);
  });
  document.addEventListener("focusin", (event) => {
    if (active && !active.root.contains(event.target)) close(active);
  });
  window.addEventListener("resize", () => {
    if (active) position(active);
  });
  window.addEventListener(
    "scroll",
    () => {
      if (active) position(active);
    },
    true,
  );
  window.KwsPickers = Object.freeze({ init, validate });
  init();
})();
