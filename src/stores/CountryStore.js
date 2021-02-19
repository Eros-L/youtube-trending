'use strict';

var AppDispatcher = require('dispatcher/AppDispatcher')
    ,   reqwest = require('reqwest')
    ,   {EventEmitter} = require('events')
    ,   LoadActions = require('actions/LoadActions')
    ,   Immutable = require('immutable')

var Constants = require('Constants')
    ,   DataUtil = require('util/datautil')

var setState = (key, value) => { state = state.set(key, value) }
var setStateObj = (obj) => { for (var key in obj) setState(key, obj[key]) }

var state = Immutable.Map()

// properties should all be mutable objects
setStateObj({
    map: {},
    countries: [],
    detailCountryData: {},
    scales: null,
    accumulation: {},
    allGenresCount: {},
    displayObjects: [],
    hoveredCountry: null,
    inMap: true,
    inDetail: false,
    aboutOpen: false,
    aboutShareOpen: false,
    highlightedAttribute: null,
    filteredGenre: null,
    genreList: [],
    detailOverlay: null,
})

var CountryStore = DataUtil.extend({}, EventEmitter.prototype, {

    getState() {
        return state
    },

    emitChange() {
        this.emit('change')
    },

    onChange(handler) {
        this.on('change', handler)
    },

    removeChangeHandler(handler) {
        this.removeListener('change', handler)
    },

    getDetailCountryData() {
        return state.get('detailCountryData')
    },

    getScales() {
        return state.get('scales')
    },

    getDisplayObjects() {
        return state.get('displayObjects')
    },

    getGenreCount() {
        if (!state.get('inDetail')) {
            return state.get('allGenresCount')
        } else {
            return this.getDetailGenreCount()
        }
    },

    getGenreList() {
        return state.get('genreList')
    },

    getDetailGenreCount() {
        let countryName = state.get('detailCountryData').countryName;
        let accumulation = state.get('accumulation');

        let memo = {};
        for (let genreName in accumulation[countryName]) {
            memo[genreName] = accumulation[countryName][genreName];
        }
        delete memo['Count'];

        return memo;
    },

    setHoveredSystem(id) {
        setState('hoveredSystemId', id)
    },

    setHoveredCountry(countryName) {
        setState('hoveredCountry', countryName);
        let accumulation = state.get('accumulation');

        let allGenresCounter = {};
        if (countryName == null) {
            for (let key in accumulation) {
                if (typeof (accumulation[key]) != "number") {
                    for (let genre in accumulation[key]) {
                        if (allGenresCounter[genre] == null) {
                            allGenresCounter[genre] = accumulation[key][genre];
                        } else {
                            allGenresCounter[genre] += accumulation[key][genre];
                        }
                    }
                }
            }
            delete allGenresCounter['Count'];
        } else {
            for (let genre in accumulation[countryName]) {
                allGenresCounter[genre] = accumulation[countryName][genre];
            }
            delete allGenresCounter['Count'];
        }

        setState('allGenresCount', allGenresCounter);
    },

    setHoveredGalaxySong(datum, node) {
        setStateObj({
            hoveredGalaxySong: datum,
            hoveredGalaxySongNode: node
        });
    },

    showDetail(countryName) {
        var selectedCountry = state.get('displayObjects').filter((CountryData) => CountryData.countryName === countryName )[0] || {}
        setStateObj({
            detailCountryData: selectedCountry,
            inDetail: true,
            inMap: false
        })
    },

    showMap() {
        this.setHoveredCountry(null);
        setStateObj({
            detailCountryData: {},
            inDetail: false,
            inMap: true
        })
    },

    navMenuToggle(optionName, isOpen) {
        // toggling any of the three automatically closes the other two
        var optionProps = {
            aboutOpen: false
        }
        optionProps[optionName] = isOpen
        setStateObj(optionProps)
    },

    aboutShareToggle() {
        console.log(state.get('aboutShareOpen'));
        setStateObj({
            aboutShareOpen: !state.get('aboutShareOpen'),
            aboutOpen: false
        });
    },

    toggleFilteredGenre(genre) {
        if (state.get('filteredGenre') === genre) genre = null
        setState('filteredGenre', genre)
    },

    showDetailOverlay(data) {
        if (data !== state.get('detailOverlay')) {
            setState('detailOverlay', data)
        }
    },

    hideDetailOverlay() {
        setState('detailOverlay', null)
    },

    handleAction(payload) {
        var {action} = payload

        switch (action.type) {
            // load/network events
            case 'LOAD_COUNTRY_DATA':
                loadCountries()
                break
            case 'COUNTRIES_LOADED':
                processLoadedData(action.map, action.data)
                break
            // view actions
            case 'SHOW_DETAIL':
                this.showDetail(action.countryName)
                break
            case 'SHOW_MAP':
                this.showMap()
                break
            case 'HOVER_SYSTEM':
                this.setHoveredSystem(action.systemId)
                break
            case 'HOVER_OFF_SYSTEM':
                this.setHoveredSystem(null)
                break
            case 'HOVER_COUNTRY':
                this.setHoveredCountry(action.countryName)
                break
            case 'HOVER_OFF_COUNTRY':
                this.setHoveredCountry(null)
                break
            case 'HOVER_GALAXY_SONG':
                this.setHoveredGalaxySong(action.datum, action.node);
                break;
            case 'HOVER_OFF_GALAXY_SONG':
                this.setHoveredGalaxySong(null, null);
                break;
            case 'LEGEND_SHOW':
                this.navMenuToggle('legendOpen', true)
                break
            case 'LEGEND_HIDE':
                this.navMenuToggle('legendOpen', false)
                break
            case 'ABOUT_HIDE':
                this.navMenuToggle('aboutOpen', false)
                break
            case 'ABOUT_SHOW':
                this.navMenuToggle('aboutOpen', true)
                break
            case 'TOGGLE_SHARE_EXPAND':
                this.aboutShareToggle();
                break
            case 'ATTRIBUTE_HIGHLIGHT':
                break // TODO: This line deactivates the effect of clicking on a legend item
                if (state.get('highlightedAttribute') === action.attributeToHighlight) {
                    setState('highlightedAttribute', null)
                } else {
                    setState('highlightedAttribute', action.attributeToHighlight)
                }
                break
            case 'FILTER_GENRE':
                this.toggleFilteredGenre(action.genre)
                break
            case 'HOVER_VERSION':
                this.showDetailOverlay(action.versionData)
                break
            case 'HOVER_OFF_VERSION':
                this.hideDetailOverlay()
                break
        }

        this.emitChange()
    }

})

CountryStore.dispatcherToken = AppDispatcher.register(CountryStore.handleAction.bind(CountryStore))

function loadCountries() {
    reqwest({
        url: "data/out/world-110m.geojson",
        type: 'json',
        contentType: 'application/json',
        success: (map) => {
            reqwest({
                url: Constants.DATA_URL,
                type: 'json',
                contentType: 'application/json',
                success: (data) => {
                    LoadActions.dataLoaded(map, data);
                }
            })
        }
    })
}

function processLoadedData(map, dataset) {
    var accumulation = {'Min': Infinity, 'Max': 0};
    dataset.forEach((countryData) => {
        let countryName = countryData.country;
        accumulation[countryName] = {};
        countryData.genres.forEach((genresData) => {
            let genreName = genresData.genre;
            accumulation[countryName][genreName] = 0;
            genresData.dates.forEach((dateData) => {
                accumulation[countryName][genreName] += parseInt(dateData.video_count);
            })
            if (!accumulation[genreName+'Max']) accumulation[genreName+'Max'] = 0;
            if (!accumulation[genreName+'Min']) accumulation[genreName+'Min'] = Infinity;
            accumulation[genreName+'Min'] = Math.min(accumulation[genreName+'Min'], accumulation[countryName][genreName]);
            accumulation[genreName+'Max'] = Math.max(accumulation[genreName+'Max'], accumulation[countryName][genreName]);
        });
        accumulation[countryName]['Count'] = Object.values(accumulation[countryName]).reduce((a,b)=>a+b);
        accumulation['Min'] = Math.min(accumulation['Min'], accumulation[countryName]['Count']);
        accumulation['Max'] = Math.max(accumulation['Max'], accumulation[countryName]['Count']);
    });

    var allGenresCounter = {};
    for (let key in accumulation) {
        if (typeof (accumulation[key]) != "number") {
            for (let genre in accumulation[key]) {
                if (allGenresCounter[genre] == null) {
                    allGenresCounter[genre] = accumulation[key][genre];
                } else {
                    allGenresCounter[genre] += accumulation[key][genre];
                }
            }
        }
    }
    delete allGenresCounter['Count'];

    setState('map', map);
    setState('countries', dataset)
    var scaleset = DataUtil.makeScaleSet(DataUtil.findBounds(dataset))
    setState('scales', scaleset)
    setState('accumulation', accumulation)
    setState('allGenresCount', allGenresCounter)
    setState('genreList', scaleset.getColorScale().domain())
    // to be modified
    var displayObjects = dataset.map((countryData) => {
        return {
            countryName: countryData.country,
            countryId: countryData.country,
            systemIsHovered: false,
            versionsFilteredIn: [],
            isInViewport: true,
            genres: countryData.genres.map((genresData) => {
                let video_count = 0,
                    views = 0,
                    likes = 0,
                    dislikes = 0,
                    comment_count = 0;
                genresData.dates.forEach((dateData) => {
                    video_count += parseInt(dateData.video_count);
                    views += parseInt(dateData.views);
                    likes += parseInt(dateData.likes);
                    dislikes += parseInt(dateData.dislikes);
                    comment_count += parseInt(dateData.comment_count);
                });
                return {
                    versionId: DataUtil.versionId(null),
                    countryId: countryData.country,
                    genreName: genresData.genre,
                    pauseAnimation: false,
                    animationTime: Math.random() * 10000,
                    genreColor: scaleset.getColorScale()(genresData.genre),
                    timelinePlanetRadius: scaleset.getTimelineRadiusScale()(comment_count),
                    timelineRotation: scaleset.getTimelineRotation()(dislikes / (likes + dislikes)),
                    video_count: video_count,
                    views: views,
                    likes: likes,
                    dislikes: dislikes,
                    comment_count: comment_count,
                    dates: genresData.dates.map((dateData) => {
                        return {
                            video_count: dateData.video_count,
                            views: dateData.views,
                            likes: dateData.likes,
                            dislikes: dateData.dislikes,
                            comment_count: dateData.comment_count
                        }
                    })
                }
            })
        }
    })
    setState('displayObjects', displayObjects)
}

module.exports = CountryStore
