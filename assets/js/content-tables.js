/* Preserve table semantics while adding an independently scrollable container. */
(function () {
  'use strict';

  function wrapTables() {
    document.querySelectorAll('.page-content table').forEach(function (table) {
      if (table.closest('.highlight, .highlighter-rouge, .gist, .table-scroll') ||
          table.parentElement.closest('table')) {
        return;
      }

      var wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Table (scroll horizontally)');
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapTables);
  } else {
    wrapTables();
  }
})();
