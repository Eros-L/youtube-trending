'use strict';

var Dispatcher = require('dispatcher/AppDispatcher')

var ViewActions = {

  hoverOnSongSystem(id) {
    Dispatcher.handleViewAction({
      type: 'HOVER_SYSTEM',
      systemId: id
    })
  },

  hoverOffSongSystem() {
    Dispatcher.handleViewAction({
      type: 'HOVER_OFF_SYSTEM'
    })
  },

  clickOnCountry(countryName) {
    Dispatcher.handleViewAction({
      type: 'SHOW_DETAIL',
      countryName: countryName
    })
  },

  clickOnSongSystem(id) {
    Dispatcher.handleViewAction({
      type: 'SHOW_DETAIL',
      systemId: id
    })
  },

  onCountryOver(countryName) {
    Dispatcher.handleViewAction({
      type: 'HOVER_COUNTRY',
      countryName: countryName
    })
  },

  onCountryOut() {
    Dispatcher.handleViewAction({
      type: 'HOVER_OFF_COUNTRY'
    })
  },

  navToMap() {
    Dispatcher.handleViewAction({
      type: 'SHOW_MAP'
    })
  },

  toggleShareExpand() {
    Dispatcher.handleViewAction({
      type: 'TOGGLE_SHARE_EXPAND'
    })
  },

  showLegend() {
    Dispatcher.handleViewAction({
      type: 'LEGEND_SHOW'
    })
  },

  hideLegend() {
    Dispatcher.handleViewAction({
      type: 'LEGEND_HIDE'
    })
  },

  hideAbout() {
    Dispatcher.handleViewAction({
      type: 'ABOUT_HIDE'
    })
  },

  showAbout() {
    Dispatcher.handleViewAction({
      type: 'ABOUT_SHOW'
    })
  },

  highlightAttribute(attributeName) {
    Dispatcher.handleViewAction({
      type: 'ATTRIBUTE_HIGHLIGHT',
      attributeToHighlight: attributeName
    })
  },

  registerGenreClick(genreName) {
    Dispatcher.handleViewAction({
      type: 'FILTER_GENRE',
      genre: genreName
    })
  },

  hoverOnDetailVersion(data) {
    Dispatcher.handleViewAction({
      type: 'HOVER_VERSION',
      versionData: data
    })
  },

  hoverOffDetailVersion() {
    Dispatcher.handleViewAction({
      type: 'HOVER_OFF_VERSION'
    })
  }

}

module.exports = ViewActions
