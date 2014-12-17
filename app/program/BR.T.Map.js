(function() {
    "use strict";

    var BR = this.BR,
        ROT = this.ROT;

    function Map(properties) {
        this.init(properties);
    }
    BR.T.Map = Map;

    Object.defineProperties(BR.T.Map.prototype, {
        init: {
            value: function(properties) {
                BR.make_interval(this, 25, function() {
                    var cs = this.get_free_cells(),
                        i, c, index;

                    for (i = 0; i < 3; i++) {
                        index = Math.floor(ROT.RNG.getUniform() * cs.length);
                        c = cs.splice(index, 1)[0];
                        BR.add_entity(true, BR.E.make.mushrooms({
                            position: c.position
                        }));
                    }
                }, 300);
                return properties;
            }
        },
        remove_entity: {
            value: function (entity) {
                return this[entity.position].remove(entity);
            }
        },
        add_entity: {
            value: function (entity) {
                if (!this[entity.position]) {
                    throw new Error("Out of bounds!");
                }
                return this[entity.position].add(entity);
            }
        },
        put_entity: {
            value: function (entity, update_position) {
                this.remove_entity(entity);
                try {
                    update_position();
                //} finally {
                } catch (e) {
                }
                this.add_entity(entity);
            }
        },
        get_free_cells: {
            value: function() {
                var k, cs = [];
                for (k in this) {
                    if (this[k].is_empty()) {
                        cs.push(this[k]);
                    }
                }

                return cs;
            }
        },
        generate: {
            value: function (dont_populate) {
                var self = this;
                var opts = BR.ui.display.getOptions();
                var free_cells = [];

                // var x, y;
                // for (x = 0; x < opts.width; x++) {
                //     for (y = 0; y < opts.height; y++) {
                //         var p = new BR.T.Pos(x, y);
                //         this[p] = new BR.T.Tile({
                //             position: p
                //         });
                //         free_cells.push(p);
                //         this[p].add(BR.E.make.floor({
                //             position: p
                //         }));
                //     }
                // }
                // var map_creator = new ROT.Map.Digger(opts.width, opts.height, {
                //     dugPercentage: 0.5
                // });
                var map_creator = new ROT.Map.Cellular(opts.width,
                                                       opts.height);
                map_creator.randomize(0.42);
                // var map_creator = new ROT.Map.EllerMaze(opts.width,
                //                                         opts.height);
                var dig = function(x, y, value) {
                    var p = new BR.T.Pos(x, y);
                    this[p] = new BR.T.Tile({
                        position: p
                    });
                    if (value) {
                        this[p].add(BR.E.make.wall({
                            position: p
                        }));
                    } else {
                        free_cells.push(p);
                        this[p].add(BR.E.make.floor({
                            position: p
                        }));
                    }
                };

                map_creator.create(dig.bind(this));


                var lightPasses = function(x, y) {
                    var key = new BR.T.Pos(x, y);
                    if (self[key]) {
                        return self[key].is_empty();
                    }
                    return false;
                };

                Object.defineProperties(this, {
                    fov: {
                        value: new ROT.FOV.RecursiveShadowcasting(lightPasses)
                    },
                    foh: {
                        value: new ROT.FOV.PreciseShadowcasting(lightPasses)
                    }
                });

                if (!dont_populate) {
                    this.populate(free_cells);
                }
            }
        },
        populate: {
            value: function(free_cells) {
                var i, index, pos;
                var make_actor = BR.make_actor = function (pos, i, race) {
                    return new BR.E.Animate(race === "human" ? {
                        position: pos,
                        representation: {
                            glyph: "@",
                            color: {
                                fg: [
                                    "#2E8B57",
                                    "#7FFF00"
                                ][Number(i % 2 === 0)]
                            }
                        },
                        sex: i % 2 === 0 ? BR.E.sex.male : BR.E.sex.female,
                        race: "human"
                    } : {
                        position: pos,
                        representation: {
                            glyph: "λ",
                            color: {
                                fg: [
                                    "#DC143C",
                                    "#FA8072"
                                ][Number(i % 2 === 0)]
                            }
                        },
                        sex: i % 2 === 0 ? BR.E.sex.male : BR.E.sex.female,
                        race: "orch"
                    });
                };
                var get_free_pos = function() {
                    index = Math.floor(ROT.RNG.getUniform() * free_cells.length);
                    return free_cells.splice(index, 1)[0];
                };

                // for (i = 0; i < 10; i++) {
                //     pos = get_free_pos();
                //     BR.add_entity(true, make_actor(pos, i, "human"));

                //     pos = get_free_pos();
                //     BR.add_entity(true, make_actor(pos, i, null));
                // }

                // for (i = 0; i < 10; i++) {
                //     pos = get_free_pos();
                //     BR.add_entity(true, BR.E.make.water_source({
                //         position: pos
                //     }));

                //     pos = get_free_pos();
                //     BR.add_entity(true, BR.E.make.mushrooms({
                //         position: pos
                //     }));
                // }
            }
        },
        draw_all: {
            value: function() {
                var key, e, p, r;
                for (key in this) {
                    p = BR.T.Pos.parse(key);
                    e = this[p].get_top_entity();
                    r = (e ? e.representation : BR.E.DEFAULT_REPRESENTATION);
                    BR.ui.display.draw(p.x, p.y, r.glyph, r.color.fg, r.color.bg);
                }
            }
        },
        get_random_cell: {
            value: function() {
                var ks = Object.keys(this);
                var index = Math.floor(ROT.RNG.getUniform() * ks.length);
                var k = ks[index];
                return {
                    position: BR.T.Pos.parse(k),
                    tile: this[k]
                };
            }
        },
        get_random_empty_cell: {
            value: function() {
                var self = this;
                var ks = Object.keys(this).filter(function(k) {
                    return self[k].is_empty();
                });
                var index = Math.floor(ROT.RNG.getUniform() * ks.length);
                var k = ks[index];
                return {
                    position: BR.T.Pos.parse(k),
                    tile: this[k]
                };
            }
        },
        get_random_cell_close_to: {
            value: function(pos, range) {
                range = BR.is_nothing(range) ? 5 : range;
                var ks = Object.keys(this).filter(function(k) {
                    var p = BR.T.Pos.parse(k);
                    return Math.abs(p.x - pos.x) < range &&
                        Math.abs(p.y - pos.y) < range;
                });
                var index = Math.floor(ROT.RNG.getUniform() * ks.length);
                var k = ks[index];
                return {
                    position: BR.T.Pos.parse(k),
                    tile: this[k]
                };
            }
        }
    });

}).call(this);
