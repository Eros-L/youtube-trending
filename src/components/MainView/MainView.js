'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from "d3";

var ViewFilters = require('util/ViewFilters')
,   MapView = require('components/MapView/MapView')
,   DetailView = require('components/DetailView/DetailView')
,   Constants = require('Constants')
,   AnimationUtil = require('util/AnimationUtil')

var MainView = React.createClass({

  componentDidMount() {
    var node = ReactDOM.findDOMNode(this)
    ViewFilters.renderFilters(node)

    var d3Node = d3.select(node)
    var prevTime = 0
    d3.timer((time) => {
      if (this.props.dynamicState.get('inDetail')) return

      d3Node.selectAll('.SongSystem--planet')
        .filter((d) => !d.pauseAnimation)
        .each((d) => { d.animationTime += (time - prevTime) })
        .attr('transform', (d) => AnimationUtil.planetPosition(d, d.animationTime))
        .attr('opacity', (d) => AnimationUtil.planetOpacity(d.blinkSpeed, d.animationTime))

      prevTime = time
    })
  },

  componentDidUpdate() {
    var data = this.props.displayObjects
    ,   state = this.props.dynamicState
    ,   node = ReactDOM.findDOMNode(this)
    ,   genreFilter = state.get('filteredGenre')

    if (state.get('inMap')) {
      if (!data.length) return true

      var dimensions = MapView.applyHexLayout(data, state, this.props.layout)

      if (DetailView.isActive(node)) {
        var oldScrollPos = this.props.scrollY
        DetailView.deRender(node, () => {
          MapView.render(node, data, state, dimensions, this.props.layout);
          window.scrollTo(0, oldScrollPos)
        });
      } else if (MapView.isActive(node)) {
        MapView.render(node, data, state, dimensions, this.props.layout);
      } else {
        // in transition between views, do weird hacks
        DetailView.deRender(node, () => {})
        MapView.render(node, data, state, dimensions, this.props.layout);
        window.scrollTo(0, oldScrollPos)
      }

    } else if (state.get('inDetail')) {
      var detailData = state.get('detailCountryData')
      ,   dimensions = DetailView.applyDetailLayout(detailData, state, this.props.layout, this.props.scrollY) // this mutates detailData using the layout

      detailData.versionsFilteredIn = detailData.genres.filter((genreData) => !genreFilter || genreFilter === genreData.genreName)

      if (MapView.isActive(node)) {
        DetailView.transitionIn(node, detailData, state, dimensions, () => {
          DetailView.render(node, detailData, state, dimensions)
        });
      } else if (DetailView.isActive(node)) {
        DetailView.render(node, detailData, state, dimensions)
      } else {
        // in transition, do some weird hack to make sure view is correct
        DetailView.render(node, detailData, state, dimensions)
      }
    }

  },

  render() {
    return (
      <svg className="MainView" key="dontreplace" />
    )
  }

})

module.exports = MainView
