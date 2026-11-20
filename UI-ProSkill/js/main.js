function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
}
/******************************
Start: 메인 배너
******************************/
document.querySelectorAll(".hero").forEach((hero) => {
  const track = hero.querySelector(".swiper-wrapper");
  const dots = hero.querySelector(".dots");
  libraryPreviewData.banners.forEach((banner, index) => {
    const slide = cloneTemplate("banner-template");
    slide.querySelector(".banner-source").srcset = banner.mobile;
    const image = slide.querySelector(".banner-image");
    image.src = banner.src;
    image.alt = banner.title;
    track.append(slide);
    const fragment = cloneTemplate("dot-template");
    const button = fragment.querySelector(".dot-btn");
    button.setAttribute("aria-label", index + 1 + "번째 배너");
    button.setAttribute("aria-pressed", String(index === 0));
    dots.append(fragment);
  });
  hero.querySelector(".count").textContent = "1 / " + libraryPreviewData.banners.length;
});
/******************************
End: 메인 배너
******************************/
/******************************
Start: 바로가기 및 운영시간
******************************/
document.querySelectorAll(".quick").forEach((list) => {
  libraryPreviewData.quick.forEach(({ title, image }) => {
    const item = cloneTemplate("quick-template");
    item.querySelector(".quick-tit").textContent = title;
    item.querySelector(".quick-icon").src = image;
    list.append(item);
  });
});
document.querySelectorAll(".hours").forEach((container) => {
  const item = cloneTemplate("hours-template");
  const hours = libraryPreviewData.hours;
  item.querySelector(".month").textContent = hours.month;
  item.querySelector(".date").textContent = hours.date;
  hours.closed.forEach((day) => {
    const date = cloneTemplate("closed-day-template");
    date.querySelector(".holiday-date").textContent = day;
    item.querySelector(".holidays").append(date);
  });
  container.append(item);
});
/******************************
End: 바로가기 및 운영시간
******************************/
/******************************
Start: 누리소통망
******************************/
document.querySelectorAll(".social-stories[data-collection]").forEach((list) => {
  libraryPreviewData[list.dataset.collection].forEach((record) => {
    const item = cloneTemplate("social-card-template");
    item.querySelector(".social-meta .icon").src = record.icon;
    item.querySelector(".channel-label").textContent = record.channel;
    const date = item.querySelector(".post-date");
    date.dateTime = record.date;
    date.textContent = record.date.replaceAll("-", ".");
    const thumbnail = item.querySelector(".card-thumbnail");
    const excerpt = item.querySelector(".card-description");
    if (record.image) {
      thumbnail.querySelector(".thumbnail-image").src = record.image;
      excerpt.remove();
    } else {
      excerpt.textContent = record.excerpt;
      thumbnail.remove();
    }
    item.querySelector(".card-title").textContent = record.title;
    list.append(item);
  });
});
/******************************
End: 누리소통망
******************************/

/******************************
Start: 메인 배너
******************************/
document.querySelectorAll(".hero").forEach((hero) => {
  const slides = Array.from(hero.querySelectorAll(".slide"));
  const dots = Array.from(hero.querySelectorAll(".dots .dot-btn"));
  const play = hero.querySelector(".play");
  const count = hero.querySelector(".count");
  const slider = new Swiper(hero.querySelector(".swiper"), {
    loop: true,
    speed: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500,
    on: {
      realIndexChange(instance) {
        dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === instance.realIndex)));
        count.textContent = (instance.realIndex + 1) + " / " + slides.length;
      },
      sliderFirstMove: stop,
    },
  });
  let timer = null;
  function stop() {
    clearInterval(timer);
    timer = null;
    play.textContent = "▶";
    play.setAttribute("aria-label", "자동 재생");
    count.setAttribute("aria-live", "polite");
  }
  function start() {
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "자동 재생 정지");
    count.setAttribute("aria-live", "off");
    timer = setInterval(() => slider.slideNext(), 6000);
  }
  hero.querySelector(".prev").addEventListener("click", () => {
    stop();
    slider.slidePrev();
  });
  hero.querySelector(".next").addEventListener("click", () => {
    stop();
    slider.slideNext();
  });
  dots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      stop();
      slider.slideToLoop(i);
    }),
  );
  play.addEventListener("click", () => (timer === null ? start() : stop()));
  hero.addEventListener("focusin", (event) => {
    if (event.target !== play) stop();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
});
/******************************
End: 메인 배너
******************************/

/******************************
Start: 도서관 소식
******************************/
document.querySelectorAll(".news, .press").forEach((panel) => {
  const notice = panel.classList.contains("news");
  libraryPreviewData[panel.dataset.collection].forEach((record) => {
    const item = cloneTemplate(notice ? "notice-template" : "press-template");
    item.querySelector(".card-title").textContent = record.title;
    const badge = item.querySelector(".news-badge");
    if (notice) {
      if (record.category) badge.textContent = record.category;
      else badge.remove();
      item.querySelector(".notice-date").textContent = record.detail;
      item.querySelector(".notice-date").dateTime = record.detail;
    } else {
      badge.textContent = record.detail;
      item.querySelector(".press-image").src = record.image;
    }
    panel.append(item);
  });
});
/******************************
End: 도서관 소식
******************************/

/******************************
Start: 오늘의 선택
******************************/
function showBookPanel(panel) {
  const existing = panel.querySelector(".swiper");
  if (existing) {
    existing.swiper.update();
    return;
  }
  const records = libraryPreviewData[panel.dataset.collection];
  panel.append(cloneTemplate("book-panel-template"));
  const track = panel.querySelector(".swiper-wrapper");
  const dots = panel.querySelector(".dots");
  // A looping track needs room on both sides for a jump past four visible covers.
  const covers = records.length < 8 ? records.concat(records) : records;
  covers.forEach((record) => {
    const slide = cloneTemplate("book-slide-template");
    const image = slide.querySelector(".book-cover");
    image.src = record.image;
    image.alt = record.title;
    track.append(slide);
  });
  records.forEach((record, index) => {
    const dot = cloneTemplate("dot-template");
    const button = dot.querySelector(".dot-btn");
    button.setAttribute("aria-label", (index + 1) + " / " + records.length + " " + record.title);
    button.addEventListener("click", () => slider.slideToLoop(index));
    dots.append(dot);
  });
  function update(slider) {
    const current = slider.realIndex % records.length;
    const record = records[current];
    panel.querySelector(".book-tit").textContent = record.title;
    panel.querySelector(".book-desc").textContent = record.detail || "";
    panel.querySelector(".detail-link").title = record.title;
    Array.from(dots.children).forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === current));
    });
  }
  const slider = new Swiper(panel.querySelector(".swiper"), {
    touchEventsTarget: "container",
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    a11y: { slideLabelMessage: "", prevSlideMessage: "이전 자료", nextSlideMessage: "다음 자료" },
    speed: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500,
    breakpoints: { 768: { slidesPerView: 4 }, 1280: { slidesPerView: 3 } },
    navigation: { prevEl: panel.querySelector(".book-prev"), nextEl: panel.querySelector(".book-next"), addIcons: false },
    on: { init: update, realIndexChange: update },
  });
}
/******************************
End: 오늘의 선택
******************************/

document.querySelectorAll(".books:not([hidden])").forEach(showBookPanel);
document.addEventListener("tab:change", (event) => {
  const panel = event.detail.panel;
  if (panel.classList.contains("books")) showBookPanel(panel);
});
/******************************
Start: 설문 팝업
******************************/
document.querySelectorAll(".survey").forEach((survey) => {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
  if (today < "2026-11-17" || today > "2026-12-07") return;
  const key = "library-survey-dismissed";
  try {
    if (localStorage.getItem(key) === today) return;
  } catch {
    /* File previews may restrict persistent storage. */
  }
  survey.hidden = false;
  const closeButton = survey.querySelector(".close");
  survey.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeButton.click();
  });
  closeButton.addEventListener("click", () => {
    if (survey.querySelector(".checkbox").checked) {
      try {
        localStorage.setItem(key, today);
      } catch {
        /* Close for this visit. */
      }
    }
    survey.hidden = true;
    document.querySelector(".brand-link").focus({ preventScroll: true });
  });
});
/******************************
End: 설문 팝업
******************************/
