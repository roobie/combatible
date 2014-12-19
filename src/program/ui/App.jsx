/**
 * @jsx React.DOM
 */

'use strict';

define([
  'lib/react',

  'lib/radio'
], function (React, radio) {

  var App = React.createClass({
    getInitialState: function () {
      return {};
    },
    dataChanged: function (data) {
      this.setState(data);
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
          <code>
            <pre>{JSON.stringify(this.state, null, 2)}</pre>
          </code>
        </div>
      );
    }
  });

  React.render(<App />, document.getElementById('aux-view')); // jshint ignore:line

});
