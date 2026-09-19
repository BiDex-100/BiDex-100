// index.js for the BiDex-100 project page.
window.HELP_IMPROVE_VIDEOJS = false;

/* ============================================================
 * VLA leaderboard — interactive RoboDojo-style table.
 * No GIF: a sortable, ranked HTML table driven by the data
 * below. Toggle the metric (progress score / success rate) and
 * the domain (In-Domain / Out-of-Domain); click a column header
 * to re-rank by that axis.
 * ============================================================ */

// Axis columns, in display order. `ov` (Overall) is the headline metric.
var LB_AXES = [
  { key: 'gen', label: 'Generalization',        abbr: 'Gen' },
  { key: 'if',  label: 'Instruction-Following',  abbr: 'Instruct.' },
  { key: 'ld',  label: 'Limited-Demo.',          abbr: 'Lim-Demo' },
  { key: 'lh',  label: 'Long-Horizon',           abbr: 'Long-Hor.' },
  { key: 'mem', label: 'Memory',                abbr: 'Mem' },
  { key: 'ov',  label: 'Overall',               abbr: 'Overall' }
];

// Per-model results: each axis holds [progressScore, successRate] (%) for both domains.
var LB_MODELS = [
  { html: 'LingBot-VLA-v2',
    id:  { gen: [77.7, 63.4], if: [51.8, 30.4], ld: [74.6, 65.8], lh: [69.4, 41.6], mem: [43.4, 27.2], ov: [68.0, 52.3] },
    ood: { gen: [28.0, 10.5], if: [34.3, 6.5],  ld: [25.8, 17.2], lh: [22.0, 4.6],  mem: [24.6, 13.4], ov: [27.8, 11.1] } },
  { html: 'π<sub>0.5</sub>',
    id:  { gen: [74.1, 57.5], if: [50.7, 31.4], ld: [73.6, 64.7], lh: [67.7, 42.0], mem: [51.0, 35.6], ov: [66.8, 50.8] },
    ood: { gen: [28.6, 12.1], if: [32.8, 7.8],  ld: [25.0, 15.2], lh: [19.4, 4.0],  mem: [27.0, 17.4], ov: [27.5, 11.8] } },
  { html: 'GR00T-N1.7',
    id:  { gen: [68.5, 49.6], if: [48.2, 21.0], ld: [73.5, 62.5], lh: [61.6, 32.6], mem: [35.1, 20.6], ov: [62.1, 43.1] },
    ood: { gen: [25.0, 8.4],  if: [41.4, 10.4], ld: [32.9, 22.1], lh: [32.4, 10.0], mem: [21.7, 6.0],  ov: [30.4, 12.1] } },
  { html: 'InternVLA-A1.5',
    id:  { gen: [5.6, 0.3],   if: [15.5, 0.0],  ld: [10.2, 5.5],  lh: [1.7, 0.0],   mem: [0.2, 0.0],   ov: [7.7, 1.5] },
    ood: { gen: [3.3, 0.1],   if: [14.9, 0.0],  ld: [7.1, 4.6],   lh: [2.3, 0.0],   mem: [0.0, 0.0],   ov: [6.0, 1.2] } },
  { html: 'Galaxea G0.5',
    id:  { gen: [37.0, 19.5], if: [23.9, 3.1],  ld: [42.9, 29.1], lh: [18.1, 2.6],  mem: [17.2, 4.6],  ov: [32.3, 15.8] },
    ood: { gen: [8.4, 1.1],   if: [16.1, 0.0],  ld: [8.2, 2.9],   lh: [5.2, 0.0],   mem: [2.6, 0.0],   ov: [9.0, 1.2] } },
  { html: 'OpenDM-DM05',
    id:  { gen: [55.6, 35.4], if: [27.4, 3.1],  ld: [49.0, 34.5], lh: [20.1, 3.8],  mem: [27.5, 15.0], ov: [42.6, 24.2] },
    ood: { gen: [21.8, 6.6],  if: [21.2, 0.6],  ld: [15.7, 7.0],  lh: [16.4, 1.6],  mem: [14.9, 7.2],  ov: [19.0, 5.2] } },
  { html: 'Xiaomi XR1',
    id:  { gen: [22.7, 5.6],  if: [17.6, 0.3],  ld: [17.1, 4.5],  lh: [13.3, 0.2],  mem: [7.0, 0.0],   ov: [18.0, 3.3] },
    ood: { gen: [8.1, 0.2],   if: [15.7, 0.0],  ld: [4.4, 0.6],   lh: [9.4, 0.0],   mem: [6.6, 0.0],   ov: [8.6, 0.2] } }
];

// Static details for the VLA baselines table.
var LB_MODEL_DETAILS = [
  { html: 'π<sub>0.5</sub>',    bb: 'PaliGemma-2B', exp: '300M flow-matching', chunk: 50,  train: '60k' },
  { html: 'GR00T-N1.7',        bb: 'Cosmos-R2-2B',  exp: 'DiT flow-matching',  chunk: 16,  train: '400k' },
  { html: 'InternVLA-A1.5',    bb: 'Qwen3.5-2B',    exp: '1B flow-matching',   chunk: 50,  train: '120k' },
  { html: 'Galaxea G0.5',       bb: 'Qwen3.5-2B',    exp: 'flow-matching',     chunk: 32,  train: '120k' },
  { html: 'OpenDM-DM05',        bb: 'Gemma3-4B',     exp: 'rectified flow',    chunk: 50,  train: '120k' },
  { html: 'LingBot-VLA-v2',     bb: 'Qwen3-VL-4B',   exp: 'MoE flow (L1)',     chunk: 50,  train: '60k' },
  { html: 'Xiaomi XR1',         bb: 'Qwen3-VL-4B',   exp: '60-D DiT flow',    chunk: 30,  train: '120k' }
];

// Live leaderboard state.
var LB = {
  metric: 'score', // 'score' | 'success'
  domain: 'id',    // 'id' | 'ood'
  sortKey: 'ov',   // axis key to rank by
  sortDir: 'desc'  // 'desc' | 'asc'
};

function lbMetricIdx() { return LB.metric === 'success' ? 1 : 0; }

function lbVal(model, axisKey) {
  return model[LB.domain][axisKey][lbMetricIdx()];
}

function lbFmt(v) { return v.toFixed(1); }

// Best value per axis across all models (for the accent highlight).
function lbBestPerAxis() {
  var best = {};
  LB_AXES.forEach(function (a) {
    var m = -Infinity;
    LB_MODELS.forEach(function (mo) {
      var v = lbVal(mo, a.key);
      if (v > m) m = v;
    });
    best[a.key] = m;
  });
  return best;
}

function lbRenderHead() {
  var head = document.getElementById('lb-head-row');
  if (!head) return;
  var html = '<th class="lb-th-rank" aria-label="Rank">#</th>';
  html += '<th class="lb-th-model">Model</th>';
  LB_AXES.forEach(function (a) {
    var sorted = (a.key === LB.sortKey) ? ' is-sorted' : '';
    var overall = (a.key === 'ov') ? ' lb-th-overall' : '';
    var arrow = (a.key === LB.sortKey) ? (LB.sortDir === 'desc' ? ' ▾' : ' ▴') : '';
    html += '<th class="lb-th-metric' + sorted + overall + '" data-lb-sort="' + a.key +
      '" title="' + a.label + '">' +
      '<button class="lb-sort-btn" type="button">' + a.label +
      '<span class="lb-sort-ind">' + arrow + '</span></button></th>';
  });
  head.innerHTML = html;
}

function lbRenderBody() {
  var body = document.getElementById('lb-body');
  if (!body) return;
  var sorted = LB_MODELS.slice().sort(function (x, y) {
    var d = lbVal(y, LB.sortKey) - lbVal(x, LB.sortKey);
    return LB.sortDir === 'desc' ? d : -d;
  });
  var best = lbBestPerAxis();
  var html = '';
  sorted.forEach(function (mo, i) {
    var rank = i + 1;
    var first = rank === 1 ? ' is-first' : '';
    var row = '<tr class="lb-row' + first + '">';
    row += '<td class="lb-rank' + first + '">' + rank + '</td>';
    row += '<td class="lb-model"><span class="lb-model-name">' + mo.html + '</span></td>';
    LB_AXES.forEach(function (a) {
      var v = lbVal(mo, a.key);
      var leader = (v === best[a.key] && v > 0) ? ' is-leader' : '';
      var overall = (a.key === 'ov') ? ' lb-overall' : '';
      row += '<td class="lb-metric' + leader + overall + '">' + lbFmt(v) + '</td>';
    });
    row += '</tr>';
    html += row;
  });
  body.innerHTML = html;
}

function lbRender() {
  lbRenderHead();
  lbRenderBody();
}

function lbRenderModels() {
  var tb = document.getElementById('lb-models-body');
  if (!tb) return;
  tb.innerHTML = LB_MODEL_DETAILS.map(function (m) {
    return '<tr class="lb-models-row">' +
      '<td class="lb-models-name">' + m.html + '</td>' +
      '<td>' + m.bb + '</td>' +
      '<td>' + m.exp + '</td>' +
      '<td class="lb-num">' + m.chunk + '</td>' +
      '<td class="lb-num">' + m.train + '</td>' +
      '</tr>';
  }).join('');
}

function lbInit() {
  if (!document.getElementById('lb-head-row')) return;

  // Metric chips
  document.querySelectorAll('[data-lb-toggle="metric"]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-lb-toggle="metric"]').forEach(function (x) {
        x.classList.remove('is-active');
      });
      b.classList.add('is-active');
      LB.metric = b.getAttribute('data-lb-value');
      lbRender();
    });
  });

  // Domain chips
  document.querySelectorAll('[data-lb-toggle="domain"]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-lb-toggle="domain"]').forEach(function (x) {
        x.classList.remove('is-active');
      });
      b.classList.add('is-active');
      LB.domain = b.getAttribute('data-lb-value');
      lbRender();
    });
  });

  // Column sort (delegated — the <tr> persists across renders)
  var headRow = document.getElementById('lb-head-row');
  headRow.addEventListener('click', function (e) {
    var th = e.target.closest('th[data-lb-sort]');
    if (!th) return;
    var key = th.getAttribute('data-lb-sort');
    if (LB.sortKey === key) {
      LB.sortDir = (LB.sortDir === 'desc') ? 'asc' : 'desc';
    } else {
      LB.sortKey = key;
      LB.sortDir = 'desc';
    }
    lbRender();
  });

  lbRender();
}

$(document).ready(function () {
  // Navbar burger toggle (mobile menu)
  $(".navbar-burger").click(function () {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  // Carousel init (used by any .carousel block)
  var options = {
    slidesToScroll: 1,
    slidesToShow: 2,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000
  };
  if (window.bulmaCarousel) { bulmaCarousel.attach(".carousel", options); }
  if (window.bulmaSlider) { bulmaSlider.attach(); }

  // Interactive leaderboard
  lbRenderModels();
  lbInit();
});
