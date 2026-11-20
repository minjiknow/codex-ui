(() => {
    const library = "https://www.nl.go.kr/NL/contents/";
    document.querySelectorAll('[data-navigation="mobile"] .depth1-menu').forEach((item) => {
        item.id = "popup-" + item.dataset.menuId;
    });

    document.querySelectorAll(".searchpop").forEach((popup) => {
        popup.addEventListener("search:submit", (event) => {
            const url = new URL("search.do", library);
            url.searchParams.set("kwd", event.detail.keyword);
            location.assign(url);
        });
    });

    document.querySelectorAll(".menupop .dropbox").forEach((language) => {
        language.addEventListener("dropdown:change", (event) => {
            if (event.detail.value === "English") location.assign("https://www.nl.go.kr/EN/main/index.do");
        });
    });

    document.querySelectorAll(".photo-news").forEach((root) => {
        const form = root.querySelector("form");
        const list = root.querySelector(".news-list");
        const template = root.querySelector(".news-card");
        const pager = window.CMSBoardList.bind(root, (number) => {
            page = number;
            render();
        });
        const options = (name) => form.querySelector(`[data-filter="${name}"]`).dataset.value;
        let results = window.CMSData.photoNews;
        let page = 1;
        let size = 9;

        function render() {
            const pages = Math.ceil(results.length / size);
            const fragment = document.createDocumentFragment();
            for (const item of results.slice((page - 1) * size, page * size)) {
                const card = template.content.cloneNode(true);
                card.querySelector("a").href = library + "N50604000000.do?schOpt5=NLNE&schM=view&id=" + item.id;
                card.querySelector(".card-title").textContent = item.title;
                const date = card.querySelector("time");
                date.dateTime = date.textContent = item.date;
                card.querySelector(".hits").textContent = "조회 : " + item.hits;
                fragment.append(card);
            }
            list.replaceChildren(fragment);
            root.querySelector(".empty").hidden = results.length > 0;
            pager.update(page, pages);
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const query = form.elements.q.value.trim().toLocaleLowerCase();
            const field = options("field");
            results = window.CMSData.photoNews.filter((item) => {
                const fields = { title: item.title, body: item.keywords, all: item.title + " " + item.keywords };
                return fields[field].toLocaleLowerCase().includes(query);
            });
            if (options("order") === "asc") results.reverse();
            size = Number(options("size"));
            page = 1;
            render();
        });

        render();
    });
})();
