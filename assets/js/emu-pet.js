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

  // --- Color Palettes ---
  var PAL = {
    '.': null, 'n': '#2d2d2d', 'o': '#e8a000', 'w': '#ffffff',
    'k': '#000000', 'b': '#3e2723', 'B': '#5d4037', 'H': '#795548',
    'l': '#555555', 'f': '#444444', 't': '#4e342e'
  };
  var PPAL = { '.': null, 'p': '#5d4037', 'P': '#8d6e63' };
  var GPAL = {
    '.': null, 'g': '#4caf50', 'G': '#2e7d32',
    'F': null, 'f': '#4caf50',
    'n': '#a08050', 'N': '#7a6030', 'D': '#8d6e63'
  };

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

  // --- Poop / plant sprites ---
  var POOP_SPR = ['..p..', '.pPp.', 'pPPPp', '.ppp.'];
  var FLAT_SPR = ['.pPp.', 'pPPPp', '.ppp.'];
  var GRASS_SPR = [
    '.g..g..g.', '.g.g..g..', '..g.g..g.',
    '..g..g.g.', '..g.g..g.', '.GGgGgGG.', '.GGGGGGG.'
  ];
  var FLOWER_COLORS = ['#ef5350', '#ffee58', '#e040fb', '#ff7043', '#42a5f5'];
  var FLOWER_SPR = [
    '....F....', '...FFF...', '..FFFFF..', '...FFF...',
    '....f....', '.g..f..g.', '.g.gf.g..', '..g.f..g.',
    '..g..g.g.', '..g.g..g.', '.GGgGgGG.', '.GGGGGGG.'
  ];
  var DRIED_FLOWER_SPR = [
    '....D....', '...DDD...', '..DDDDD..', '...DDD...',
    '....n....', '.g..n..g.', '.g.gn.g..', '..g.n..g.',
    '..g..g.g.', '..g.g..g.', '.GGgGgGG.', '.GGGGGGG.'
  ];
  var DRIED_STEM_SPR = [
    '....n....', '.g..n..g.', '.g.gn.g..', '..g.n..g.',
    '..g..g.g.', '..g.g..g.', '.GGgGgGG.', '.GGGGGGG.'
  ];
  var DRIED_GRASS_SPR = [
    '.n..n..n.', '.n.n..n..', '..n.n..n.',
    '..n..n.n.', '..n.n..n.', '.NNnNnNN.', '.NNNNNNN.'
  ];

  // Stage indices: 0=poop, 1=flat, 2=grass, 3=flower, 4=dry flower, 5=dried stem, 6=dry grass, 7=vanish
  var POOP_STAGES = [
    { spr: POOP_SPR,         pal: PPAL, w: 5, h: 4,  dur: 5000  },               // 0: poop
    { spr: FLAT_SPR,         pal: PPAL, w: 5, h: 3,  dur: 10000 },               // 1: flat poop
    { spr: GRASS_SPR,        pal: GPAL, w: 9, h: 7,  dur: 60000 },               // 2: grass
    { spr: FLOWER_SPR,       pal: GPAL, w: 9, h: 12, dur: 60000, hasFlower: true }, // 3: flower
    { spr: DRIED_FLOWER_SPR, pal: GPAL, w: 9, h: 12, dur: 60000 },               // 4: dry flower
    { spr: DRIED_STEM_SPR,   pal: GPAL, w: 9, h: 8,  dur: 60000 },               // 5: dried stem
    { spr: DRIED_GRASS_SPR,  pal: GPAL, w: 9, h: 7,  dur: 60000 },               // 6: dry grass
    { spr: null, pal: null, w: 0, h: 0, dur: 0, vanish: true }                    // 7: vanish
  ];

  function nextStageIndex(currentStage) {
    switch (currentStage) {
      case 0: return 1;                                    // poop → flat
      case 1: return Math.random() < 0.1 ? 2 : 7;         // flat → 10% grass, 90% vanish
      case 2: return Math.random() < 0.1 ? 3 : 6;         // grass → 10% flower, 90% dry grass
      case 3: return 4;                                    // flower → dry flower
      case 4: return 5;                                    // dry flower → dried stem
      case 5: return 6;                                    // dried stem → dry grass
      case 6: return 7;                                    // dry grass → vanish
      default: return 7;
    }
  }

  // --- State ---
  var mainWindow, emuEl, emuCtx, petLayer;
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

  function paint(ctx, spr, pal, flip, maxRows, flowerColor) {
    var h = maxRows || spr.length;
    var w = spr[0].length;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (var r = 0; r < h; r++) {
      for (var c = 0; c < w; c++) {
        var ch = spr[r][c];
        var cl = (ch === 'F' && flowerColor) ? flowerColor : pal[ch];
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

    petLayer = document.createElement('div');
    petLayer.id = 'emu-pet-layer';
    petLayer.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;pointer-events:none;overflow:visible;';
    document.body.appendChild(petLayer);

    var W = WALK_FRAMES[0][0].length;
    var H = WALK_FRAMES[0].length;
    emuEl = mkCanvas(W, H);
    emuEl.id = 'emu-pet';
    emuEl.style.cssText = 'position:fixed;z-index:10001;cursor:pointer;display:none;image-rendering:pixelated;pointer-events:auto;';
    petLayer.appendChild(emuEl);
    emuCtx = emuEl.getContext('2d');

    emu.x = Math.random() * (innerWidth - emuEl.width);
    emu.y = walkY();
    emu.dir = Math.random() > 0.5 ? 1 : -1;
    emu.walkT = 300 + Math.random() * 500;

    emuEl.addEventListener('click', onEmuClick);
    new MutationObserver(checkWindow).observe(mainWindow, {
      attributes: true, attributeFilter: ['style', 'class']
    });
    setInterval(tick, TICK_MS);
  }

  function isMaximized() {
    return mainWindow.style.display !== 'none' &&
           mainWindow.classList.contains('maximized');
  }

  function checkWindow() {
    var hidden = mainWindow.style.display === 'none';
    if (!booted) {
      if (!hidden) {
        booted = true;
        if (isMaximized()) goHide(true); else goWalk(true);
        spawnFlower();
      }
      return;
    }
    if (animating) return;
    if (isMaximized() && emu.state !== 'hiding') goHide(false);
    else if (!isMaximized() && emu.state === 'hiding') goWalk(false);
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

    animating = true;
    emu.state = 'walking';
    emuEl.style.zIndex = '9998';
    emu.y = hideY();
    render();

    var startY = hideY(), endY = walkY();
    emuEl.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(' + (endY - startY - 30) + 'px)', offset: 0.4 },
      { transform: 'translateY(' + (endY - startY) + 'px)' }
    ], { duration: ANIM_MS, easing: 'ease-out', fill: 'forwards' }).onfinish = function () {
      this.cancel();
      emu.y = endY;
      emuEl.style.zIndex = '10001';
      render();
      animating = false;
    };
  }

  // --- Hide: sink behind taskbar, only head peeks above ---
  function goHide(instant) {
    emuEl.style.display = 'block';
    hideClicks = 0;
    clearBubble();

    if (instant) {
      emu.state = 'hiding';
      emu.y = hideY();
      emuEl.style.zIndex = '9998';
      render();
      return;
    }

    animating = true;
    emuEl.style.zIndex = '9998';
    var startY = walkY(), endY = hideY();
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

  // --- Game loop ---
  function tick() {
    if (emu.state === 'idle' || emu.state === 'hiding' || animating) return;

    ft += TICK_MS;
    if (ft >= FRAME_MS) { ft = 0; emu.frame = 1 - emu.frame; }

    if (emu.state === 'walking') {
      emu.x += WALK_SPEED * emu.dir;
      emu.walkT--;
      if (emu.walkT <= 0) { emu.dir = -emu.dir; emu.walkT = 300 + Math.random() * 500; }
      if (Math.random() < POOP_CHANCE) doPoop();
      checkClock();
    } else if (emu.state === 'running') {
      emu.x += RUN_SPEED * emu.dir;
      emu.runT -= TICK_MS;
      if (emu.runT <= 0) { emu.state = 'walking'; emu.walkT = 300 + Math.random() * 500; }
      checkClock();
    }

    var mx = innerWidth - emuEl.width;
    if (emu.x < 0) { emu.x = 0; emu.dir = 1; }
    if (emu.x > mx) { emu.x = mx; emu.dir = -1; }
    render();
  }

  function render() {
    paint(emuCtx, WALK_FRAMES[emu.frame], PAL, emu.dir === -1, emu.state === 'hiding' ? HEAD_ROWS : undefined);
    emuEl.style.left = emu.x + 'px';
    emuEl.style.top = emu.y + 'px';
    updateBubblePos();
  }

  // --- Poop / plant lifecycle ---
  function createPoopItem(stage, cx, flowerColor) {
    var st = POOP_STAGES[stage];
    var c = mkCanvas(st.w, st.h);
    c.style.cssText = 'position:fixed;z-index:10500;cursor:pointer;image-rendering:pixelated;transition:opacity .5s;pointer-events:auto;';
    c.style.left = (cx - c.width / 2) + 'px';
    c.style.top = (innerHeight - getTaskbarH() - c.height) + 'px';
    paint(c.getContext('2d'), st.spr, st.pal, false, null, flowerColor);
    petLayer.appendChild(c);
    var poop = { el: c, stage: stage, cx: cx, timer: null, flowerColor: flowerColor || null };
    c.addEventListener('click', function (e) { e.stopPropagation(); removePoop(poop, true); });
    scheduleEvolve(poop);
    poops.push(poop);
    return poop;
  }

  function doPoop() {
    createPoopItem(0, emu.x + emuEl.width / 2);
  }

  function spawnFlower() {
    var st = POOP_STAGES[3];
    var cx = Math.random() * (innerWidth - st.w * SCALE) + st.w * SCALE / 2;
    createPoopItem(3, cx, FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]);
  }

  function scheduleEvolve(poop) {
    poop.timer = setTimeout(function () { evolvePoop(poop); }, POOP_STAGES[poop.stage].dur);
  }

  function evolvePoop(poop) {
    if (poop.stage >= POOP_STAGES.length - 1) return;
    var oldEl = poop.el;
    poop.stage = nextStageIndex(poop.stage);
    var st = POOP_STAGES[poop.stage];

    if (st.vanish) {
      oldEl.style.opacity = '0';
      setTimeout(function () {
        oldEl.remove();
        poops = poops.filter(function (p) { return p !== poop; });
      }, 500);
      return;
    }

    var c = mkCanvas(st.w, st.h);
    c.style.cssText = 'position:fixed;z-index:10500;cursor:pointer;image-rendering:pixelated;transition:opacity .5s;pointer-events:auto;';
    c.style.left = (poop.cx - c.width / 2) + 'px';
    c.style.top = (innerHeight - getTaskbarH() - c.height) + 'px';
    c.style.opacity = '0';
    if (st.hasFlower) {
      poop.flowerColor = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
    }
    paint(c.getContext('2d'), st.spr, st.pal, false, null, poop.flowerColor);
    petLayer.appendChild(c);
    c.addEventListener('click', function (e) { e.stopPropagation(); removePoop(poop, true); });

    oldEl.style.opacity = '0';
    c.offsetHeight; // force reflow for transition
    c.style.opacity = '1';
    setTimeout(function () { oldEl.remove(); }, 500);
    poop.el = c;
    scheduleEvolve(poop);
  }

  function removePoop(poop, clicked) {
    var wasFlower = poop.stage === 3;
    var wasPoop = poop.stage <= 1;
    if (poop.timer) clearTimeout(poop.timer);
    var el = poop.el;
    el.style.transition = 'transform .3s ease-in, opacity .3s ease-in';
    el.style.transform = 'scale(0)';
    el.style.opacity = '0';
    setTimeout(function () {
      el.remove();
      poops = poops.filter(function (p) { return p !== poop; });
      if (clicked) {
        if (wasFlower) showBrokenHeartBubble();
        else if (wasPoop && !poops.some(function (p) { return p.stage <= 1; })) showHeartBubble();
      }
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
    var headCenterX = emu.dir === 1 ? emu.x + 11 * SCALE : emu.x + 4 * SCALE;
    var bx = Math.max(2, Math.min(headCenterX - bubbleEl.width / 2, innerWidth - bubbleEl.width - 2));
    bubbleEl.style.left = bx + 'px';
    bubbleEl.style.top = (emu.y - bubbleEl.height) + 'px';
  }

  function placeBubble(canvas) {
    clearBubble();
    bubbleEl = canvas;
    updateBubblePos();
    petLayer.appendChild(bubbleEl);
    bubbleTimer = setTimeout(clearBubble, 2000);
  }

  // --- Pixel helpers for bubble drawing ---
  function bpx(ctx, x, y, col) {
    ctx.fillStyle = col;
    ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
  }
  function bline(ctx, x, y, len, horiz, col) {
    for (var i = 0; i < len; i++) bpx(ctx, horiz ? x + i : x, horiz ? y : y + i, col);
  }
  function brect(ctx, x, y, w, h, col) {
    for (var ry = 0; ry < h; ry++)
      for (var rx = 0; rx < w; rx++) bpx(ctx, x + rx, y + ry, col);
  }

  function makeBubble(W, H) {
    var c = document.createElement('canvas');
    c.width = W * SCALE; c.height = H * SCALE;
    c.style.cssText = 'position:fixed;z-index:10002;pointer-events:none;image-rendering:pixelated;';
    var ctx = c.getContext('2d');
    bline(ctx, 1, 0, W - 2, true, '#000');
    bline(ctx, 1, H - 3, W - 2, true, '#000');
    bline(ctx, 0, 1, H - 4, false, '#000');
    bline(ctx, W - 1, 1, H - 4, false, '#000');
    brect(ctx, 1, 1, W - 2, H - 4, '#fff');
    var tailX = Math.floor(W / 2);
    bpx(ctx, tailX, H - 2, '#000');
    bpx(ctx, tailX, H - 1, '#000');
    return { canvas: c, ctx: ctx };
  }

  // --- Bubble types ---
  function showHeartBubble() {
    var b = makeBubble(11, 14), hc = '#ef5350';
    bpx(b.ctx, 3, 3, hc); bpx(b.ctx, 4, 3, hc); bpx(b.ctx, 6, 3, hc); bpx(b.ctx, 7, 3, hc);
    bpx(b.ctx, 2, 4, hc); bpx(b.ctx, 3, 4, hc); bpx(b.ctx, 4, 4, hc); bpx(b.ctx, 5, 4, hc); bpx(b.ctx, 6, 4, hc); bpx(b.ctx, 7, 4, hc); bpx(b.ctx, 8, 4, hc);
    bpx(b.ctx, 2, 5, hc); bpx(b.ctx, 3, 5, hc); bpx(b.ctx, 4, 5, hc); bpx(b.ctx, 5, 5, hc); bpx(b.ctx, 6, 5, hc); bpx(b.ctx, 7, 5, hc); bpx(b.ctx, 8, 5, hc);
    bpx(b.ctx, 3, 6, hc); bpx(b.ctx, 4, 6, hc); bpx(b.ctx, 5, 6, hc); bpx(b.ctx, 6, 6, hc); bpx(b.ctx, 7, 6, hc);
    bpx(b.ctx, 4, 7, hc); bpx(b.ctx, 5, 7, hc); bpx(b.ctx, 6, 7, hc);
    bpx(b.ctx, 5, 8, hc);
    placeBubble(b.canvas);
  }

  function showBrokenHeartBubble() {
    var b = makeBubble(11, 14), hc = '#ef5350';
    // Left half
    bpx(b.ctx, 2, 2, hc); bpx(b.ctx, 3, 2, hc);
    bpx(b.ctx, 1, 3, hc); bpx(b.ctx, 2, 3, hc); bpx(b.ctx, 3, 3, hc);
    bpx(b.ctx, 1, 4, hc); bpx(b.ctx, 2, 4, hc); bpx(b.ctx, 3, 4, hc); bpx(b.ctx, 4, 4, hc);
    bpx(b.ctx, 2, 5, hc); bpx(b.ctx, 3, 5, hc); bpx(b.ctx, 4, 5, hc);
    bpx(b.ctx, 2, 6, hc); bpx(b.ctx, 3, 6, hc);
    bpx(b.ctx, 3, 7, hc);
    // Right half
    bpx(b.ctx, 7, 3, hc); bpx(b.ctx, 8, 3, hc);
    bpx(b.ctx, 7, 4, hc); bpx(b.ctx, 8, 4, hc); bpx(b.ctx, 9, 4, hc);
    bpx(b.ctx, 6, 5, hc); bpx(b.ctx, 7, 5, hc); bpx(b.ctx, 8, 5, hc); bpx(b.ctx, 9, 5, hc);
    bpx(b.ctx, 7, 6, hc); bpx(b.ctx, 8, 6, hc); bpx(b.ctx, 9, 6, hc);
    bpx(b.ctx, 7, 7, hc); bpx(b.ctx, 8, 7, hc);
    bpx(b.ctx, 7, 8, hc);
    placeBubble(b.canvas);
  }

  function showQuestionBubble() {
    var b = makeBubble(11, 14);
    bline(b.ctx, 4, 2, 3, true, '#000');
    bpx(b.ctx, 3, 3, '#000'); bpx(b.ctx, 7, 3, '#000');
    bpx(b.ctx, 7, 4, '#000');
    bpx(b.ctx, 6, 5, '#000');
    bpx(b.ctx, 5, 6, '#000');
    bpx(b.ctx, 5, 7, '#000');
    bpx(b.ctx, 5, 9, '#000');
    placeBubble(b.canvas);
  }

  // --- Clock bubble ---
  var nearClock = false;

  function showClockBubble() {
    var b = makeBubble(13, 15);
    var clock = [
      '...bbb...', '..bwwwb..', '.bwwbwwb.', 'bwwwbwwwb',
      'bwwwbbbwb', 'bwwwwwwwb', '.bwwwwwb.', '..bwwwb..', '...bbb...'
    ];
    var cp = { '.': null, 'b': '#000000', 'w': '#ffffff' };
    for (var r = 0; r < clock.length; r++)
      for (var c = 0; c < clock[r].length; c++) {
        var col = cp[clock[r][c]];
        if (col) bpx(b.ctx, 2 + c, 2 + r, col);
      }
    placeBubble(b.canvas);
  }

  function checkClock() {
    var clockArea = document.querySelector('.taskbar-clock');
    if (!clockArea) return;
    var cr = clockArea.getBoundingClientRect();
    var emuCx = emu.x + emuEl.width / 2;
    var isNear = emuCx >= cr.left - 20 && emuCx <= cr.right + 20;
    if (isNear && !nearClock) { nearClock = true; showClockBubble(); }
    else if (!isNear) { nearClock = false; }
  }

  // --- Hint bubble ---
  var hintCtx = null;
  var hintW = 0;
  var hintMobile = false;
  var arrowTarget = 0;

  function isMobileEmu() {
    return window.matchMedia('(pointer: coarse)').matches ||
           window.innerWidth <= 600 || window.innerHeight <= 600;
  }

  function showHintBubble() {
    var mobile = isMobileEmu();
    var b = makeBubble(27, 15);
    // Minimize: _
    bline(b.ctx, 3, 10, 5, true, '#000');
    // Maximize: □
    bline(b.ctx, 11, 7, 5, true, '#000'); bline(b.ctx, 11, 10, 5, true, '#000');
    bline(b.ctx, 11, 7, 4, false, '#000'); bline(b.ctx, 15, 7, 4, false, '#000');
    // Close: ×
    bpx(b.ctx, 19, 7, '#000'); bpx(b.ctx, 23, 7, '#000');
    bpx(b.ctx, 20, 8, '#000'); bpx(b.ctx, 22, 8, '#000');
    bpx(b.ctx, 21, 9, '#000');
    bpx(b.ctx, 20, 10, '#000'); bpx(b.ctx, 22, 10, '#000');
    bpx(b.ctx, 19, 11, '#000'); bpx(b.ctx, 23, 11, '#000');
    placeBubble(b.canvas);
    hintCtx = b.ctx;
    hintW = 27;
    hintMobile = mobile;
    drawHintArrow();
  }

  function drawHintArrow() {
    if (!hintCtx) return;
    var cx = [5, 13][hintMobile ? 0 : arrowTarget];
    brect(hintCtx, 1, 2, hintW - 2, 4, '#fff');
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
          if (!isMobileEmu()) arrowTarget = 1 - arrowTarget;
          drawHintArrow();
          if (bubbleTimer) clearTimeout(bubbleTimer);
          bubbleTimer = setTimeout(clearBubble, 2000);
        } else {
          showHintBubble();
        }
      } else {
        showQuestionBubble();
      }
      return;
    }
    emu.state = 'running';
    emu.dir = e.clientX > emu.x + emuEl.width / 2 ? -1 : 1;
    emu.runT = RUN_MS;
  }

  // --- Handle resize ---
  window.addEventListener('resize', function () {
    if (!booted) return;
    var mx = innerWidth - emuEl.width;
    if (emu.x > mx) emu.x = mx;
    if (emu.x < 0) emu.x = 0;
    emu.y = emu.state === 'hiding' ? hideY() : walkY();
    render();
    var tbH = getTaskbarH();
    poops.forEach(function (p) {
      var st = POOP_STAGES[p.stage];
      if (!st || st.vanish) return;
      var pw = st.w * SCALE;
      p.cx = Math.max(pw / 2, Math.min(p.cx, innerWidth - pw / 2));
      p.el.style.left = (p.cx - pw / 2) + 'px';
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