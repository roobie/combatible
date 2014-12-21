/**
 * @jsx React.DOM
 */

'use strict';

define([
  'config',

  'lib/react',
  'lib/radio'
], function (config, React, radio) {

  var getHumanizedTime = function() {
    return (1000 - config.frame_interval) / 10;
  }

  var App = React.createClass({displayName: "App",
    getInitialState: function () {
      return {
        meta: {
          engine: {}
        },
        entities: {}
      };
    },
    dataChanged: function (data) {
      this.setState(data);
    },
    getHandlerFor: function(what) {
      return {
        'change_speed': function(event) {
          config.frame_interval = 1000 - parseInt(event.target.value, 10);
        }
      }[what];
    },

    componentDidMount: function () {
      radio('data_changed').subscribe([this.dataChanged, this]);
    },
    componentWillUnmount: function () {
      radio('data_changed').unsubscribe(this.dataChanged);
    },
    render: function () {
      return (
        React.createElement("div", null, 
          React.createElement("div", null, "FPS: ", this.state.meta.fps), 
          React.createElement("div", null, "Average FPS: ", this.state.meta.avg_fps), 
          React.createElement("div", null, "Engine time: ", this.state.meta.engine.time), 

          Object.keys(this.state.entities).map((function(key, index) {
            return (
              React.createElement("div", {key: index}, 
                React.createElement("span", null, 
                  this.state.entities[key].repr.glyph, "@", 
                  this.state.entities[key].pos.x, ":", 
                       this.state.entities[key].pos.y
                ), 
              React.createElement("span", null, " speed:", this.state.entities[key].speed.toFixed(2)), 
              React.createElement("span", null, " moves:", this.state.entities[key].moved_count)
              )
            );
          }).bind(this))
        )
      );
    }
  });

  // <code>
  //   <pre>{JSON.stringify(this.state, null, 2)}</pre>
  // </code>


  React.render(React.createElement(App, null), document.getElementById('aux-view')); // jshint ignore:line

});
