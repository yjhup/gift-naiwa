(function () {
  var video = document.getElementById('video');
  var hint = document.getElementById('soundHint');
  var hintText = document.getElementById('soundText');
  if (!video) return;

  var unlocked = false;
  // 揭晓瞬间别用大音量吓到人，后续用户可自行调大。
  var START_VOLUME = 0.3;

  function showHint(text) {
    if (hintText && text) hintText.textContent = text;
    if (hint) hint.classList.add('is-visible');
  }

  function hideHint() {
    if (hint) hint.classList.remove('is-visible');
  }

  function unmute() {
    if (unlocked) return;
    unlocked = true;
    video.muted = false;
    video.volume = START_VOLUME;
    var result = video.play();
    if (result && typeof result.then === 'function') {
      result.then(hideHint).catch(function () {
        unlocked = false;
        showHint('点击播放视频');
      });
    } else {
      hideHint();
    }
    document.removeEventListener('pointerdown', unlockByGesture);
    document.removeEventListener('touchstart', unlockByGesture);
    document.removeEventListener('keydown', unlockByGesture);
  }

  function unlockByGesture() {
    unmute();
  }

  // 先尝试带声音自动播放，被浏览器策略拦截时退回静音自动播放。
  function autoplay() {
    video.muted = false;
    video.volume = START_VOLUME;
    var result = video.play();
    if (result && typeof result.then === 'function') {
      result.then(function () {
        unlocked = true;
        hideHint();
      }).catch(function () {
        video.muted = true;
        var retry = video.play();
        if (retry && typeof retry.then === 'function') {
          retry.then(function () {
            showHint('点击开启声音');
          }).catch(function () {
            showHint('点击播放视频');
          });
        } else {
          showHint('点击开启声音');
        }
      });
    } else {
      unlocked = true;
      hideHint();
    }
  }

  autoplay();

  if (hint) {
    hint.addEventListener('click', function (event) {
      event.stopPropagation();
      unmute();
    });
  }

  document.addEventListener('pointerdown', unlockByGesture, { passive: true });
  document.addEventListener('touchstart', unlockByGesture, { passive: true });
  document.addEventListener('keydown', unlockByGesture);

  video.addEventListener('volumechange', function () {
    if (!video.muted) hideHint();
  });

  // 部分浏览器页面恢复可见后才允许播放
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && video.paused) {
      video.play().catch(function () {});
    }
  });
})();
