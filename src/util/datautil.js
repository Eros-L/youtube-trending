'use strict';

var d3 = require('d3')
var raf = require('raf')

var Constants = require('Constants')

var countryNum = 0
var songNum = 0
var versionNum = 0

var monthDayYear = d3.timeParse('%B %e, %Y')
,   monthYear = d3.timeParse('%B %Y')
,   year = d3.timeParse('%Y')

function parseDate(dateString) {
  return monthDayYear(dateString) || monthYear(dateString) || year(dateString)
}

function baseBounds() {
  return [Infinity, -Infinity]
}

function adjustBounds(bounds, value) {
  bounds[0] = Math.min(bounds[0], value);
  bounds[1] = Math.max(bounds[1], value);
}

var DataUtil = {

  baseBounds() {
    return [Infinity, -Infinity]
  },

  getMinMax(series, accessor) {
    var minMax = this.baseBounds()
    series.forEach(function(item) {
      var value = accessor(item)
      minMax[0] = Math.min(minMax[0], value);
      minMax[1] = Math.max(minMax[1], value);
    })
    return minMax
  },

  countryId(countryData) {
    return 'country-' + (++countryNum)
  },

  songSystemId(songData) {
    // number of original works
    return 'song-' + (++songNum)
  },

  versionId(versionData) {
    // unknown
    return 'version-' + (++versionNum)
  },

  formatPercent(number) {
    number *= 100;
    let numStr = number.toString();
    let index = numStr.indexOf('.');
    return numStr.slice(0, index + 2) + '%'
  },

  formatProportion(x, y) {
    let number = x / y;
    let numStr = number.toString();
    let index = numStr.indexOf('.');
    return numStr.slice(0, index + 2);
  },

  formatUnit(number) {
    if (number / 1e6 > 1) {
      return this.formatProportion(number, 1e6) + "M";
    } else if (number / 1e3 > 1) {
      return this.formatProportion(number, 1e3) + "k";
    } else {
      return number;
    }
  },

  extend(obj) {
    Array.prototype.slice.call(arguments, 1).forEach((source) => {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          obj[prop] = source[prop]
        }
      }
    })
    return obj
  },

  // implementation Peter Gassner
  throttle(fn) {
    var busy;
    var context;
    var args;

    return function () {
      if (busy) {
        return;
      }
      busy = true;
      context = this;
      args = arguments;
      raf(function () {
        fn.apply(context, args);
        busy = false;
      });
    };
  },

  before(times, func) {
    var memo;
    // console.log(func)
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  },

  parseDate: parseDate,

  makeScaleSet(bounds) {
    // radius of orbit in galaxy view
    var orbitRadius = d3.scaleTime().domain([new Date(1929, 1, 1), new Date()]).range([4, Constants.SYSTEM_RADIUS])
    // size of dot in galaxy view
    ,   planetRadius = d3.scaleLinear().domain([0, 100]).range([3, 18])
    // color of genres
    ,   planetColor = d3.scaleOrdinal().domain(bounds.genres).range(['#4E79A7', '#A0CBE8', '#F28E2B', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#D7B5A6'])
        // rotation ranges from 270 to 450 degrees
    ,   rotation = d3.scaleLinear().domain([0, 1]).range([0, -90])
    ,   timelineRotation = d3.scaleLinear().domain([0, 1]).range([0, -360])
        // rotation ranges from 0 to 360 degrees
//  ,   rotation = d3.scale.linear().domain([0, 1]).range([0, 360])
    ,   speed = d3.scaleLinear().domain(bounds.energyRange).range([0.5 / 3200, 2.5 / 3200]) // time-based animation speed
//  ,   speed = d3.scale.linear().domain(bounds.energyRange).range([0.5 / 8, 2.5 / 8]) // frame-based animation speed
    ,   timelinePlanetRadius = d3.scaleLinear().domain([0, 100]).range([3, 50])
    ,   edgesScale = d3.scaleQuantize().domain(bounds.speechinessRange).range([-1, 8, 7, 6, 5, 4, 3]) // reverse scale
//  ,   edgesScale = d3.scale.quantize().domain(bounds.speechinessRange).range([9])
    ,   blinkScale = function(bpm) { return bpm * 2 * Math.PI / 60000 } // time-based animation speed (blink rate is equal to BPM)
//  ,   blinkScale = d3.scale.linear().domain(bounds.tempoRange).range([2 / 600, 14 / 600]) // time-based animation speed (old parameters)
//  ,   blinkScale = d3.scale.linear().domain(bounds.tempoRange).range([2 / 8, 14 / 8]) // frame-based animation speed

    return {
      getOrbitRadiusScale: () => orbitRadius,
      getRadiusScale: () => planetRadius,
      getColorScale: () => planetColor,
      getRotationScale: () => rotation,
      getSpeedScale: () => speed,
      getTimelineRadiusScale: () => timelinePlanetRadius,
      getEdgesScale: () => edgesScale,
      getTimelineRotation: () => timelineRotation,
      getBlinkScale: () => blinkScale
    }
  },

  findBounds(dataset) {
    var energy = baseBounds()
    ,   speechiness = baseBounds()
    ,   tempo = baseBounds()

    // dataset.forEach((songData) => {
    //   songData.versions.forEach((versionData) => {
    //     if (versionData.echonest) {
    //       adjustBounds(energy, versionData.echonest.energy)
    //       adjustBounds(speechiness, versionData.echonest.speechiness)
    //       adjustBounds(tempo, versionData.echonest.tempo)
    //     }
    //   })
    // })

    return {
      energyRange: energy,
      speechinessRange: speechiness,
      tempoRange: tempo,
      genres: ["Music", "Howto & Style", "Shows", "Trailers", "People & Blogs", "Pets & Animals", "Comedy", "News & Politics", "Autos & Vehicles", "Education", "Movies", "Film & Animation", "Nonprofits & Activism", "Gaming", "Science & Technology", "Sports", "Travel & Events", "Entertainment"]
    }
  },

  formatLegendData(n, type) {
    switch (type) {
      case 'popularity':
        return Math.round(n) + ' / 100'
      case 'tempo':
        return Math.round(n) + ' BPM'
      case 'valence':
        if (n < 0.2) return 'gloomy'
        if (n < 0.4) return 'downbeat'
        if (n < 0.6) return 'neutral'
        if (n < 0.8) return 'upbeat'
        if (n <= 1) return 'euphoric'
        break
      case 'energy':
        if (n < 0.2) return 'very low'
        if (n < 0.4) return 'low'
        if (n < 0.6) return 'medium'
        if (n < 0.8) return 'high'
        if (n <= 1) return 'very high'
        break
      case 'speechiness':
        if (n < 0.33) return 'low'
        if (n < 0.66) return 'medium'
        if (n <= 1) return 'high'
        break
    }
  }

}

module.exports = DataUtil
