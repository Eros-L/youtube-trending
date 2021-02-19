import React from 'react';
import ReactDOM from 'react-dom';

import '!file?name=[path][name].[ext]!../data/out/country_data.json';
import '!file?name=[path][name].[ext]!../data/out/world-110m.geojson';

var App = require('components/App/App');

ReactDOM.render(<App />, document.getElementById('main'));

if (__DEV__) {
  window.React = React;
}
