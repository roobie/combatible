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

  var App = React.createClass({
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
        <div>
          <div>FPS: {this.state.meta.fps}</div>
          <div>Average FPS: {this.state.meta.avg_fps}</div>
          <div>Engine time: {this.state.meta.engine.time}</div>

          {Object.keys(this.state.entities).map((function(key, index) {
            return (
              <div key={index}>
                <span>
                  {this.state.entities[key].repr.glyph}@
                  {this.state.entities[key].pos.x}:
                       {this.state.entities[key].pos.y}
                </span>
              <span> speed:{this.state.entities[key].speed.toFixed(2)}</span>
              <span> moves:{this.state.entities[key].moved_count}</span>
              </div>
            );
          }).bind(this))}
        </div>
      );
    }
  });

  // <code>
  //   <pre>{JSON.stringify(this.state, null, 2)}</pre>
  // </code>


  React.render(<App />, document.getElementById('aux-view')); // jshint ignore:line

});
