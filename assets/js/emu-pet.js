/* ============================================================
   Emu Pet — Desktop companion
   Walks & poops on top of taskbar when explorer is not maximized.
   Hides at current location (head only) when maximized.
   ============================================================ */
(function () {
  'use strict';

  var SCALE = window.innerWidth <= 600 ? 3 : 5;
  function getTaskbarH() {
    var tb = document.getElementById('taskbar');
    return tb ? tb.offsetHeight : 40;
  }
  var WALK_SPEED = 1;
  var RUN_SPEED = 4;
  var POOP_CHANCE = 0.003;
  var FRAME_MS = 200;
  var RUN_MS = 1500;
  var TICK_MS = 50;
  var HEAD_ROWS = 7;
  var ANIM_MS = 300;

  // --- Color Palette ---
  var PAL = {
    '.': null,
    'n': '#2d2d2d',
    'o': '#e8a000',
    'w': '#ffffff',
    'k': '#000000',
    'b': '#3e2723',
    'B': '#5d4037',
    'H': '#795548',
    'l': '#555555',
    'f': '#444444',
    't': '#4e342e'
  };

  var PPAL = { '.': null, 'p': '#5d4037', 'P': '#8d6e63' };

  // --- Sprites (16x16, facing right) ---
  var WALK_FRAMES = [
    [
      '...........oo...',
      '..........nnnn..',
      '..........nwkn..',
      '...........nn...',
      '...........nn...',
      '..........nn....',
      '.........nnn....',
      '........bBBBb...',
      '.......bBHBHBb..',
      '......bBHBHBHb..',
      '......bBHBHBHb..',
      '.......bBHBBb...',
      '......ttbBBb....',
      '.........l.l....',
      '..........l..l..',
      '.........ff.ff..'
    ],
    [
      '...........oo...',
      '..........nnnn..',
      '..........nwkn..',
      '...........nn...',
      '...........nn...',
      '..........nn....',
      '.........nnn....',
      '........bBBBb...',
      '.......bBHBHBb..',
      '......bBHBHBHb..',
      '......bBHBHBHb..',
      '.......bBHBBb...',
      '......ttbBBb....',
      '........l..l....',
      '.........l.l....',
      '........ff.ff...'
    ]
  ];

  var POOP_SPR = ['..p..', '.pPp.', 'pPPPp', '.ppp.'];
  var FLAT_SPR = ['.pPp.', 'pPPPp', '.ppp.'];
  var GRASS_SPR = [
    '.g.g.g.',
    'g.g.g.g',
    'g.g.g.g',
    '.GgGgG.',
    '.GGGGG.'
  ];
  // Flower colors: random one picked at spawn
  var FLOWER_COLORS = ['#ef5350', '#ffee58', '#e040fb', '#ff7043', '#42a5f5'];
  var FLOWER_SPR = [
    '...F...',
    '..FFF..',
    '...f...',
    '.g.f.g.',
    'g.gfg.g',
    'g.g.g.g',
    '.GgGgG.',
    '.GGGGG.'
  ];
  var DRIED_FLOWER_SPR = [
    '...D...',
    '..DDD..',
    '...d...',
    '.g.d.g.',
    'g.gdg.g',
    'g.g.g.g',
    '.GgGgG.',
    '.GGGGG.'
  ];
  var DRIED_ALL_SPR = [
    '...D...',
    '..DDD..',
    '...d...',
    '.n.d.n.',
    'n.ndn.n',
    'n.n.n.n',
    '.NnNnN.',
    '.NNNNN.'
  ];
  var GPAL = {
    '.': null, 'g': '#4caf50', 'G': '#2e7d32',
    'F': null, 'f': '#4caf50',
    'D': '#a1887f', 'd': '#8d6e63',
    'n': '#a08050', 'N': '#7a6030'
  };
  var POOP_STAGES = [
    { spr: POOP_SPR, pal: PPAL, w: 5, h: 4, dur: 30000 },
    { spr: FLAT_SPR, pal: PPAL, w: 5, h: 3, dur: 60000 },
    { spr: GRASS_SPR, pal: GPAL, w: 7, h: 5, dur: 60000 },
    { spr: FLOWER_SPR, pal: GPAL, w: 7, h: 8, dur: 60000, hasFlower: true },
    { spr: DRIED_FLOWER_SPR, pal: GPAL, w: 7, h: 8, dur: 60000 },
    { spr: DRIED_ALL_SPR, pal: GPAL, w: 7, h: 8, dur: 60000 },
    { spr: null, pal: null, w: 0, h: 0, dur: 0, vanish: true }
  ];

  // --- State ---
  var mainWindow, emuEl, emuCtx;
  var poops = [];
  var booted = false;
  var animating = false;
  var ft = 0;
  var emu = { x: 0, y: 0, dir: 1, state: 'idle', frame: 0, runT: 0, walkT: 0 };

  // --- Positions ---
  function walkY() { return innerHeight - getTaskbarH() - emuEl.height; }
  function hideY() { return innerHeight - getTaskbarH() - HEAD_ROWS * SCALE; }

  // --- Canvas helpers ---
  function mkCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w * SCALE;
    c.height = h * SCALE;
    c.style.imageRendering = 'pixelated';
    return c;
  }

  function paint(ctx, spr, pal, flip, maxRows) {
    var h = maxRows || spr.length;
    var w = spr[0].length;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var r = 0; r < h; r++) {
      for (var c = 0; c < w; c++) {
        var cl = pal[spr[r][c]];
        if (cl) {
          ctx.fillStyle = cl;
          ctx.fillRect((flip ? w - 1 - c : c) * SCALE, r * SCALE, SCALE, SCALE);
        }
      }
    }
  }

  // --- Init ---
  function init() {
    mainWindow = document.getElementById('mainWindow');
    if (!mainWindow) return;

    var W = WALK_FRAMES[0][0].length;
    var H = WALK_FRAMES[0].length;

    emuEl = mkCanvas(W, H);
    emuEl.id = 'emu-pet';
    emuEl.style.cssText = 'position:fixed;z-index:10001;cursor:pointer;display:none;image-rendering:pixelated;';
    document.body.appendChild(emuEl);
    emuCtx = emuEl.getContext('2d');

    emu.x = Math.random() * (innerWidth - emuEl.width);
    emu.y = walkY();
    emu.dir = Math.random() > 0.5 ? 1 : -1;
    emu.walkT = 300 + Math.random() * 500;

    emuEl.addEventListener('click', onEmuClick);

    new MutationObserver(checkWindow).observe(mainWindow, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    setInterval(tick, TICK_MS);
  }

  // --- Is the window currently maximized and visible? ---
  function isMaximized() {
    return mainWindow.style.display !== 'none' &&
           mainWindow.classList.contains('maximized');
  }

  // --- Window state detection ---
  function checkWindow() {
    var hidden = mainWindow.style.display === 'none';

    if (!booted) {
      if (!hidden) {
        booted = true;
        if (isMaximized()) {
          goHide(true);
        } else {
          goWalk(true);
        }
      }
      return;
    }

    if (animating) return;

    if (isMaximized() && emu.state !== 'hiding') {
      goHide(false);
    } else if (!isMaximized() && emu.state === 'hiding') {
      goWalk(false);
    }
  }

  // --- Walk: full emu on top of taskbar ---
  function goWalk(instant) {
    emuEl.style.display = 'block';
    poops.forEach(function (p) { p.el.style.display = 'block'; });
    emu.x = Math.max(0, Math.min(emu.x, innerWidth - emuEl.width));

    if (instant) {
      emu.state = 'walking';
      emu.y = walkY();
      emuEl.style.zIndex = '10001';
      render();
      return;
    }

    // Animate: jump out from behind taskbar to on top
    animating = true;
    emu.state = 'walking';
    emuEl.style.zIndex = '9998'; // behind taskbar during animation
    emu.y = hideY();
    render();

    var startY = hideY();
    var endY = walkY();
    var jumpHeight = 30;

    emuEl.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(' + (endY - startY - jumpHeight) + 'px)', offset: 0.4 },
      { transform: 'translateY(' + (endY - startY) + 'px)' }
    ], { duration: ANIM_MS, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
      this.cancel();
      emu.y = endY;
      emuEl.style.zIndex = '10001'; // back on top of taskbar
      render();
      animating = false;
    };
  }

  // --- Hide: sink behind taskbar, only head peeks above ---
  function goHide(instant) {
    emuEl.style.display = 'block';
    poops.forEach(function (p) { p.el.style.display = 'none'; });
    hideClicks = 0;
    clearBubble();

    if (instant) {
      emu.state = 'hiding';
      emu.y = hideY();
      emuEl.style.zIndex = '9998';
      render();
      return;
    }

    // Animate: sink behind taskbar
    animating = true;
    emuEl.style.zIndex = '9998'; // go behind taskbar immediately
    var startY = walkY();
    var endY = hideY();

    emu.y = startY;
    paint(emuCtx, WALK_FRAMES[emu.frame], PAL, emu.dir === -1);
    emuEl.style.left = emu.x + 'px';
    emuEl.style.top = startY + 'px';

    emuEl.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(' + (endY - startY) + 'px)' }
    ], { duration: ANIM_MS, easing: 'ease-in', fill: 'forwards' }).onfinish = function () {
      this.cancel();
      emu.state = 'hiding';
      emu.y = endY;
      render();
      animating = false;
    };
  }

  // --- Clock bubble ---
  var nearClock = false;

  function showClockBubble() {
    var W = 13, H = 15, s = SCALE;
    var c = document.createElement('canvas');
    c.width = W * s; c.height = H * s;
    c.style.cssText = 'position:fixed;z-index:10002;pointer-events:none;image-rendering:pixelated;';
    var ctx = c.getContext('2d');

    // Bubble body
    bline(ctx, 1, 0, W - 2, true, '#000');
    bline(ctx, 1, 12, W - 2, true, '#000');
    bline(ctx, 0, 1, 11, false, '#000');
    bline(ctx, W - 1, 1, 11, false, '#000');
    brect(ctx, 1, 1, W - 2, 11, '#fff');
    // Tail (center bottom)
    bpx(ctx, 6, 13, '#000'); bpx(ctx, 6, 14, '#000');

    // Round clock (9x9) at offset (2,2)
    var clock = [
      '...bbb...',
      '..bwwwb..',
      '.bwwbwwb.',
      'bwwwbwwwb',
      'bwwwbbbwb',
      'bwwwwwwwb',
      '.bwwwwwb.',
      '..bwwwb..',
      '...bbb...'
    ];
    var cp = { '.': null, 'b': '#000000', 'w': '#ffffff' };
    for (var r = 0; r < clock.length; r++)
      for (var cc = 0; cc < clock[r].length; cc++) {
        var col = cp[clock[r][cc]];
        if (col) bpx(ctx, 2 + cc, 2 + r, col);
      }

    placeBubble(c);
  }

  function checkClock() {
    var clockArea = document.querySelector('.taskbar-clock');
    if (!clockArea) return;
    var cr = clockArea.getBoundingClientRect();
    var emuCx = emu.x + emuEl.width / 2;
    var isNear = emuCx >= cr.left - 20 && emuCx <= cr.right + 20;
    if (isNear && !nearClock) {
      nearClock = true;
      showClockBubble();
    } else if (!isNear) {
      nearClock = false;
    }
  }

  // --- Game loop ---
  function tick() {
    if (emu.state === 'idle' || emu.state === 'hiding' || animating) return;

    ft += TICK_MS;
    if (ft >= FRAME_MS) {
      ft = 0;
      emu.frame = 1 - emu.frame;
    }

    if (emu.state === 'walking') {
      emu.x += WALK_SPEED * emu.dir;
      emu.walkT--;
      if (emu.walkT <= 0) {
        emu.dir = -emu.dir;
        emu.walkT = 300 + Math.random() * 500;
      }
      if (Math.random() < POOP_CHANCE) doPoop();
      checkClock();
    } else if (emu.state === 'running') {
      emu.x += RUN_SPEED * emu.dir;
      emu.runT -= TICK_MS;
      if (emu.runT <= 0) {
        emu.state = 'walking';
        emu.walkT = 300 + Math.random() * 500;
      }
      checkClock();
    }

    // Bounce off screen edges
    var mx = innerWidth - emuEl.width;
    if (emu.x < 0) { emu.x = 0; emu.dir = 1; }
    if (emu.x > mx) { emu.x = mx; emu.dir = -1; }

    render();
  }

  function render() {
    var rows = emu.state === 'hiding' ? HEAD_ROWS : undefined;
    paint(emuCtx, WALK_FRAMES[emu.frame], PAL, emu.dir === -1, rows);
    emuEl.style.left = emu.x + 'px';
    emuEl.style.top = emu.y + 'px';
    updateBubblePos();
  }

  // --- Poop: sits on top of taskbar, evolves over time ---
  function doPoop() {
    var st = POOP_STAGES[0];
    var c = mkCanvas(st.w, st.h);
    c.style.cssText = 'position:fixed;z-index:10000;cursor:pointer;image-rendering:pixelated;transition:opacity .5s;';
    var cx = emu.x + emuEl.width / 2;
    c.style.left = (cx - c.width / 2) + 'px';
    c.style.top = (innerHeight - getTaskbarH() - c.height) + 'px';
    paint(c.getContext('2d'), st.spr, st.pal, false);
    document.body.appendChild(c);
    c.addEventListener('click', function (e) {
      e.stopPropagation();
      removePoop(poop);
    });
    var poop = { el: c, stage: 0, cx: cx, timer: null };
    scheduleEvolve(poop);
    poops.push(poop);
  }

  function scheduleEvolve(poop) {
    var dur = POOP_STAGES[poop.stage].dur;
    if (dur === Infinity) return;
    poop.timer = setTimeout(function () { evolvePoop(poop); }, dur);
  }

  function paintWithFlower(ctx, spr, pal, flowerColor) {
    var w = spr[0].length;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var r = 0; r < spr.length; r++) {
      for (var c = 0; c < w; c++) {
        var ch = spr[r][c];
        var cl = ch === 'F' ? flowerColor : pal[ch];
        if (cl) {
          ctx.fillStyle = cl;
          ctx.fillRect(c * SCALE, r * SCALE, SCALE, SCALE);
        }
      }
    }
  }

  function evolvePoop(poop) {
    if (poop.stage >= POOP_STAGES.length - 1) return;
    var oldEl = poop.el;
    poop.stage++;
    var st = POOP_STAGES[poop.stage];
    // Final stage: vanish
    if (st.vanish) {
      oldEl.style.opacity = '0';
      setTimeout(function () {
        oldEl.remove();
        poops = poops.filter(function (p) { return p !== poop; });
      }, 500);
      return;
    }
    // Create new canvas for next stage
    var c = mkCanvas(st.w, st.h);
    c.style.cssText = 'position:fixed;z-index:10000;cursor:pointer;image-rendering:pixelated;transition:opacity .5s;';
    c.style.left = (poop.cx - c.width / 2) + 'px';
    c.style.top = (innerHeight - getTaskbarH() - c.height) + 'px';
    c.style.opacity = '0';
    // Pick random flower color on first flower stage
    if (st.hasFlower) {
      poop.flowerColor = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
    }
    if (poop.flowerColor && st.spr.join('').indexOf('F') !== -1) {
      paintWithFlower(c.getContext('2d'), st.spr, st.pal, poop.flowerColor);
    } else {
      paint(c.getContext('2d'), st.spr, st.pal, false);
    }
    document.body.appendChild(c);
    c.addEventListener('click', function (e) {
      e.stopPropagation();
      removePoop(poop);
    });
    // Cross-fade: old out, new in
    oldEl.style.opacity = '0';
    c.offsetHeight;
    c.style.opacity = '1';
    setTimeout(function () { oldEl.remove(); }, 500);
    poop.el = c;
    scheduleEvolve(poop);
  }

  function removePoop(poop) {
    if (poop.timer) clearTimeout(poop.timer);
    var el = poop.el;
    el.style.transition = 'transform .3s ease-in, opacity .3s ease-in';
    el.style.transform = 'scale(0)';
    el.style.opacity = '0';
    setTimeout(function () {
      el.remove();
      poops = poops.filter(function (p) { return p !== poop; });
    }, 300);
  }

  // --- Speech bubbles ---
  var bubbleEl = null;
  var bubbleTimer = null;
  var bubbleInterval = null;
  var hideClicks = 0;
  var clickResetTimer = null;

  function clearBubble() {
    if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }
    if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
    if (bubbleInterval) { clearInterval(bubbleInterval); bubbleInterval = null; }
    hintCtx = null;
  }

  function updateBubblePos() {
    if (!bubbleEl) return;
    var headCenterX;
    if (emu.dir === 1) {
      headCenterX = emu.x + 11 * SCALE;
    } else {
      headCenterX = emu.x + 4 * SCALE;
    }
    var bx = headCenterX - bubbleEl.width / 2;
    bx = Math.max(2, Math.min(bx, innerWidth - bubbleEl.width - 2));
    var by = emu.y - bubbleEl.height;
    bubbleEl.style.left = bx + 'px';
    bubbleEl.style.top = by + 'px';
  }

  function placeBubble(canvas) {
    clearBubble();
    bubbleEl = canvas;
    updateBubblePos();
    document.body.appendChild(bubbleEl);
    bubbleTimer = setTimeout(function () { clearBubble(); }, 2000);
  }

  // Pixel helpers for bubble drawing
  function bpx(ctx, x, y, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  }
  function bline(ctx, x, y, len, horiz, col) {
    for (var i = 0; i < len; i++) {
      bpx(ctx, horiz ? x + i : x, horiz ? y : y + i, col);
    }
  }
  function brect(ctx, x, y, w, h, col) {
    for (var ry = 0; ry < h; ry++)
      for (var rx = 0; rx < w; rx++)
        bpx(ctx, x + rx, y + ry, col);
  }

  // "?" bubble
  function showQuestionBubble() {
    var W = 11, H = 14, s = SCALE;
    var c = document.createElement('canvas');
    c.width = W * s; c.height = H * s;
    c.style.cssText = 'position:fixed;z-index:10002;pointer-events:none;image-rendering:pixelated;';
    var x = c.getContext('2d');

    // Bubble body
    bline(x, 1, 0, W - 2, true, '#000');
    bline(x, 1, 11, W - 2, true, '#000');
    bline(x, 0, 1, 10, false, '#000');
    bline(x, W - 1, 1, 10, false, '#000');
    brect(x, 1, 1, W - 2, 10, '#fff');
    // Tail (center bottom)
    bpx(x, 5, 12, '#000'); bpx(x, 5, 13, '#000');

    // Question mark
    bline(x, 4, 2, 3, true, '#000');  // top bar
    bpx(x, 3, 3, '#000'); bpx(x, 7, 3, '#000'); // sides
    bpx(x, 7, 4, '#000');
    bpx(x, 6, 5, '#000');
    bpx(x, 5, 6, '#000');
    bpx(x, 5, 7, '#000');
    bpx(x, 5, 9, '#000'); // dot

    placeBubble(c);
  }

  // Hint bubble: [_] [□] [×] with red arrow toggling between first two
  function showHintBubble() {
    var W = 27, H = 15, s = SCALE;
    var c = document.createElement('canvas');
    c.width = W * s; c.height = H * s;
    c.style.cssText = 'position:fixed;z-index:10002;pointer-events:none;image-rendering:pixelated;';
    var ctx = c.getContext('2d');

    // Bubble body
    bline(ctx, 1, 0, W - 2, true, '#000');
    bline(ctx, 1, 12, W - 2, true, '#000');
    bline(ctx, 0, 1, 11, false, '#000');
    bline(ctx, W - 1, 1, 11, false, '#000');
    brect(ctx, 1, 1, W - 2, 11, '#fff');
    // Tail (center bottom)
    bpx(ctx, 13, 13, '#000'); bpx(ctx, 13, 14, '#000');

    // Minimize symbol: _ at row 10, centered x=5
    bline(ctx, 3, 10, 5, true, '#000');

    // Maximize symbol: □ at rows 7-10, centered x=13
    bline(ctx, 11, 7, 5, true, '#000');
    bline(ctx, 11, 10, 5, true, '#000');
    bline(ctx, 11, 7, 4, false, '#000');
    bline(ctx, 15, 7, 4, false, '#000');

    // Close symbol: × at rows 7-11, centered x=21
    bpx(ctx, 19, 7, '#000'); bpx(ctx, 23, 7, '#000');
    bpx(ctx, 20, 8, '#000'); bpx(ctx, 22, 8, '#000');
    bpx(ctx, 21, 9, '#000');
    bpx(ctx, 20, 10, '#000'); bpx(ctx, 22, 10, '#000');
    bpx(ctx, 19, 11, '#000'); bpx(ctx, 23, 11, '#000');

    // Red arrow pointing at minimize or maximize, toggles on each click
    placeBubble(c);
    hintCtx = ctx;
    hintW = W;
    drawHintArrow();
  }

  var hintCtx = null;
  var hintW = 0;
  var arrowTarget = 0;

  function drawHintArrow() {
    if (!hintCtx) return;
    var centers = [5, 13];
    // Clear arrow area (rows 2-5)
    brect(hintCtx, 1, 2, hintW - 2, 4, '#fff');
    var cx = centers[arrowTarget];
    // V-chevron pointing down
    bpx(hintCtx, cx - 2, 2, '#ff0000'); bpx(hintCtx, cx + 2, 2, '#ff0000');
    bpx(hintCtx, cx - 1, 3, '#ff0000'); bpx(hintCtx, cx + 1, 3, '#ff0000');
    bpx(hintCtx, cx, 4, '#ff0000');
  }

  // --- Click handler ---
  function onEmuClick(e) {
    e.stopPropagation();
    if (animating) return;
    if (emu.state === 'hiding') {
      hideClicks++;
      if (clickResetTimer) clearTimeout(clickResetTimer);
      clickResetTimer = setTimeout(function () { hideClicks = 0; hintCtx = null; }, 3000);
      if (hideClicks >= 3) {
        if (hintCtx) {
          // Already showing hint — toggle arrow and reset timeout
          arrowTarget = 1 - arrowTarget;
          drawHintArrow();
          if (bubbleTimer) clearTimeout(bubbleTimer);
          bubbleTimer = setTimeout(function () { clearBubble(); }, 2000);
        } else {
          showHintBubble();
        }
      } else {
        showQuestionBubble();
      }
      return;
    }
    // Run away from click
    emu.state = 'running';
    emu.dir = e.clientX > emu.x + emuEl.width / 2 ? -1 : 1;
    emu.runT = RUN_MS;
  }

  // --- Handle resize / rotation ---
  window.addEventListener('resize', function () {
    if (!booted) return;
    // Clamp emu X to new screen width
    var mx = innerWidth - emuEl.width;
    if (emu.x > mx) emu.x = mx;
    if (emu.x < 0) emu.x = 0;
    // Update emu Y
    if (emu.state === 'hiding') {
      emu.y = hideY();
    } else {
      emu.y = walkY();
    }
    render();
    // Reposition all poops/grass/flowers
    var tbH = getTaskbarH();
    poops.forEach(function (p) {
      var st = POOP_STAGES[p.stage];
      if (!st || st.vanish) return;
      // Clamp X
      var pw = st.w * SCALE;
      var maxX = innerWidth - pw;
      var newCx = Math.max(pw / 2, Math.min(p.cx, maxX + pw / 2));
      p.cx = newCx;
      p.el.style.left = (newCx - pw / 2) + 'px';
      p.el.style.top = (innerHeight - tbH - p.el.height) + 'px';
    });
  });

  // --- Start ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
