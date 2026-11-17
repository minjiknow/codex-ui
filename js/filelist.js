/* AI-ONE-Platform 파일 목록의 번호·건수·행 선택 동작을 재사용. */
(() => {
  'use strict';
  document.querySelectorAll('.filelist').forEach(root => {
    const rows = Array.from(root.querySelectorAll('.htmllist .page-row'));
    rows.forEach((row, index) => {
      row.querySelector('td').textContent = String(index + 1);
      row.tabIndex = 0;
      const selectRow = () => {
        rows.forEach(item => item.classList.toggle('is-selected', item === row));
      };
      row.addEventListener('click', selectRow);
      row.addEventListener('keydown', event => {
        // 링크의 Enter 동작을 행 선택 이벤트가 가로채지 않도록 한다.
        if (event.target !== row || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        selectRow();
      });
    });
    root.querySelectorAll('[data-total-page-count]').forEach(el => {
      el.textContent = String(rows.length);
    });
    root.querySelectorAll('[data-section-count]').forEach(el => {
      el.textContent = `${rows.length}개 화면`;
    });
  });
})();
