'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

require('components/AppHeader/AboutPage.css')

var ComponentName = React.createClass({

  render() {
    const style = {
      transform: this.props.isOpen ? 'translateY(0%)' : 'translateY(-100%)',
      top: this.props.isOpen ? '100%' : '0',
      maxHeight: window.innerHeight - this.props.layout.titleHeight
    };

    return (
      <div className={'AboutPage' + (this.props.isOpen ? '' : ' AboutPage--closed')} style={style}>
        <div className='AboutPage__wrapper'>
          <h2>YouTube Trending</h2>
          <h3>Exploring what is trending on YouTube.</h3>

          <h4>About the Project</h4>
          <p>YouTube Trending is created by: CHEN, Chen; HONG, Seoyoung; LAU, Kwan Yuen; TANG, Huimin.</p>

          <h4>Sources</h4>
          <p>The dataset that drives this application is retrieved from the following sources:</p>
          <ul>
            <li><a href="https://www.kaggle.com/datasnaek/youtube-new/">Trending YouTube Video Statistics</a>: Daily statistics for trending YouTube videos.</li>
          </ul>

          <h4>Technology</h4>
          <p>The visualization is hand crafted with standard web technologies HTML, CSS, JavaScript using open source software including D3, React, Webpack among others.</p>

          <h4>Credits</h4>
          <p>YouTube Trending is adapted from a visualization created by <a href="https://www.interactivethings.com/">Interactive Things</a>.</p>
        </div>
      </div>
    )
  }

})

module.exports = ComponentName
