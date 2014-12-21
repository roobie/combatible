/**
 * @jsx React.DOM
 */

'use strict';

define([
  'config',
  'data/log',

  'lib/react',
  'lib/radio'
], function (config, log, React, radio) {

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
          config.frame_interval = 11 - event.target.value;
        }
      }[what];
    },
    getRepr: function(entity) {
      var getStyle = function () {
        return {
          color: entity.repr.color.fg,
          backgroundColor: entity.repr.color.bg
        }
      }
      return (
        React.createElement("span", {style: getStyle()}, 
          entity.repr.glyph
        )
      )
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
          React.createElement("label", null, 
            React.createElement("input", {id: "change_speed_input", 
                   name: "change_speed", 
                   type: "range", 
                   min: "1", 
                   step: "1", 
                   max: "10", 
                   defaultValue: 11 - config.frame_interval, 
                   onChange: this.getHandlerFor('change_speed')}), 
            11 - config.frame_interval
          ), 
          React.createElement("div", null, "FPS: ", this.state.meta.fps), 
          React.createElement("div", null, "Average FPS: ", this.state.meta.avg_fps), 
          React.createElement("div", null, "Engine time: ", this.state.meta.engine.time), 

          Object.keys(this.state.entities).map((function(key, index) {
            return (
              React.createElement("div", {key: index}, 
                React.createElement("span", null, 
                  this.getRepr(this.state.entities[key]), "@[", 
                  this.state.entities[key].pos.x.toString().lpad(), ":", 
                  this.state.entities[key].pos.y.toString().lpad(), "]"
                )
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
