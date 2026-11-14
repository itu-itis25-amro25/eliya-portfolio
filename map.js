/* World map — About page. Requires d3 v7. */
(function () {
  var wrap = document.getElementById('map-svg');
  var pop = document.getElementById('map-pop');
  if (!wrap || typeof d3 === 'undefined') return;

  var places = {
    TUR: { name: 'Türkiye', kind: 'home', note: 'Home base since 2021' },
    TZA: { name: 'Tanzania', kind: 'heritage', note: 'Where I grew up' },
    LBN: { name: 'Lebanon', kind: 'heritage', note: 'Heritage · early childhood' },
    POL: { name: 'Poland', kind: 'heritage', note: 'Heritage' },
    KEN: { name: 'Kenya', kind: 'visited', note: 'Visited' },
    UGA: { name: 'Uganda', kind: 'visited', note: 'Visited' },
    ZAF: { name: 'South Africa', kind: 'visited', note: 'Visited' },
    MOZ: { name: 'Mozambique', kind: 'visited', note: 'Visited' },
    LSO: { name: 'Lesotho', kind: 'visited', note: 'Visited' }
  };

  var width = 960, height = 520;
  var svg = d3.select(wrap).append('svg')
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('role', 'img')
    .attr('aria-label', 'World map highlighting the countries Eliya is connected to');
  var g = svg.append('g');
  var projection = d3.geoNaturalEarth1();
  var path = d3.geoPath().projection(projection);

  var zoom = d3.zoom().scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', function (e) { g.attr('transform', e.transform); });
  svg.call(zoom).on('wheel.zoom', null); // keep page scroll working; use buttons/pinch/drag

  d3.select('#zoom-in').on('click', function () { svg.transition().duration(350).call(zoom.scaleBy, 1.5); });
  d3.select('#zoom-out').on('click', function () { svg.transition().duration(350).call(zoom.scaleBy, 0.67); });
  d3.select('#zoom-reset').on('click', function () { svg.transition().duration(450).call(zoom.transform, d3.zoomIdentity); });

  function showPop(event, html) {
    var r = wrap.getBoundingClientRect();
    pop.innerHTML = html;
    pop.style.display = 'block';
    var x = event.clientX - r.left + 14, y = event.clientY - r.top + 14;
    if (x + pop.offsetWidth > r.width) x = event.clientX - r.left - pop.offsetWidth - 10;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }
  function hidePop() { pop.style.display = 'none'; }

  d3.json('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(function (world) {
    world.features = world.features.filter(function (f) { return f.id !== 'ATA'; });
    projection.fitExtent([[10, 10], [width - 10, height - 10]], world);

    var countries = g.selectAll('path').data(world.features).enter().append('path')
      .attr('d', path)
      .attr('class', function (d) { var p = places[d.id]; return 'country-path' + (p ? ' ' + p.kind : ''); })
      .on('mousemove', function (event, d) {
        var p = places[d.id];
        var nm = p ? p.name : (d.properties && d.properties.name) || d.id;
        showPop(event, '<strong>' + nm + '</strong>' + (p ? ' · ' + p.note : ''));
      })
      .on('mouseleave', hidePop);

    // Small countries get a dot so they're visible
    ['LBN', 'LSO'].forEach(function (code) {
      var f = world.features.find(function (x) { return x.id === code; });
      if (!f) return;
      var c = path.centroid(f);
      g.append('circle').attr('cx', c[0]).attr('cy', c[1]).attr('r', 4)
        .attr('fill', places[code].kind === 'heritage' ? '#2563EB' : '#FF4757')
        .attr('stroke', '#fff').attr('stroke-width', 1.2).style('cursor', 'pointer')
        .on('mousemove', function (e) { showPop(e, '<strong>' + places[code].name + '</strong> · ' + places[code].note); })
        .on('mouseleave', hidePop);
    });

    // Pulsing pin on Istanbul
    var ist = projection([28.98, 41.01]);
    var pin = g.append('g').attr('transform', 'translate(' + ist[0] + ',' + ist[1] + ')');
    pin.append('circle').attr('r', 6).attr('fill', 'rgba(37,99,235,.25)').attr('stroke', '#2563EB').attr('stroke-width', 1.2)
      .append('animate').attr('attributeName', 'r').attr('values', '4;16;4').attr('dur', '2.2s').attr('repeatCount', 'indefinite');
    pin.append('circle').attr('r', 3.5).attr('fill', '#FF4757').attr('stroke', '#fff').attr('stroke-width', 1.2);

    // Sync list ↔ map
    document.querySelectorAll('.country-item').forEach(function (item) {
      var code = item.getAttribute('data-code');
      function on() { countries.filter(function (d) { return d.id === code; }).classed('hl', true); item.classList.add('active'); }
      function off() { countries.filter(function (d) { return d.id === code; }).classed('hl', false); item.classList.remove('active'); }
      item.addEventListener('mouseenter', on);
      item.addEventListener('mouseleave', off);
      item.addEventListener('focus', on);
      item.addEventListener('blur', off);
      item.addEventListener('click', function () {
        var f = world.features.find(function (x) { return x.id === code; });
        if (!f) return;
        var b = path.bounds(f), dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1];
        var cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2;
        var k = Math.max(1, Math.min(6, 0.35 / Math.max(dx / width, dy / height)));
        svg.transition().duration(650).call(zoom.transform, d3.zoomIdentity.translate(width / 2 - k * cx, height / 2 - k * cy).scale(k));
      });
    });
  }).catch(function () {
    wrap.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted);font-size:14px;">The interactive map couldn\'t load right now. Please try refreshing.</p>';
  });
})();
