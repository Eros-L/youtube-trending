import * as d3 from "d3";
import * as topojson from 'topojson';

import css from 'components/MapView/MapView.css';
import svgutil from 'util/svgutil';
import ViewActions from "../../actions/ViewActions";

var MapView = {

  applyHexLayout(data, state, uiLayout) {
    if (data.length === 0) {
      return {
        layoutWidth: window.innerWidth,
        layoutHeight: window.innerHeight
      };
    } else {
      return {
        layoutWidth: window.innerWidth,
        layoutHeight: window.innerHeight + uiLayout.headerHeight
      };
    }
  },

  isActive(node) {
    return d3.select(node).classed('MainView__map')
  },

  render(node, data, state, dimensions, layout) {
    var d3Node = d3.select(node)

    d3Node
        .classed('MainView__map', true)
        .attr('width', dimensions.layoutWidth)
        .attr('height', dimensions.layoutHeight)

    d3Node.datum(dimensions)

    data = data.filter((d) => d.isInViewport)

    var viewWrapper = d3Node.selectAll('.ViewWrapper')

    if (viewWrapper.empty()) {
      viewWrapper = d3Node.append('g')
          .attr('class', 'ViewWrapper')
    }

    // DO NOT TRANSLATE THE VIEW WRAPPER - YOU WILL BREAK THE ANIMATION INTO THE DETAIL VIEW
    viewWrapper.attr('transform', `translate(0, 0)`)

    var countries = state.get('map');

    let hoveredCountry = state.get('hoveredCountry');
    let filteredGenre = state.get('filteredGenre');

    let colorScale = d3.interpolateRgb.gamma(4.8)("#CC8F91", "#B31217");
    let accumulation = state.get('accumulation');

    let projection = d3.geoMercator()
        .fitSize([window.innerWidth, window.innerHeight], countries);
    let path = d3.geoPath()
        .projection(projection);

    viewWrapper.append("g").attr("id", "area");
    viewWrapper.append("g").attr("id", "label");

    let mapPath = viewWrapper.select("#area").selectAll("path")
        .data(countries.features);

    mapPath.enter()
        .append("path")
        .attr("d", path)
        .attr("class", "CountryArea")
        .attr("id", (d) => "CountryArea" + d.id);

    mapPath.exit().remove();

    mapPath = viewWrapper.select("#area").selectAll("path");

    mapPath.attr("transform", (d) => svgutil.getScaleAndTranslate(1.2, 1, -0.1*window.innerWidth,1.1*(dimensions.layoutHeight-window.innerHeight)))
        .style("fill", function(d) {
          if (accumulation[d.properties.name] != null) {
            if (filteredGenre == null) {
              return colorScale((accumulation[d.properties.name]['Count'] - accumulation['Min']) / (accumulation['Max'] - accumulation['Min']));
            } else {
              return colorScale((accumulation[d.properties.name][filteredGenre] - accumulation[filteredGenre+'Min']) / (accumulation[filteredGenre+'Max'] - accumulation[filteredGenre+'Min']))
            }
          }
        })
        .style("opacity", function(d) {
          if (hoveredCountry == null || hoveredCountry === d.properties.name) {
            return 0.75;
          }
        })
        .style("cursor", function(d) {
          if (accumulation[d.properties.name] != null) {
            return 'pointer';
          }
        })
        .on("mouseenter", function(d) {
          if (accumulation[d.properties.name] != null) {
            let node = d3.select("#CountryLabel" + d.id);
            let count = accumulation[d.properties.name][filteredGenre ? filteredGenre : 'Count'];
            node.attr("transform", (d) => svgutil.translateString( 1.2*path.centroid(d)[0] - 0.1*window.innerWidth,path.centroid(d)[1] + 1.1*(dimensions.layoutHeight-window.innerHeight)))
                .style("display", "block");
            node.property("textContent", d.properties.name + "\n" + (count ? count : 0));
            ViewActions.onCountryOver(d.properties.name);
          }
        })
        .on("mouseleave", function(d) {
          d3.select("#CountryLabel" + d.id).style("display", "none");
          ViewActions.onCountryOut();
        })
        .on("click", function(d) {
          if (accumulation[d.properties.name] != null) {
              ViewActions.clickOnCountry(d.properties.name);
          }
        });

    let label = viewWrapper.select("#label").selectAll("text")
        .data(countries.features);

    label.enter()
        .append("text")
        .attr('class', 'CountryLabel')
        .attr('id', (d) => "CountryLabel" + d.id);

    label.exit().remove();

    label = viewWrapper.select("#label").selectAll("text");

    label.style("cursor", function(d) {
          if (accumulation[d.properties.name] != null) {
            return 'pointer';
          }
        })
        .on("mouseenter", function(d) {
          if (accumulation[d.properties.name] != null) {
            d3.select(this).style("display", "block");
            ViewActions.onCountryOver(d.properties.name);
          }
        })
        .on("mouseleave", function(d) {
          d3.select(this).style("display", "none");
          ViewActions.onCountryOut();
        })
        .on("click", function(d) {
          if (accumulation[d.properties.name] != null) {
            ViewActions.clickOnCountry(d.properties.name);
          }
        });

  }
}

module.exports = MapView
