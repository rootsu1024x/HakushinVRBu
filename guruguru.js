window.addEventListener('devicemotion', function(e) {
  document.querySelector('#intv').textContent = e.interval;
  document.querySelector('#beta').textContent = e.rotationRate.beta;
  document.querySelector('#gamma').textContent = e.rotationRate.gamma;
});
