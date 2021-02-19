import React from 'react';
import css from 'components/AppHeader/HeaderMenu.css';
import shareImage from '!file?name=[name].[ext]!assets/share_img.png';

import DropdownToggle from 'components/AppHeader/DropdownToggle';
import {TwitterShare, FacebookShare, PinterestShare} from 'components/AppHeader/ShareButtons';

var HeaderMenu = React.createClass({

  render() {
    const {aboutOpen, toggleAbout, isStacked, aboutShareOpen} = this.props;

    return (
      <div className={`${css.AppHeaderMenu}`} >
        {/* Modal Menus */}
        {(!isStacked || aboutShareOpen) &&
          <DropdownToggle open={aboutOpen} onClick={toggleAbout} >About</DropdownToggle>
        }
        {/* Share Stuff */}
        {(!isStacked || aboutShareOpen) &&
          <div className={`${css.appheadersharediv}`}>
            <TwitterShare
              text={'YouTube Trending – Exploring what is trending on YouTube.'}
              url={'https://github.com/Eros-L/youtube-trending'}
              via={'YouTube'}
            />
            <FacebookShare
              url={'https://github.com/Eros-L/youtube-trending'}
            />
            <PinterestShare
              media={location.href + shareImage}
              url={'https://github.com/Eros-L/youtube-trending'}
              description={'YouTube Trending – Exploring what is trending on YouTube.'}
            />
          </div>
        }
      </div>
    )
  }

});

module.exports = HeaderMenu;
