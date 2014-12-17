(function () {
    "use strict";

    var BR = this.BR;

    /// ------------------------------------------------------------------------
    /// Generic decorators.
    BR.fn = Object.create(null);

    BR.fn.fluent = function fluent_decorator(fn) {
        return function () {
            fn.apply(this, arguments);
            return this;
        };
    };

    BR.slice = Function.prototype.call.bind(Array.prototype.slice);

    BR.mixin = function mixin(/* dst, args... */) {
        var varargs = BR.slice(arguments),
            destination = varargs.shift();

        varargs.forEach(function (e) {
            Object.keys(e || {}).forEach(function (p) {
                destination[p] = e[p];
            });
        });

        return destination;
    };

    /// ------------------------------------------------------------------------
    /// Multimethod!
    BR.multi = (function multimethod_closure() {
        /*
         Usage:

         var m = multi()
         .when_t(String)(console.log.bind(console, 'a string'))
         .when_v(1)(console.log.bind(console, 'numero uno'))
         .when_t(Number)(console.log.bind(console, 'a number'));
         */
        "use strict";

        var WHEN_TYPE = "type",
            WHEN_VALUE = "value",
            NOOP = function () { };

        var get_ctor = function get_constructor(a) {
            if(a === void 0 || a === null) {
                return void 0;
            }

            return a.constructor;
        };

        var multi = function multi_impl(conf) {
            conf = conf || {};
            var lookup = function multi_lookup(type, args) {
                // TODO: if dispatching on type, maybe build an algo that checks for most specific.
                // I.e. if we have a constructor `Animal` that another constructor (e.g. `Bear`) whose
                // prototype's [[__proto__]] points to, and user have dispatch on both types,
                // an argument of type `Bear` should always cause the most specific fn to be invoked.
                // It is possible with this impl, only the user have to define the least specific
                // type to dispatch on last, that is:
                // multi().ontypes(Bear)(func...).ontypes(Animal)(func...)
                // otherwise the dispatch on `Animal` would catch all calls.
                var fn_table = multimethod.function_table,
                    args_len = args.length,
                    match = false,
                    i, j;

                var comparison;

                if (type === WHEN_TYPE) {
                    comparison = function instance_of_type(instance, type) {
                        if (!type.prototype) { return false; }
                        return get_ctor(instance) === type || type.prototype.isPrototypeOf(instance);
                    };
                } else if (type === WHEN_VALUE) {
                    comparison = function strict_equals(a, b) {
                        return a === b;
                    };
                } else {
                    comparison = function false_func() { return false; };
                }

                for (i = 0; i < fn_table.length; i++) {
                    if (fn_table[i].args.length !== args_len || fn_table[i].type !== type) {
                        continue;
                    }
                    for (j = 0; j < args_len; j++) {
                        if (!comparison(args[j], fn_table[i].args[j])) {
                            match = false;
                            break;
                        }
                        match = true;
                    }

                    if (match) { return fn_table[i].func; }
                }

                return void 0;
            };

            var multimethod = function multi_multimethod() {
                var args = Array.prototype.slice.call(arguments),
                    found_fn;

                found_fn = lookup(WHEN_VALUE, args) || lookup(WHEN_TYPE, args);
                if (!found_fn) {
                    if (!multimethod._fallback) {
                        throw new TypeError("No match!");
                    }
                }

                //var before_result = multimethod._configuration.before.call(this, args);
                if (found_fn) {
                    return found_fn.apply(this, args);
                } else if (multimethod._fallback) {
                    return multimethod._fallback.apply(this, args);
                }

                return void 0;
            };

            var get_when_func = function multi_get_when_func(type) {
                return function multi_on() {
                    var self = multimethod,
                        args = Array.prototype.slice.call(arguments, 0);
                    return function multi_on_callback(func, conf) {
                        self.function_table.push({
                            type: type || WHEN_TYPE,
                            args: args || [],
                            func: func || NOOP,
                            conf: conf || {}
                        });

                        return self;
                    };
                };
            };

            Object.defineProperties(multimethod, {
                _configuration: {
                    value: Object.create(null, {
                        before: {
                            value: conf.before || NOOP
                        },
                        after: {
                            value: conf.after || NOOP
                        }
                    })
                },
                _fallback: {
                    value: null,
                    writable: true
                },
                fallback: {
                    value: function set_fallback(value) {
                        this._fallback = value;
                        return this;
                    }
                },
                function_table: {
                    value: []
                },
                when_t: {
                    value: get_when_func(WHEN_TYPE)
                },
                when_v: {
                    value: get_when_func(WHEN_VALUE)
                }
            });

            return multimethod;
        };

        return multi;
    })();

    /// ------------------------------------------------------------------------
    /// Fun things with throbbers.
    BR.ui = Object.create(null);

    BR.ui.getThrobber = function (color, secondsPerRevolution) {
        var throbberSvg = '' +
            '<svg width="16" height="16" viewBox="0 0 300 300"' +
            'xmlns="http://www.w3.org/2000/svg" version="1.1">' +
            '<path d="M 150,0' +
            'a 150,150 0 0,1 106.066,256.066' +
            'l -35.355,-35.355' +
            'a -100,-100 0 0,0 -70.711,-170.711 z"' +
            'fill="%color">' +
            '<animateTransform attributeName="transform" attributeType="XML"' +
            'type="rotate" from="0 150 150" to="360 150 150"' +
            'begin="0s" dur="%secondsPerRevolution" fill="freeze" repeatCount="indefinite" />' +
            '</path>' +
            '</svg>';

        return throbberSvg
        .replace(/%color/, "#" + (color || "000000"))
        .replace(/%secondsPerRevolution/, (secondsPerRevolution || 1) + "s");
    };

    BR.ui.getRandomThrobber = function () {
        return BR.ui.getThrobber(BR.rng.randomColor());
    };

    // -------------------------------------------------------------------------
    // Randomness
    BR.rng = Object.create(null);

    BR.rng.randomInt = BR.multi()
    .when_t(Number)(function randomIntMax (max) {
        return Math.floor(Math.random() * max);
    })
    .when_t(Number, Number)(function randomIntMinMax(min, max) {
        return Math.floor((max - min) * Math.random()) + Math.floor(min);
    });

    BR.rng.randomByte = function _randomByte() {
        return BR.rng.randomInt(0xff);
    };

    BR.rng.randomBit = function _randomBit() {
        return BR.rng.randomInt(2);
    };

    BR.rng.randomColor = function _randomColor() {
        var triplet = [randomByte(), randomByte(), randomByte()];
        return triplet.map(function (b) {
            var s = b.toString(16);
            return s.length < 2 ?
                "0" + s : s;
        }).join("");
    };

    BR.makeEvent = function(name) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(name, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = name;
        }

        event.eventName = name;

        return event;
    };

    BR.fireEvent = function(event, element) {
        if (document.createEvent) {
            (element || document).dispatchEvent(event);
        } else {
            (element || document).fireEvent("on" + event.eventType, event);
        }
    };

    BR.log = function () {
        // if log
        return console.log.apply(console, arguments);
    };

    BR.is_nothing = function (a) {
        /// Check whether the supplied argument is undefined OR null.
        /// This is different from checking `!arg`, since that would
        /// rule out other falsy values, such as 0, "", etc.
        return a === void 0 || a === null;
    };
    BR.is_something = function(a) {
        /// Check whether the supplied argument is NOT nothing,
        /// i.e. not undefined AND not null.
        return !BR.is_nothing(a);
    };
    BR.are_something = function (propArray, inObj) {
        /// Takes an array of property names and checks
        /// that the object passed in as second argument
        /// has something (according to isSomething) set as value
        /// @param 1: Array<String>, the property names
        /// @param 2: Object, the object that should have values in the
        ///   properties defined in @param 1.
        /// @returns Boolean,
        ///   true if all properties has some value
        ///   false if any of them is nothing
        /// @example
        /// var t = {a: 0, b: 1, c: void 0};
        /// var b = areSomething(["a", "b"], t); // b === true
        /// var b = areSomething(["a", "b", "c"], t); // b === false
        return propArray.map(function(p) {
            // extract the values that corresponds to the
            // property names in the array.
            return inObj[p];
        }).reduce(function(a, b) {
            // reduce the values, starting with `true`
            // and check that the next value also is something.
            return a && BR.is_something(b);
        }, true);
    };
    BR.get_val = function getVal(subscript, root) {
        /// "Recursively" checks the subscript of the supplied root
        /// object, or, if it's nothing, default to `this` (i.e.
        /// the global object, if not `call`ed on the object).
        /// @example:
        /// var r = { a: { b: { c: { d: 0, e: [1] } } } };
        /// var d = getVal("a.b.c.d", r); // => 0
        /// var d = getVal("a.b.c.e", r); // => [1]
        /// var no = getVal("a.b.c.f", r); // => undefined
        /// --
        /// Also works with nested arrays:
        /// var r2 = {a: [{ b: 10 }] };
        /// var ten = getVal("a.0.b", r2); // => 10
        var props;
        if (typeof subscript !== "string" ||
            subscript.length < 1) {
            return false ;
        }

        // alternatively use:
        // .split(/[\.|\[\]]/).filter(function (a) {
        //     return !!a;
        // });
        // to allow subscript to contain []-indexing.
        props = subscript.split(".");
        root = root || this;

        // start with the value of the property with the name that is
        // the first of the ones passed in in the subscript string.
        // Then, if that object is something, continue with the value
        // of the property of that object with the corresponding next
        // property name.
        return (props || []).slice(1).reduce(function(out, p) {
            return BR.is_something(out) ? out[p] : out;
        }, root[props[0]]);
    };
    BR.is_defined = function (subscript, root) {
        /// Checks whether the subscript of the supplied root object is defined.
        /// @example:
        /// var r = { a: { b: { c: { d: 0 } } } };
        /// var d = isDefined("a.b.c.d", r); // => true
        /// var no = isDefined("a.b.c.e", r); // => false
        /// --
        /// Also works with nested arrays:
        /// var r2 = {a: [{ b: 10 }] };
        /// var ten = isDefined("a.0.b", r2); // => true
        /// var ten = isDefined("a.0.c", r2); // => false
        return BR.is_something(BR.get_val(subscript, root));
    };

    var colors = Object.create(null);
    BR.mixin(colors, {
        lighten: function(color_string, amount) {
            var i, bytes = [], new_byte,
                short = color_string.length < 6,
                clean = color_string.replace("#", "");

            clean = short ? clean + clean : clean;

            for (i = 0; i < clean.length; i += 2) {
                new_byte = parseInt(clean[i] + clean[i + 1], 16);
                new_byte = Math.floor(new_byte * (1 + (0.1 * amount || 0)));
                bytes.push((new_byte > 0xff ? 0xff : new_byte).toString(16));
            }

            var simple_pad = function(b) {
                return b.length < 2 ?
                    "0" + b : b;
            };

            var result = "#" + bytes.map(simple_pad).join("");
            if (!short) {
                console.log(color_string, result);
            }
            return result;
        }
    });

    BR.colors = colors;

    BR.track = {
        entities: [],
    };

    BR.clear_interval = function(id) {
        clearInterval(id);
    };

    BR.make_interval = function(this_arg, cycle_length, fn, timeout) {
        var timeout = timeout || 5000,
            self = this_arg,
            get_scheduler = function() {
                return (BR.engine || {})._scheduler;
            },
            tid,
            game_time_cycle_start;

        // return (function  rec() {
        //     var scheduler = get_scheduler();
        //     if (!scheduler) {
        //         return setTimeout(rec, 100);
        //     }

        //     if (tid) {
        //         clearTimeout(tid);
        //     }

        //     if (!game_time_cycle_start) {
        //         game_time_cycle_start = scheduler.getTime();
        //     }

        //     tid = setTimeout(function() {
        //         if ((scheduler.getTime() - game_time_cycle_start) >
        //             cycle_length) {
        //             game_time_cycle_start = null;

        //             fn.call(this_arg);
        //         }
        //         rec();
        //     }, timeout);
        // })();

        return setInterval(function() {
            var t,
                scheduler = get_scheduler();
            if (!scheduler) {
                return;
            }

            t = scheduler.getTime();

            if (!game_time_cycle_start) {
                game_time_cycle_start = t;
            }

            if ((t - game_time_cycle_start) > cycle_length) {
                game_time_cycle_start = null;
                fn.call(this_arg);
            }
        }, timeout);
    };

}).call(this);
