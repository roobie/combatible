(function() {
    "use strict";

    var BR = this.BR;

    function Tile(properties) {
        this.init(properties);
    };
    BR.T.Tile = Tile;

    Object.defineProperties(Tile.prototype, {
        init: {
            value: function(properties) {
                Object.defineProperties(this, {
                    position: {
                        value: properties.position
                    },
                    entities: {
                        value: []
                    }
                });
            }
        },
        draw: {
            value: function() {
                var p = this.position,
                    e = this.get_top_entity(),
                    r = (e ? e.representation : BR.E.DEFAULT_REPRESENTATION);
                BR.ui.display.draw(
                    p.x,
                    p.y,
                    r.glyph,
                    r.color.fg,
                    r.color.bg);
            }
        },
        lighten: {
            value: function(amount) {
                var contains_animates = !!this.entities.filter(function(e) {
                    return BR.E.Animate.prototype.isPrototypeOf(e);
                }).length;
                if (contains_animates) {
                    return;
                }
                // if (this.entities.length > 1) {
                //     // no need to hi light
                //     return;
                // }

                var p = this.position,
                    r = this.get_top_entity().representation,
                    fg = BR.colors.lighten(r.color.fg ||
                                           BR.DEFAULT_FOREGROUND, amount),
                    bg = BR.colors.lighten(r.color.bg ||
                                           BR.DEFAULT_BACKGROUND, amount);

                BR.ui.display.draw(
                    p.x,
                    p.y,
                    r.glyph,
                    fg,
                    bg);
            }
        },
        add: {
            value: function(entity) {
                if (this.has(entity)) {
                    return void 0;
                }
                this.entities.push.apply(this.entities, arguments);
                return true;
            }
        },
        remove: {
            value: function(entity) {
                if (!this.has(entity)) {
                    return void 0;
                }
                this.entities.splice(this.entities.indexOf(entity), 1);
                return true;
            }
        },
        has: {
            value: function(entity) {
                return this.entities.indexOf(entity) !== -1;
            }
        },
        is_walkable: {
            value: function() {
                return !this.entities.filter(function(e) {
                    return e.blocking;
                }).length;
            }
        },
        is_empty: {
            value: function() {
                return !!this.entities.reduce(function(out, e) {
                    return out && e.counts_as_empty;
                }, true);
            }
        },
        is_empty_except: {
            value: function(entity) {
                return this.entities.reduce(function(out, e) {
                    return out && (e.counts_as_empty || entity === e);
                }, true);
            }
        },
        contains_only_stackable_items: {
            value: function() {
                return this.entities.reduce(function(out, n) {
                    return out && n.stackable;
                }, true);
            }
        },
        get_top_entity: {
            value: function() {
                return this.entities.slice(-1)[0];
            }
        }
    });

}).call(this);
