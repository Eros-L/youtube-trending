import * as d3 from "d3";

var svgutil = require('util/svgutil');

function DetailShapes(selection) {
  var detailClips = selection.selectAll('.SongTimeline--clip')
    .data((d) => [d])

  detailClips.enter().append('clipPath')
    .attr('class', 'SongTimeline--clip')

  detailClips.exit().remove()

  detailClips = selection.selectAll('.SongTimeline--clip')

  detailClips
    .attr('id', (d) => 'tlplanetclip-' + d.versionId)

  var detailClipUse = detailClips.selectAll('use')
    .data((d) => [d])

  detailClipUse.enter().append('use')

  detailClipUse.exit().remove()

  detailClipUse = detailClips.selectAll('use')

  detailClipUse
    .attr('xlink:href', (d) => '#' + 'tlplanet-' + d.versionId)

  var roundDetailShapes = selection.filter((d) => d.isCircle)
    .selectAll('.SongTimeline--planet__shape.SongTimeline--planet__round')
    .data((d) => [d]);

  roundDetailShapes.enter().append('circle')
    .attr('class', 'SongTimeline--planet__shape SongTimeline--planet__round')

  roundDetailShapes.exit().remove()

  roundDetailShapes = selection.filter((d) => d.isCircle)
      .selectAll('.SongTimeline--planet__shape.SongTimeline--planet__round')

  roundDetailShapes
    .attr('id', (d) => 'tlplanet-' + d.versionId)
    .attr('r', (d) => d.timelinePlanetRadius)
    .attr('fill', (d) => d.genreColor)

  var detailShadows = selection.selectAll('.SongTimeline--planet__shadow')
    .data((d) => [d]);

  detailShadows.enter().append('path')
    .attr('class', 'SongTimeline--planet__shadow');

  detailShadows.exit().remove();

  detailShadows = selection.selectAll('.SongTimeline--planet__shadow')

  detailShadows.attr("d", function (d) {
    let startAngle = 2 * Math.PI * (d.likes / (d.likes + d.dislikes));
    let arcs = d3.arc()
        .innerRadius(0)
        .outerRadius(d.timelinePlanetRadius)
        .startAngle(startAngle)
        .endAngle(2 * Math.PI);
    return arcs();
  })
      .attr('clip-path', (d) => 'url(#' + 'tlplanetclip-' + d.versionId + ')');
}

module.exports = DetailShapes;
