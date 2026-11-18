// 「残忍拒绝」无效小剧场：先卖个关子，最后才揭晓神秘礼物。
(function () {
  var btn = document.getElementById('refuseBtn');
  var scene = document.getElementById('refuseScene');
  if (!btn || !scene) return;

  var line = document.getElementById('refuseLine');
  var count = document.getElementById('refuseCount');
  var go = document.getElementById('refuseGo');
  var skip = document.getElementById('refuseSkip');
  var target = btn.getAttribute('href') || 'play.html';

  var timers = [];
  var jumped = false;
  var remaining = 3;

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function later(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach(function (id) {
      window.clearTimeout(id);
    });
    timers = [];
  }

  var lines = [
    '你确定要拒绝人家吗？🥺',
    '再给你三秒考虑一下～',
    '3 · 2 · 1 · ',
    '拒绝无效！礼物已经出发啦 🎁💨'
  ];

  // 逐字显示台词。用 Array.from 正确处理 emoji，节奏加快以便跟 3 秒倒计时同步。
  function typeLine(text, done) {
    var chars = Array.from(text);
    var index = 0;
    if (line) line.textContent = '';

    function step() {
      if (index >= chars.length) {
        later(done, 140);
        return;
      }
      if (line) line.textContent += chars[index];
      index += 1;
      later(step, reduceMotion ? 0 : 38);
    }

    step();
  }

  function tell(index) {
    if (index >= lines.length) return;
    typeLine(lines[index], function () {
      tell(index + 1);
    });
  }

  function jump() {
    if (jumped) return;
    jumped = true;
    clearTimers();
    window.location.href = target;
  }

  function tick() {
    if (jumped) return;
    if (remaining <= 0) {
      jump();
      return;
    }
    if (count) count.textContent = String(remaining);
    remaining -= 1;
    later(tick, 1000);
  }

  function beginCountdown() {
    scene.classList.add('is-final');
    if (go) go.disabled = false;
    tick();
  }

  btn.addEventListener('click', function (event) {
    event.preventDefault(); // 无 JS 时仍走链接，有 JS 时先看小剧场
    if (jumped) return;
    scene.classList.add('is-open');
    scene.setAttribute('aria-hidden', 'false');
    // 倒计时从点击瞬间开始，台词并行播放，不再等字打完。
    beginCountdown();
    if (reduceMotion) {
      if (line) line.textContent = lines[lines.length - 1];
    } else {
      tell(0);
    }
  });

  if (go) go.addEventListener('click', jump);
  if (skip) skip.addEventListener('click', jump);

  // 键盘用户随时可以跳过等待
  document.addEventListener('keydown', function (event) {
    if (scene.classList.contains('is-open') && event.key === 'Escape') jump();
  });
})();
