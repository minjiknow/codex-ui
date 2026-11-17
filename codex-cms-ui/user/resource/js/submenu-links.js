// cms-test처럼 모든 메인에서 공통 서브페이지 두 개를 사용합니다.
(function connectSubmenuLinks() {
    "use strict";
    const destinations = { theater: "./sub1.html", exhibition: "./sub2.html" };
    function connect(entry) {
        if (destinations[entry.id]) entry.href = destinations[entry.id];
        (entry.groups || []).forEach(connect);
        (entry.items || []).forEach(connect);
    }
    (window.CMSData?.menus || []).forEach(connect);
})();
