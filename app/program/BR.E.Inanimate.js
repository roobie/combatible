(function() {
    "use strict";

    var BR = this.BR;

    BR.E.Inanimate = function Inanimate(properties) {
        this.init(properties);
    };

    BR.E.Inanimate.prototype = Object.create(BR.E.Entity.prototype, {
        constructor: {
            value: BR.E.Inanimate
        },
        init: {
            value: function(properties) {
                properties = properties || {};
                BR.E.Entity.prototype.init.call(this, properties);
                this.blocking = properties.blocking;
                this.counts_as_empty = properties.counts_as_empty;
            }
        }
    });

    BR.mixin(BR.E.make, {
        water_source: function(properties) {
            return new BR.E.Inanimate(BR.mixin({
                names: [{ type: "name", value: "water" }],
                counts_as_empty: true,
                representation: {
                    glyph: "ξ",
                    color: {
                        fg: "#F0F8FF",
                        bg: "#0000FF"
                    }
                }
            }, properties));
        },
        mushrooms: function(properties) {
            return new BR.E.Inanimate(BR.mixin({
                names: [{ type: "name", value: "shrooms" }],
                counts_as_empty: true,
                representation: {
                    glyph: "τ",
                    color: {
                        fg: "#6A5ACD",
                        bg: "#111"
                    }
                }
            }, properties));
        },
        wall: function(properties) {
            return new BR.E.Inanimate(BR.mixin({
                names: [{ type: "name", value: "wall" }],
                blocking: true,
                representation: {
                    glyph: "#",
                    color: {
                        fg: "#222",
                        bg: "#111"
                    }
                }
            }, properties));
        },
        floor: function(properties) {
            return new BR.E.Inanimate(BR.mixin({
                names: [{ type: "name", value: "floor" }],
                blocking: false,
                counts_as_empty: true,
                representation: {
                    glyph: "·",
                    color: {
                        fg: "#555",
                        bg: "#111"
                    }
                }
            }, properties));
        },
    });

}).call(this);
