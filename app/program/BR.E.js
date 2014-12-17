(function() {
    "use strict";

    var BR = this.BR;
    BR.E = Object.create(null);

    var MS = 1000;
    Object.defineProperties(BR.E, {
        DEFAULT_DURATION: {
            value: 10 * MS
        },
        DEFAULT_REPRESENTATION: {
            value: {
                glyph: "·",
                color: {
                    fg: "#ccc",
                    bg: "#111"
                }
            }
        },
        sex: {
            value: BR.mixin(Object.create(null), {
                male: "♂",
                female: "♀"
            })
        },
        make: {
            value: Object.create(null)
        }
    });

}).call(this);
