var React = require("react");

var HelloWidget = React.createClass({
    render: function () {
        return "<div>Hello {this.props.name}</div>";
    }
});

module.exports = HelloWidget;