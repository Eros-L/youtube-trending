'use strict';
import * as d3 from "d3";

var React = require('react')

require('components/DetailView/DetailHeader.css')

var DetailHeader = React.createClass({

  getCountryInfoString(countryInfo) {
    let videoCount = 0,
        viewCount = 0;
    countryInfo.forEach((genresData) => {
      videoCount += genresData.video_count;
      viewCount += genresData.views;
    });
    return videoCount + ' videos / ' + viewCount + ' views';
  },

  render() {
    var style = {
      top: this.props.layout.tlHeader
    }

    var detailData, CountryInfoString
    if (detailData = this.props.state.get('detailOverlay')) {
      CountryInfoString = this.props.state.get('detailOverlay').video_count + ' videos / ' + this.props.state.get('detailOverlay').genreName
    } else {
      CountryInfoString = this.getCountryInfoString(this.props.countryData.genres)
    }

    return (
      <div className="DetailTitle" style={style} >
        <h2 className="DetailTitle--title">{this.props.countryData.countryName}</h2>
        <h3 className="DetailTitle--info">{CountryInfoString}</h3>
      </div>
    )
  }

})

module.exports = DetailHeader
