(function() {
    "use strict";

    var BR = this.BR,
        ROT = this.ROT;

    BR.DEFAULT_BACKGROUND = "#222";
    BR.DEFAULT_FOREGROUND = "#555";

    Object.defineProperties(BR, {
        engine: {
            value: new BR.ROT.Engine(new BR.ROT.Scheduler.Action())
        },
        ui: {
            value: Object.create(null, {
                widgets: { value: {} },
                display: {
                    value: new ROT.Display({
                        //width: 80,
                        //height: 30,
                        width: 60,
                        height: 25,
                        //fontSize: 23,
                        fontSize: 30,
                        fontFamily: "Courier New",
                        bg: BR.DEFAULT_BACKGROUND
                    })
                }
            })
        },
        world: {
            value: Object.create(null, {
                // BR.T.Pos => Array<BR.E.Thing>
                map: { value: new BR.T.Map() }
            })
        },

        add_entity: {
            value: function(repeat, thing) {
                if (!this.world.map[thing.position]) {
                    throw new Error("Out of bounds!");
                }

                this.world.map.add_entity(thing);
                this.engine._scheduler.add(thing, repeat);
            }
        },
        start: {
            value: function() {
                this.engine.start();
            }
        },
        draw: {
            value: function(pos) {
                var e = this.world.map[pos].get_top_entity();
                var r = (e ? e.representation : BR.E.DEFAULT_REPRESENTATION);
                this.ui.display.draw(pos.x, pos.y, r.glyph, r.color.fg, r.color.bg);

                this.world.map[pos].draw();
            }
        }
    });

    BR.world.map.generate();

    $(function() {
        $("#main-view")
            .append(BR.ui.display.getContainer())
            .find("canvas").click(function(e) {
                var coords = BR.ui.display.eventToPosition(e);
                //console.log(coords);
                var p = new BR.T.Pos(coords[0], coords[1]);
                BR.clicked_tile = BR.world.map[p];
                console.log(BR.clicked_tile);
            });

        BR.world.map.draw_all();
    });

    BR.start();

}).call(this);
