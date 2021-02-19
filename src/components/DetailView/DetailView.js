'use strict';

var d3 = require('d3')
,   Vec2 = require('svec2')

require('components/DetailView/DetailView.css')

var ViewActions = require('actions/ViewActions')
,   DataUtil = require('util/datautil')
,   svgutil = require('util/svgutil')
,   EnergyTails = require('components/DetailView/EnergyTails')
,   DetailShapes = require('components/DetailView/DetailShapes')
,   AxisStar = require('components/DetailView/AxisStar')
,   Axis = require('components/DetailView/Axis')
,   DetailOverlay = require('components/DetailView/DetailOverlay')

var DetailView = {

  applyDetailLayout(datum, state, layout, yOffset) {
    var highlineY = yOffset + layout.tlHighline
    ,   baselineY = yOffset + layout.tlBase
    ,   timelineTop = yOffset + layout.tlTop
    ,   energyRange = DataUtil.getMinMax(datum.genres, (item) => item.views || 0)
    ,   timelineYScale = d3.scaleLinear().domain(energyRange).range([baselineY - 25, timelineTop])
    ,   timeRange = DataUtil.getMinMax(datum.genres, (item) => item.video_count)
    ,   timelineXRange = [150, window.innerWidth - 150]
    ,   timelineXScale = d3.scaleLinear().domain(timeRange).range(timelineXRange)
    ,   timelinePlanetRadiusRange = DataUtil.getMinMax(datum.genres, (item) => item.comment_count || 0)
    ,   timelinePlanetRadiusScale = d3.scaleLinear().domain(timelinePlanetRadiusRange).range([10, 50]);

    datum.genres.forEach((genreData) => {
      genreData.timelineCX = timelineXScale(genreData.video_count);
      genreData.timelineCY = timelineYScale(genreData.views);
      genreData.timelineBaseY = baselineY;
      genreData.isCircle = true;
      genreData.timelinePlanetRadius = timelinePlanetRadiusScale(genreData.comment_count);
      if (genreData.isCircle) {
        genreData.tailpt1 = [-genreData.timelinePlanetRadius, 0];
        genreData.tailpt2 = [genreData.timelinePlanetRadius, 0];
      }
    });

    return {
      yOffset: yOffset
    , baselineY: baselineY
    , timelineXScale: timelineXScale
    , layoutWidth: layout.bodyWidth
    , layoutHeight: layout.bodyHeight
    }
  },

  isActive(node) {
    return d3.select(node).classed('MainView__detail')
  },

  transitionIn(node, data, state, dimensions, callback) {
    var d3Node = d3.select(node)

    d3Node.classed('MainView__map', false)

    let systems = d3Node.selectAll('#area, #label');

    systems
      .transition()
      .duration(300)
      .style('opacity', 0)
      .remove()
      .on('end', DataUtil.before(3, function() {
        callback()
      }))
  },

  render(node, data, state, dimensions) {
    var d3Node = d3.select(node)

    d3Node
      .classed('MainView__detail', true)
      .attr('width', dimensions.layoutWidth)
      .attr('height', dimensions.layoutHeight)

    d3Node.datum(dimensions)

    var viewWrapper = d3Node.selectAll('.ViewWrapper')

    if (viewWrapper.empty()) {
      viewWrapper = d3Node.append('g')
        .attr('class', 'ViewWrapper')
    }

    viewWrapper
      .attr('transform', 'translate(0,' + -dimensions.yOffset + ')')

    var energyTailContainer = viewWrapper.selectAll('.SongTimeline--energytailbox')

    if (energyTailContainer.empty()) {
      energyTailContainer = viewWrapper.append('g')
        .attr('class', 'SongTimeline--energytailbox')
    }

    energyTailContainer = viewWrapper.selectAll('.SongTimeline--energytailbox')

    var detailEnergyTails = energyTailContainer.selectAll('.SongTimeline--energytail')
      .data(data.versionsFilteredIn, (d) => d.versionId)

    detailEnergyTails.exit()
      .transition('SongSystem-render')
      .duration(500)
      .attr('points', EnergyTails.BaselinePoints)
      .style('opacity', 0)
      .remove()

    detailEnergyTails.transition('SongSystem-render')
      .duration(200)
      .attr('points', EnergyTails.ExtendedPoints)
      .style('opacity', 1)

    detailEnergyTails.enter().append('polygon')
      .attr('class', 'SongTimeline--energytail')
      .attr('points', EnergyTails.BaselinePoints)
      .transition('SongSystem-render')
      .delay(200)
      .duration(800)
      .attr('points', EnergyTails.ExtendedPoints)
      .style('opacity', 1)

    detailEnergyTails = energyTailContainer.selectAll('.SongTimeline--energytail')

    detailEnergyTails.attr('id', (d) => 'tlenergytail-' + d.versionId)

    var detailPlanetContainer = svgutil.acquire(viewWrapper, 'SongTimeline--planetbox', 'g')

    // new planets
    var detailPlanets = detailPlanetContainer.selectAll('.SongTimeline--planet')
        .data(data.versionsFilteredIn, (d) => d.versionId)

    detailPlanets.exit()
      .transition('SongSystem-render')
      .duration(500)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineBaseY))
      .style('opacity', 0)
      .remove()

    detailPlanets.transition('SongSystem-render')
      .duration(200)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineCY))
      .style('opacity', 1)

    detailPlanets.enter().append('g')
      .attr('class', 'SongTimeline--planet')
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineBaseY) + ' scale(0)')
      .transition('SongSystem-render')
      .duration(200)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineBaseY) + ' scale(1)')
      .style('opacity', 1)
      .transition('SongSystem-render')
      .duration(800)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineCY));

    detailPlanets = detailPlanetContainer.selectAll('.SongTimeline--planet')

    detailPlanets.attr('id', (d) => 'tlplanetgroup-' + d.versionId)
      .on('mouseenter', this.onPlanetMouseEnter.bind(this, state))
      .on('mouseleave', this.onPlanetMouseLeave);

    // render the shapes
    detailPlanets.call(DetailShapes);

    // detail overlay
    var detailData = state.get('detailOverlay'),
        detailLayer = svgutil.acquire(viewWrapper, 'SongTimeline--detaillayer', 'g');

    if (detailData) {
      detailLayer.datum(detailData)
        .call(DetailOverlay.render, dimensions.timelineXScale.range(), dimensions.yOffset)
    } else {
      detailLayer.call(DetailOverlay.deRender)
    }

    // star
    // viewWrapper.call(AxisStar, dimensions.baselineY)

    // axis
    viewWrapper.call(Axis, dimensions.baselineY, dimensions.timelineXScale.domain(), dimensions.timelineXScale.range(), data.versionsFilteredIn.map((d) => dimensions.timelineXScale(d.video_count)))
  },

  onPlanetMouseEnter(state, d) {
    if (d !== state.get('detailOverlay')) {
      ViewActions.hoverOnDetailVersion(d)
    }
  },

  onPlanetMouseLeave(d) {
    // pass
  },

  deRender(node, callback) {
    var d3Node = d3.select(node)

    var dimensions = d3Node.datum()

    d3Node.classed('MainView__detail', false)

    // cancel any incoming transition, if applicable
    d3Node.selectAll('.SongSystem--planet').interrupt().transition()

    var axisMarks = d3Node.selectAll('.SongTimelineAxis')

    axisMarks
      .interrupt('SongSystem-render')
      .transition('SongSystem-render') // cancels current and scheduled transitions

    axisMarks
      .transition('SongSystem-derender')
      .duration(500)
      .style('opacity', 0)
      .remove()

    var energyTails = d3Node.selectAll('.SongTimeline--energytail')

    energyTails
      .interrupt('SongSystem-render')
      .transition('SongSystem-render') // cancels current and scheduled transitions

    var trailT0 = energyTails
      .transition('SongSystem-derender')
      .duration(500)
      .attr('points', EnergyTails.BaselinePoints)
      .remove()

    var timelinePlanets = d3Node.selectAll('.SongTimeline--planet')

    timelinePlanets
      .interrupt('SongSystem-render')
      .transition('SongSystem-render') // cancels current and scheduled transitions

    var t0 = timelinePlanets
      .transition('SongSystem-derender')
      .duration(500)
      .attr('transform', (d) => svgutil.translateString(d.timelineCX, d.timelineBaseY))

    t0.transition('SongSystem-derender')
      .duration(200)
      .style('opacity', 0)
      .remove()
      .on('end', DataUtil.before(2, function() {
        callback()
      }))
  }

}

module.exports = DetailView
