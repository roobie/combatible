(function() {
    "use strict";

    var BR = this.BR;

    function Pos(x, y) {
        this.init(x, y);
    };
    BR.T.Pos = Pos;

    Object.defineProperties(Pos, {
        parse: {
            value: function(position_string) {
                /// Functional version
                // var v = position_string.split(",").map(function(c) {
                //     return parseInt(c, 10);
                // });
                // return new Pos(v[0], v[1]);

                // Unrolled version:
                var parts = position_string.split(",");

                return new Pos(
                    parseInt(parts[0], 10),
                    parseInt(parts[1], 10));
            }
        }
    });

    Object.defineProperties(Pos.prototype, {
        init: {
            value: function(x, y) {
                this.x = x;
                this.y = y;
            }
        },
        copy: {
            value: function() {
                return new Pos(this.x, this.y);
            }
        },
        eq: {
            value: function(other_pos) {
                return this.x === other_pos.x &&
                    this.y === other_pos.y;
            }
        },
        toString: {
            value: function() {
                return [
                    this.x,
                    ",", this.y
                ].join("");
            }
        }
    });

}).call(this);
