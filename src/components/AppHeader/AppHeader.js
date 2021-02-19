'use strict';

var React = require('react')

import css from 'components/AppHeader/AppHeader.css';
import shareImage from '!file?name=[name].[ext]!assets/share_img.png';

var ViewActions = require('actions/ViewActions')
,   HeaderMenu = require('components/AppHeader/HeaderMenu')
,   GenreHeader = require('components/AppHeader/GenreHeader')
,   AboutPage = require('components/AppHeader/AboutPage')

var AppHeader = React.createClass({

  navigateBack() {
    ViewActions.navToMap()
  },

  toggleAbout() {
    if (this.props.dynamicState.get('aboutOpen')) {
      ViewActions.hideAbout()
    } else {
      ViewActions.showAbout()
    }
  },

  expandShare() {
    ViewActions.toggleShareExpand();
  },

  render() {
    var dynamicState = this.props.dynamicState
    ,   inDetail = dynamicState.get('inDetail')
    ,   aboutOpen = dynamicState.get('aboutOpen')
    ,   highlightedAttribute = dynamicState.get('highlightedAttribute')
    ,   aboutShareOpen = dynamicState.get('aboutShareOpen');


    let detailData, detailGenre;
    if ((detailData = dynamicState.get('detailOverlay')) || (detailData = dynamicState.get('hoveredGalaxySong'))) {
      detailGenre = detailData.genreName;
    }

    return (
      <div className='AppHeader' >
        <div className='AppHeader--navigation'>
          <div className='AppHeader--back' onClick={this.navigateBack} >
            {inDetail && 
              <div className={`${css.appheaderbackarrow} icon-arrow-back`} />
            }
            <h1 className='AppHeader--title' >YouTube Trending</h1>
          </div>
          {this.props.layout.stackedHeader &&
            <div className={`${css.AppHeaderAboutShareIcon} ${aboutShareOpen ? 'icon-close' : 'icon-dots-three-vertical'}`} onClick={this.expandShare}></div>
          }
          <HeaderMenu
            aboutOpen={aboutOpen}
            toggleAbout={this.toggleAbout}
            isStacked={this.props.layout.stackedHeader}
            aboutShareOpen={aboutShareOpen}
          />
        </div>
        <GenreHeader
          isVisible={!aboutOpen}
          genreCount={this.props.genreCount}
          detailGenre={detailGenre}
          genreList={this.props.genreList}
          headerWidth={this.props.layout.headerWidth}
          dynamicState={this.props.dynamicState}
          scales={this.props.scales} />
        <AboutPage
          isOpen={aboutOpen}
          layout={this.props.layout}
        />
      </div>
    )
  }

})

module.exports = AppHeader
