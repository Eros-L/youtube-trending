'use strict';

var React = require('react')
,   Immutable = require('immutable')

require('assets/icomoon/style.css')
require('components/App/App.css')

var LoadActions = require('actions/LoadActions')
,   CountryStore = require('stores/CountryStore')
,   AppHeader = require('components/AppHeader/AppHeader')
,   DetailHeader = require('components/DetailView/DetailHeader')
,   MainView = require('components/MainView/MainView')
,   Layout = require('components/Layout')
,   DataUtil = require('util/datautil')

function sizesEqual(size1, size2) {
  if (size1 === size2) {
    return true
  } else if (size1 && size2) {
    return size1[0] === size2[0] && size1[1] === size2[1]
  }
}

var App = React.createClass({

  getInitialState() {
    return {
      appState: CountryStore.getState(),
      scrollY: window.pageYOffset,
      windowSize: this.getWindowSize()
    }
  },

  getWindowSize() {
    return [window.innerWidth, window.innerHeight];
  },

  handleChange() {
    this.setState({
      appState: CountryStore.getState()
    })
  },

  setViewportScroll() {
    if (!this.state.appState.get('inDetail')) {
      this.setState({
        scrollY: window.pageYOffset
      })
    }
  },

  onWindowResize() {
    this.setState({
      windowSize: this.getWindowSize()
    })
  },

  componentDidMount() {
    CountryStore.onChange(this.handleChange)
    LoadActions.initialLoad()

    window.addEventListener('scroll', DataUtil.throttle(this.setViewportScroll))
    window.addEventListener('resize', this.onWindowResize);
  },

  componentWillUnmount() {
    CountryStore.removeChangeHandler(this.handleChange)
  },

  render() {
    var displayObjects = CountryStore.getDisplayObjects()
    ,   detailData = CountryStore.getDetailCountryData()
    ,   galaxyScales = CountryStore.getScales()
    ,   state = this.state.appState
    ,   scrollY = this.state.scrollY
    ,   genreCount = CountryStore.getGenreCount()
    ,   genreList = CountryStore.getGenreList()
    ,   componentLayout = Layout.getLayout(this.state.windowSize)

    return (
      <div className="AppBox">
        <AppHeader genreCount={genreCount} genreList={genreList} scales={galaxyScales} dynamicState={state} layout={componentLayout} windowSize={this.state.windowSize} />
        {state.get('inDetail') ? <DetailHeader countryData={detailData} state={state} layout={componentLayout} /> : null}
        <MainView displayObjects={displayObjects} dynamicState={state} scrollY={scrollY} layout={componentLayout} />
      </div>
    )
  }

})

module.exports = App
