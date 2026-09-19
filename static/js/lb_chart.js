/* BiDex-100 per-task bar chart.
 * Faceted grouped-bar chart: 5 capability-axis panels, each showing every
 * task as a group of 7 model bars. Vanilla SVG — no chart library, no CDN —
 * so it renders on networks where the Google CDN jQuery/fonts are blocked.
 * Data comes from static/js/lb_chart_data.js (window.LB_CHART_DATA).
 */
(function () {
  'use strict';
  var D = window.LB_CHART_DATA;
  if (!D || !D.sections) return;

  var ST = { metric: 'score', domain: 'all' }; // metric: 'score'|'success', domain: 'all'|'id'|'ood'

  // Each model row per task: [score_id, succ_id, score_ood, succ_ood] (0..100).
  function val(row) {
    var s = ST.metric === 'success' ? 1 : 0;
    var o = ST.metric === 'success' ? 3 : 2;
    var a = row[s], b = row[o];
    if (ST.domain === 'all') {
      if (a == null) return b;
      if (b == null) return a;
      return (a + b) / 2;
    }
    return ST.domain === 'ood' ? b : a;
  }

  function fmtPct(v) { return v == null ? '—' : (Math.round(v * 10) / 10).toFixed(1) + '%'; }

  // layout constants
  var PER_TASK = 62, GROUP_W = 51, BAR_W = 6, BAR_GAP = 1.5;
  var PAD_L = 52, PAD_R = 16, PAD_T = 14, PAD_B = 70, H = 380;
  var PLOT_H = H - PAD_T - PAD_B;

  function esc(s) {
    return String(s).replace(/[<>&"']/g, function (c) {
      return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function buildTop() {
    var models = D.models;
    // controls
    var chips = function (kind, vals, active) {
      return vals.map(function (v) {
        return '<button class="lb-chip' + (v.v === active ? ' is-active' : '') +
          '" data-ch="' + kind + '" data-ch-v="' + v.v + '" type="button">' + v.label + '</button>';
      }).join('');
    };
    var legend = models.map(function (m, i) {
      return '<li class="lbch-legend-item" data-mi="' + i + '">' +
        '<span class="lbch-swatch" style="background:' + m.color + '"></span>' +
        '<span class="lbch-legend-name">' + esc(m.name) + '</span></li>';
    }).join('');

    return (
      '<div class="lbch-top">' +
        '<div class="lbch-head">' +
          '<p class="lb-kicker">BiDex-100 · Per-Task Performance</p>' +
          '<h1 class="lbch-title">7 VLA Models × 106 Tasks</h1>' +
          '<p class="lbch-sub">Each bar is a task on one of the five capability axes; the seven bars per task are the ' +
          'evaluated models. Toggle the metric and domain to re-skin the chart; hover a bar for exact numbers; hover a ' +
          'model name to isolate it.</p>' +
        '</div>' +
        '<div class="lbch-controls lb-toolbar">' +
          '<div class="lb-toolbar-group">' +
            '<span class="lb-sort-label">Metric</span>' +
            '<div class="lb-chips" role="group" aria-label="Metric">' +
              chips('metric', [{ v: 'score', label: 'Progress Score' }, { v: 'success', label: 'Success Rate' }], ST.metric) +
            '</div>' +
          '</div>' +
          '<div class="lb-toolbar-group">' +
            '<span class="lb-sort-label">Domain</span>' +
            '<div class="lb-chips" role="group" aria-label="Domain">' +
              chips('domain', [{ v: 'all', label: 'All' }, { v: 'id', label: 'In-Domain' }, { v: 'ood', label: 'Out-of-Domain' }], ST.domain) +
            '</div>' +
          '</div>' +
          '<span class="lb-stamp">2 seeds × 25 eps · 106 tasks · 7 models</span>' +
        '</div>' +
        '<ul class="lbch-legend">' + legend + '</ul>' +
      '</div>'
    );
  }

  function panelSVG(section) {
    var tasks = section.tasks;
    var n = tasks.length;
    var plotW = n * PER_TASK;
    var W_ = PAD_L + plotW + PAD_R;

    var grid = '';
    [0, 25, 50, 75, 100].forEach(function (g) {
      var y = PAD_T + PLOT_H * (1 - g / 100);
      var lbl = g === 0 ? '0' : g + '';
      grid += '<line class="lbch-grid" x1="' + PAD_L + '" x2="' + (PAD_L + plotW) +
        '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>' +
        '<text class="lbch-ax-y" x="' + (PAD_L - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end">' + lbl + '</text>';
    });
    // baseline
    grid += '<line class="lbch-baseline" x1="' + PAD_L + '" x2="' + (PAD_L + plotW) +
      '" y1="' + (PAD_T + PLOT_H) + '" y2="' + (PAD_T + PLOT_H) + '"/>';
    grid += '<text class="lbch-ax-title" x="' + (PAD_L + plotW / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' +
      (ST.metric === 'success' ? 'Strict success rate (%)' : 'Progress score (%)') +
      (ST.domain === 'all' ? ' · mean of ID & OOD' : (ST.domain === 'ood' ? ' · Out-of-Domain' : ' · In-Domain')) + '</text>';

    var bars = '';
    tasks.forEach(function (task, ti) {
      var gx = PAD_L + ti * PER_TASK + (PER_TASK - GROUP_W) / 2;
      // x label
      bars += '<text class="lbch-ax-x" transform="translate(' + (gx + GROUP_W / 2).toFixed(1) + ',' + (PAD_T + PLOT_H + 9) + ') rotate(-38)" text-anchor="end">' + esc(task.short) + '</text>';
      task.v.forEach(function (row, mi) {
        var v = val(row);
        if (v == null) return;
        var h = PLOT_H * (v / 100);
        if (h < 0.4) h = 0; // 0 -> no bar
        var x = (gx + mi * (BAR_W + BAR_GAP)).toFixed(1);
        var y = (PAD_T + PLOT_H - h).toFixed(1);
        var ht = h < 0.4 ? 0.4 : h;
        bars += '<rect class="lbch-bar lbch-mi-' + mi + '" data-mi="' + mi + '" data-task="' + esc(task.name) +
          '" data-short="' + esc(task.short) + '" x="' + x + '" y="' + y + '" width="' + BAR_W +
          '" height="' + ht.toFixed(2) + '" rx="1.5" fill="' + D.models[mi].color + '"/>';
      });
    });

    return '<svg class="lbch-svg" viewBox="0 0 ' + W_ + ' ' + H + '" width="' + W_ + '" height="' + H +
      '" preserveAspectRatio="xMinYMid meet" role="img" aria-label="' + esc(section.name) + ' per-task bars">' +
      '<rect class="lbch-bg" x="0" y="0" width="' + W_ + '" height="' + H + '"/>' +
      grid + bars + '</svg>';
  }

  function buildPanels() {
    return D.sections.map(function (s) {
      return '<div class="lbch-card">' +
        '<div class="lbch-card-head" style="--bc:' + s.color + '">' +
          '<span class="lbch-dot" style="background:' + s.color + '"></span>' +
          '<h2 class="lbch-card-title">' + esc(s.name) + '</h2>' +
          '<span class="lbch-card-count">' + s.n + ' tasks</span>' +
        '</div>' +
        '<div class="lbch-svghost">' + panelSVG(s) + '</div>' +
      '</div>';
    }).join('');
  }

  var root, tip;
  function render() {
    root.innerHTML = buildTop() + '<div class="lbch-grid">' + buildPanels() + '</div>';
    wire();
  }

  function wire() {
    document.querySelectorAll('[data-ch]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.getAttribute('data-ch');
        var v = b.getAttribute('data-ch-v');
        document.querySelectorAll('[data-ch="' + kind + '"]').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        ST[kind] = v;
        // only the panel SVGs depend on state; cheap full re-render keeps labels in sync
        render();
      });
    });

    // legend hover -> isolate model
    root.querySelectorAll('.lbch-legend-item').forEach(function (li) {
      var mi = li.getAttribute('data-mi');
      li.addEventListener('mouseenter', function () { root.classList.add('lbch-focus-mi-' + mi); });
      li.addEventListener('mouseleave', function () { root.classList.remove('lbch-focus-mi-' + mi); });
    });

    // bar tooltip (delegated per panel svg)
    root.querySelectorAll('.lbch-svg').forEach(function (svg) {
      svg.addEventListener('mousemove', function (e) {
        var target = e.target;
        if (!target || target.tagName !== 'rect' || !target.classList.contains('lbch-bar')) {
          hideTip(); return;
        }
        var mi = target.getAttribute('data-mi');
        var short = target.getAttribute('data-short');
        var full = target.getAttribute('data-task');
        // value: recompute from nearest row by attribute lookup is cheaper via dataset
        var rect = target.getBBox ? target : null;
        var v;
        // read value via data attribute we stored? we stored names only; recompute through dataset
        var row = findRow(full, +mi);
        v = row == null ? null : val(row);
        showTip(e.clientX, e.clientY, D.models[mi].name, short, full, v);
      });
      svg.addEventListener('mouseleave', hideTip);
    });
  }

  // lookup a task x model row from the data (full task name)
  function findRow(fullTask, mi) {
    for (var si = 0; si < D.sections.length; si++) {
      var t = D.sections[si].tasks;
      for (var i = 0; i < t.length; i++) {
        if (t[i].name === fullTask) return t[i].v[mi];
      }
    }
    return null;
  }

  function showTip(cx, cy, model, short, full, v) {
    if (!tip) return;
    var txt = '<div class="lbch-tip-model">' + esc(model) + '</div>' +
      '<div class="lbch-tip-task" title="' + esc(full) + '">' + esc(short) + '</div>' +
      '<div class="lbch-tip-val">' + (ST.metric === 'success' ? 'Success' : 'Score') +
      ' · ' + (ST.domain === 'all' ? 'All' : ST.domain === 'id' ? 'ID' : 'OOD') +
      ': <b>' + fmtPct(v) + '</b></div>';
    tip.innerHTML = txt;
    tip.style.display = 'block';
    var w = tip.offsetWidth || 180, h = tip.offsetHeight || 56;
    var x = cx + 14, y = cy - h - 14;
    if (x + w > window.innerWidth - 8) x = window.innerWidth - w - 8;
    if (y < 8) y = cy + 14;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hideTip() { if (tip) tip.style.display = 'none'; }

  function init() {
    root = document.getElementById('lbch-root');
    if (!root) return;
    tip = document.getElementById('lbch-tip');
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else { init(); }
})();
