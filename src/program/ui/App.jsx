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
      return {};
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
          <label>
            <input id="change_speed_input"
                   name="change_speed"
                   type="range"
                   min="10"
                   step="10"
                   max="1000"
                   defaultValue={1000 - config.frame_interval}
                   onChange={this.getHandlerFor('change_speed')} />
            {getHumanizedTime()}%
          </label>
          <code>
            <pre>{JSON.stringify(this.state, null, 2)}</pre>
          </code>
        </div>
      );
    }
  });

  React.render(<App />, document.getElementById('aux-view')); // jshint ignore:line

});
