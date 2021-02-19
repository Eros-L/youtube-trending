var Dispatcher = require('dispatcher/AppDispatcher')

var LoadActions = {
  initialLoad() {
    Dispatcher.handleDataAction({
      type: 'LOAD_COUNTRY_DATA'
    })
  },

  dataLoaded(map, data) {
    Dispatcher.handleDataAction({
      type: 'COUNTRIES_LOADED',
      map: map,
      data: data
    })
  }
}

module.exports = LoadActions
