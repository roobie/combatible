(function() {
    "use strict";

    var BR = this.BR;

    function World(properties) {
        this.init(properties);
    };
    BR.T.World = World;

    Object.defineProperties(World.prototype, {
        init: {
            value: function(properties) {
                // TODO: Validation
                Object.defineProperties(this, {
                    maps: {
                        value: properties.maps ||
                            [ // dim x
                                [ // dim y
                                    [ // dim z
                                    ]
                                ]
                            ]
                    }
                });
            }
        },
        get_current_map: {
            value: function() {
                return this.maps[0][0][0];
            }
        },
        add_map: {
            value: function(map) {
                this.maps[0][0][0] = map;
            }
        }
    });
}).call(this);
