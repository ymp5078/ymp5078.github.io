/* ============================================================
   Windows 98 Theme — JavaScript
   ============================================================ */

(function () {
  'use strict';

  // --- Boot Sequence ---
  var bootScreen = document.getElementById('bootScreen');
  var bootProgress = document.getElementById('bootProgress');
  var bootText = document.getElementById('bootText');
  var mainWindow = document.getElementById('mainWindow');
  var taskbar = document.getElementById('taskbar');

  var bootMessages = [
    'Initializing academic publications...',
    'Loading computer vision modules...',
    'Connecting to Penn State network...',
    'Parsing MICCAI proceedings...',
    'Calibrating neural networks...',
    'Loading EmotionCLIP weights...',
    'Analyzing placenta photographs...',
    'Rendering homepage...',
    'Welcome to Emu 98!'
  ];

  var bootStep = 0;
  var bootInterval = setInterval(function () {
    bootStep++;
    var progress = (bootStep / bootMessages.length) * 100;
    if (bootProgress) bootProgress.style.width = progress + '%';
    if (bootText) bootText.textContent = bootMessages[Math.min(bootStep, bootMessages.length - 1)];

    if (bootStep >= bootMessages.length) {
      clearInterval(bootInterval);
      setTimeout(function () {
        if (bootScreen) bootScreen.classList.add('hidden');
        if (mainWindow) mainWindow.style.display = 'block';
        if (taskbar) taskbar.style.display = 'flex';
      }, 100);
    }
  }, 45);

  // --- Floating Section Nav: scroll-spy + smooth scroll ---
  var navBar = document.getElementById('sectionNav');
  var scrollBox = document.getElementById('windowBody');

  if (navBar && scrollBox) {
    var navTabs = Array.prototype.slice.call(navBar.querySelectorAll('.tab'));
    var navSections = navTabs.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    var navClickUntil = 0;

    function activateSection(id) {
      navTabs.forEach(function (a) {
        var active = a.getAttribute('href') === '#' + id;
        a.classList.toggle('active', active);
        if (active) {
          a.setAttribute('aria-current', 'location');
          // Keep the active tab visible in the horizontal strip only.
          var wanted = a.offsetLeft - (navBar.clientWidth - a.offsetWidth) / 2;
          if (Math.abs(navBar.scrollLeft - wanted) > 30) {
            navBar.scrollTo({ left: wanted, behavior: 'smooth' });
          }
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }

    function syncActiveNav() {
      if (Date.now() < navClickUntil) return;
      var boxTop = scrollBox.getBoundingClientRect().top;
      var threshold = boxTop + 70;
      var active = navSections[0];
      navSections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= threshold) active = section;
      });
      if (scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight - 5) {
        active = navSections[navSections.length - 1];
      }
      if (active) activateSection(active.id);
    }

    var navScheduled = false;
    scrollBox.addEventListener('scroll', function () {
      if (!navScheduled) {
        navScheduled = true;
        requestAnimationFrame(function () { syncActiveNav(); navScheduled = false; });
      }
    }, { passive: true });
    window.addEventListener('resize', syncActiveNav);

    navTabs.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('href').slice(1);
        var section = document.getElementById(id);
        if (!section) return;
        navClickUntil = Date.now() + 850;
        activateSection(id);
        section.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'start'
        });
        history.replaceState(null, '', '#' + id);
      });
    });

    syncActiveNav();
  }

  // --- Publication search + tag filter ---
  var pubSearch = document.getElementById('pubSearch');
  var chipBar = document.getElementById('filterChips');
  var pubCount = document.getElementById('pubCount');
  var filterable = Array.prototype.slice.call(
    document.querySelectorAll('#section-pubs .bibliography > li[data-tags]')
  );

  if (filterable.length) {
    var activeTag = 'All';

    function applyFilter() {
      var q = pubSearch ? pubSearch.value.toLowerCase().trim() : '';
      var shownPubs = 0, totalPubs = 0, shownReports = 0, totalReports = 0;
      filterable.forEach(function (li) {
        var inPubs = !li.closest('#reports-block');
        if (inPubs) totalPubs++; else totalReports++;
        var tags = (li.getAttribute('data-tags') || '').split('|');
        var text = (li.getAttribute('data-search') || '').toLowerCase();
        var ok = (activeTag === 'All' || tags.indexOf(activeTag) !== -1) &&
                 (!q || text.indexOf(q) !== -1);
        li.hidden = !ok;
        if (ok) { if (inPubs) shownPubs++; else shownReports++; }
      });
      if (pubCount) {
        pubCount.textContent = 'Showing ' + shownPubs + ' of ' + totalPubs +
          ' publications \u00B7 ' + shownReports + ' of ' + totalReports + ' technical reports';
      }
    }

    if (chipBar) {
      chipBar.addEventListener('click', function (e) {
        var chip = e.target.closest('.filter-chip');
        if (!chip) return;
        activeTag = chip.getAttribute('data-tag');
        chipBar.querySelectorAll('.filter-chip').forEach(function (c) {
          c.classList.toggle('selected', c === chip);
        });
        applyFilter();
      });
    }
    if (pubSearch) pubSearch.addEventListener('input', applyFilter);
    applyFilter();
  }

  // --- Start Menu Toggle ---
  var startBtn = document.getElementById('win98-start-btn');
  var startMenu = document.getElementById('win98-start-menu');

  if (startBtn && startMenu) {
    startBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      startMenu.classList.toggle('open');
      startBtn.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        startMenu.classList.remove('open');
        startBtn.classList.remove('active');
      }
    });
  }

  // --- Taskbar Clock (always Pacific Time, the site owner's timezone) ---
  var clockEl = document.getElementById('win98-clock');

  function updateClock() {
    if (!clockEl) return;
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'numeric', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
      timeZoneName: 'short'
    }).formatToParts(new Date());
    var v = {};
    parts.forEach(function (p) { v[p.type] = p.value; });
    clockEl.textContent = v.month + '/' + v.day + '/' + v.year + ' ' +
      v.hour + ':' + v.minute + ' ' + (v.dayPeriod || '') + ' ' + (v.timeZoneName || '');
  }

  updateClock();
  setInterval(updateClock, 30000);

  // --- Window Buttons ---
  var minimizeBtn = document.getElementById('win98-btn-minimize');
  var maximizeBtn = document.getElementById('win98-btn-maximize');
  var closeBtn = document.getElementById('win98-btn-close');
  var taskBtn = document.getElementById('win98-task-btn');
  var animating = false;
  var ANIM_MS = 200;

  // Compute translate + scale to shrink window onto taskbar button
  function getMinimizeTransform() {
    if (!mainWindow || !taskBtn) return { tx: 0, ty: 0, sx: 0.1, sy: 0.05 };
    var wr = mainWindow.getBoundingClientRect();
    var tr = taskBtn.getBoundingClientRect();
    return {
      tx: (tr.left + tr.width / 2) - (wr.left + wr.width / 2),
      ty: (tr.top + tr.height / 2) - (wr.top + wr.height / 2),
      sx: tr.width / wr.width,
      sy: tr.height / wr.height
    };
  }

  function animateMinimize(callback) {
    if (!mainWindow || animating) return;
    animating = true;
    var t = getMinimizeTransform();
    var anim = mainWindow.animate([
      { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 },
      { transform: 'translate(' + t.tx + 'px, ' + t.ty + 'px) scale(' + t.sx + ', ' + t.sy + ')', opacity: 0.2 }
    ], { duration: ANIM_MS, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' });
    anim.onfinish = function () {
      anim.cancel();
      mainWindow.style.display = 'none';
      animating = false;
      if (taskBtn) taskBtn.classList.remove('active');
      if (callback) callback();
    };
  }

  function animateRestore(callback) {
    if (!mainWindow || animating) return;
    animating = true;
    mainWindow.style.visibility = 'hidden';
    mainWindow.style.display = 'block';
    mainWindow.offsetHeight;
    var t = getMinimizeTransform();
    mainWindow.style.visibility = '';
    if (taskBtn) taskBtn.classList.add('active');
    var anim = mainWindow.animate([
      { transform: 'translate(' + t.tx + 'px, ' + t.ty + 'px) scale(' + t.sx + ', ' + t.sy + ')', opacity: 0.2 },
      { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 }
    ], { duration: ANIM_MS, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' });
    anim.onfinish = function () {
      anim.cancel();
      animating = false;
      if (callback) callback();
    };
  }

  // Saved windowed geometry
  var savedWin = { left: null, top: null, width: null, height: null };

  function animateMaximize() {
    if (!mainWindow || animating) return;
    animating = true;
    // Save windowed position/size before maximizing
    if (mainWindow.classList.contains('windowed')) {
      savedWin.left = mainWindow.style.left;
      savedWin.top = mainWindow.style.top;
      savedWin.width = mainWindow.style.width;
      savedWin.height = mainWindow.style.height;
    }
    var before = mainWindow.getBoundingClientRect();
    mainWindow.classList.remove('windowed');
    mainWindow.classList.add('maximized');
    mainWindow.style.left = '';
    mainWindow.style.top = '';
    mainWindow.style.width = '';
    mainWindow.style.height = '';
    mainWindow.offsetHeight;
    var after = mainWindow.getBoundingClientRect();
    var sx = before.width / after.width;
    var sy = before.height / after.height;
    var tx = (before.left + before.width / 2) - (after.left + after.width / 2);
    var ty = (before.top + before.height / 2) - (after.top + after.height / 2);
    var anim = mainWindow.animate([
      { transform: 'translate(' + tx + 'px, ' + ty + 'px) scale(' + sx + ', ' + sy + ')' },
      { transform: 'translate(0, 0) scale(1, 1)' }
    ], { duration: 150, easing: 'ease-out', fill: 'forwards' });
    anim.onfinish = function () { anim.cancel(); animating = false; };
  }

  function animateUnmaximize() {
    if (!mainWindow || animating) return;
    animating = true;
    var before = mainWindow.getBoundingClientRect();
    mainWindow.classList.remove('maximized');
    mainWindow.classList.add('windowed');
    // Restore saved or set sensible defaults
    var dw = Math.min(850, window.innerWidth - 40);
    var dh = Math.min(600, window.innerHeight - 80);
    mainWindow.style.left = savedWin.left || ((window.innerWidth - dw) / 2) + 'px';
    mainWindow.style.top = savedWin.top || '20px';
    mainWindow.style.width = savedWin.width || dw + 'px';
    mainWindow.style.height = savedWin.height || dh + 'px';
    mainWindow.offsetHeight;
    var after = mainWindow.getBoundingClientRect();
    var sx = before.width / after.width;
    var sy = before.height / after.height;
    var tx = (before.left + before.width / 2) - (after.left + after.width / 2);
    var ty = (before.top + before.height / 2) - (after.top + after.height / 2);
    var anim = mainWindow.animate([
      { transform: 'translate(' + tx + 'px, ' + ty + 'px) scale(' + sx + ', ' + sy + ')' },
      { transform: 'translate(0, 0) scale(1, 1)' }
    ], { duration: 150, easing: 'ease-out', fill: 'forwards' });
    anim.onfinish = function () { anim.cancel(); animating = false; };
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', function () {
      animateMinimize();
    });
  }

  function isMobile() {
    // Check for touch-only device (no fine pointer like mouse)
    var touch = window.matchMedia('(pointer: coarse)').matches;
    var small = window.innerWidth <= 600 || window.innerHeight <= 600;
    return touch || small;
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', function () {
      if (isMobile()) {
        showDialog('Emu Internet Explorer', '&#128187;', 'Your screen is too small for windowed mode.');
        return;
      }
      if (mainWindow.classList.contains('maximized')) {
        animateUnmaximize();
      } else {
        animateMaximize();
      }
    });
  }

  function showDialog(title, icon, message, btnText) {
    var overlay = document.createElement('div');
    overlay.className = 'win98-dialog-overlay';
    overlay.innerHTML =
      '<div class="win98-dialog">' +
        '<div class="win98-dialog-titlebar">' +
          '<span>' + title + '</span>' +
          '<button class="win98-dialog-close">&#10005;</button>' +
        '</div>' +
        '<div class="win98-dialog-body">' +
          '<div class="win98-dialog-icon">' + icon + '</div>' +
          '<div class="win98-dialog-text">' + message + '</div>' +
        '</div>' +
        '<div class="win98-dialog-buttons">' +
          '<button class="win98-dialog-btn">' + (btnText || 'OK') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    var close = function () { overlay.remove(); };
    overlay.querySelector('.win98-dialog-close').addEventListener('click', close);
    overlay.querySelector('.win98-dialog-btn').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      showDialog(
        'Emu Internet Explorer',
        '&#9888;',
        'This is not a real browser, so you cannot close it.<br>Please enjoy the website instead!'
      );
    });
  }

  if (taskBtn) {
    taskBtn.addEventListener('click', function () {
      var isHidden = mainWindow && mainWindow.style.display === 'none';
      if (isHidden) {
        animateRestore();
      } else {
        animateMinimize();
      }
    });
  }

  // --- Drag & Resize (only when not maximized) ---
  var titlebar = document.getElementById('titlebar');
  var dragging = false;
  var dragOffX = 0, dragOffY = 0;
  var MIN_W = 400, MIN_H = 300;
  var EDGE = 6; // resize hit zone in px

  // Resize state
  var resizeDir = null; // e.g. 'n','s','e','w','ne','nw','se','sw'
  var rsStartX = 0, rsStartY = 0;
  var rsStartRect = null;

  function isWindowed() {
    return mainWindow && mainWindow.classList.contains('windowed');
  }

  // Detect which edge/corner the mouse is on
  function hitTest(e) {
    if (!mainWindow || !mainWindow.classList.contains('windowed')) return null;
    var r = mainWindow.getBoundingClientRect();
    var x = e.clientX, y = e.clientY;
    // Must be near the window bounds
    if (x < r.left - EDGE || x > r.right + EDGE ||
        y < r.top - EDGE || y > r.bottom + EDGE) return null;
    var onL = x >= r.left - EDGE && x <= r.left + EDGE;
    var onR = x >= r.right - EDGE && x <= r.right + EDGE;
    var onT = y >= r.top - EDGE && y <= r.top + EDGE;
    var onB = y >= r.bottom - EDGE && y <= r.bottom + EDGE;
    if (onT && onL) return 'nw';
    if (onT && onR) return 'ne';
    if (onB && onL) return 'sw';
    if (onB && onR) return 'se';
    if (onT) return 'n';
    if (onB) return 's';
    if (onL) return 'w';
    if (onR) return 'e';
    return null;
  }

  var CURSORS = {
    n: 'ns-resize', s: 'ns-resize',
    e: 'ew-resize', w: 'ew-resize',
    nw: 'nwse-resize', se: 'nwse-resize',
    ne: 'nesw-resize', sw: 'nesw-resize'
  };

  // --- Drag ---
  if (titlebar) {
    titlebar.addEventListener('mousedown', function (e) {
      if (animating || isMobile()) return;
      if (e.target.closest('.titlebar-buttons')) return;
      dragging = true;
      if (mainWindow.classList.contains('maximized')) {
        dragging = 'pending-unmax';
      }
      var r = mainWindow.getBoundingClientRect();
      dragOffX = e.clientX - r.left;
      dragOffY = e.clientY - r.top;
      titlebar.style.cursor = 'grabbing';
      e.preventDefault();
    });
  }

  // --- Edge/corner resize start ---
  document.addEventListener('mousedown', function (e) {
    if (!mainWindow || !mainWindow.classList.contains('windowed') || animating) return;
    var dir = hitTest(e);
    if (!dir) return;
    resizeDir = dir;
    rsStartX = e.clientX;
    rsStartY = e.clientY;
    rsStartRect = {
      l: mainWindow.offsetLeft,
      t: mainWindow.offsetTop,
      w: mainWindow.offsetWidth,
      h: mainWindow.offsetHeight
    };
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    // --- Drag ---
    if (dragging && mainWindow) {
      if (dragging === 'pending-unmax') {
        dragging = true;
        var dw = Math.min(850, window.innerWidth - 40);
        var dh = Math.min(600, window.innerHeight - 80);
        mainWindow.classList.remove('maximized');
        mainWindow.classList.add('windowed');
        mainWindow.style.width = (savedWin.width ? parseInt(savedWin.width) : dw) + 'px';
        mainWindow.style.height = (savedWin.height ? parseInt(savedWin.height) : dh) + 'px';
        dragOffX = mainWindow.offsetWidth * (e.clientX / window.innerWidth);
        dragOffY = 15;
      }
      if (!mainWindow.classList.contains('windowed')) {
        var r = mainWindow.getBoundingClientRect();
        savedWin.width = r.width + 'px';
        savedWin.height = r.height + 'px';
        mainWindow.classList.add('windowed');
        mainWindow.style.width = r.width + 'px';
        mainWindow.style.height = r.height + 'px';
      }
      var x = e.clientX - dragOffX;
      var y = e.clientY - dragOffY;
      x = Math.max(-mainWindow.offsetWidth + 100, Math.min(x, window.innerWidth - 100));
      y = Math.max(0, Math.min(y, window.innerHeight - 40));
      mainWindow.style.left = x + 'px';
      mainWindow.style.top = y + 'px';
      return;
    }

    // --- Edge/corner resize ---
    if (resizeDir && mainWindow) {
      var dx = e.clientX - rsStartX;
      var dy = e.clientY - rsStartY;
      var s = rsStartRect;
      var newL = s.l, newT = s.t, newW = s.w, newH = s.h;

      if (resizeDir.indexOf('e') !== -1) { newW = s.w + dx; }
      if (resizeDir.indexOf('s') !== -1) { newH = s.h + dy; }
      if (resizeDir.indexOf('w') !== -1) { newW = s.w - dx; newL = s.l + dx; }
      if (resizeDir.indexOf('n') !== -1) { newH = s.h - dy; newT = s.t + dy; }

      // Enforce minimums (clamp and adjust position for left/top edges)
      if (newW < MIN_W) {
        if (resizeDir.indexOf('w') !== -1) newL = s.l + s.w - MIN_W;
        newW = MIN_W;
      }
      if (newH < MIN_H) {
        if (resizeDir.indexOf('n') !== -1) newT = s.t + s.h - MIN_H;
        newH = MIN_H;
      }

      mainWindow.style.left = newL + 'px';
      mainWindow.style.top = newT + 'px';
      mainWindow.style.width = newW + 'px';
      mainWindow.style.height = newH + 'px';
      return;
    }

    // --- Hover cursor for edges/corners ---
    var dir = hitTest(e);
    if (dir) {
      document.body.style.cursor = CURSORS[dir];
    } else if (!dragging && !resizeDir) {
      document.body.style.cursor = '';
    }
  });

  document.addEventListener('mouseup', function () {
    if (dragging && titlebar) titlebar.style.cursor = 'grab';
    dragging = false;
    if (resizeDir) {
      resizeDir = null;
      document.body.style.cursor = '';
    }
  });

  // Double-click title bar to maximize/unmaximize
  if (titlebar) {
    titlebar.addEventListener('dblclick', function (e) {
      if (isMobile()) return;
      if (e.target.closest('.titlebar-buttons')) return;
      if (mainWindow.classList.contains('maximized')) {
        animateUnmaximize();
      } else {
        animateMaximize();
      }
    });
  }

  // --- Theme Toggle ---
  var themeToggle = document.getElementById('theme-toggle');
  var themeLabel = document.getElementById('theme-toggle-label');

  function isDark() {
    return document.documentElement.classList.contains('dark-theme');
  }

  function updateThemeLabel() {
    if (themeLabel) {
      themeLabel.textContent = isDark() ? 'Light Mode' : 'Dark Mode';
    }
  }

  updateThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      if (isDark()) {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('emu98-theme', 'light');
      } else {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('emu98-theme', 'dark');
      }
      updateThemeLabel();
    });
  }

})();
