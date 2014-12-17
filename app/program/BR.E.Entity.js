(function() {
    "use strict";

    var BR = this.BR;

    BR.E.Entity = function Entity(properties) {
        this.init(properties);
    };

    Object.defineProperties(BR.E.Entity, {
        get_next_hash_value: {
            value: (function() {
                var counter = parseInt("zz", 36);
                return function() {
                    return (++counter);
                };
            })()
        },
        make_type: {
            value: function(definition) {
                var name = definition.name;
                var sup = BR.E[definition.type.split(":")[1]].prototype;

                var Ctor = new Function(
                    "return function " + name  + "(properties) { this.init(properties); }")();

                Object.defineProperties(Ctor, {
                    definition: {
                        value: definition
                    }
                });

                Ctor.prototype = Object.create(sup, {
                    constructor: {
                        value: Ctor
                    },
                    init: {
                        value: function(properties) {
                            sup.init.call(this, properties);
                        }
                    }
                });

                return Ctor;
            }
        }
    });

    Object.defineProperties(BR.E.Entity.prototype, {
        init: {
            value: function(properties) {
                properties = properties || {};
                Object.defineProperties(this, {
                    $hash: {
                        value: BR.E.Entity.get_next_hash_value()
                    },
                    created_time: {
                        value: this.scheduler.getTime()
                    },
                    position: {
                        value: properties.position || new BR.T.Pos(0, 0, 0)
                    }
                });

                this.representation = properties.representation ||
                    (this.constructor.definition || {}).default_representation ||
                    BR.E.DEFAULT_REPRESENTATION;

                this.names = properties.names || [
                    { type: "name", value: "Unknown" }
                ];
            }
        },
        act: {
            value: function() {
                // default action is: just continue.
                this.scheduler.setDuration(this.speed);
                return {
                    then: function(done) {
                        return done();
                    }
                };
            }
        },
        draw: {
            value: function () {
                var p = this.position;
                var r = this.representation;
                BR.ui.display.draw(p.x, p.y, r.glyph, r.color.fg, r.color.bg);
            }
        },
        speed: {
            get: function() {
                return BR.E.DEFAULT_DURATION;
            }
        },
        move: {
            value: function(rel_pos) {
                BR.world.map.put_entity(this, (function() {
                    this.position.x += rel_pos.x;
                    this.position.y += rel_pos.y;
                }).bind(this));
            }
        },
        move_abs: {
            value: function(abs_pos) {
                BR.world.map.put_entity(this, (function() {
                    this.position.x = abs_pos.x;
                    this.position.y = abs_pos.y;
                }).bind(this));
            }
        },
        stackable: {
            get: function() {
                return false;
            }
        },
        can_move_to: {
            value: function(pos) {
                var tile = BR.world.map[pos];
                return tile &&
                    tile.is_walkable() &&
                    (tile.is_empty() || tile.contains_only_stackable_items());
            }
        },
        can_move_to_when_stackable: {
            value: function(pos) {
                var tile = BR.world.map[pos];
                return tile &&
                    tile.is_walkable();
                    //&& tile.contains_only_stackable_items();
            }
        },
        can_walk_on: {
            value: function(pos) {
                var tile = BR.world.map[pos];
                return tile && tile.is_walkable();
            }
        },
        scheduler: {
            get: function() {
                return BR.engine._scheduler;
            }
        }
    });

}).call(this);
