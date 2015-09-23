var scripter = function (obj) {



    if (typeof (obj) != "undefined") {
        var scope = new scripterScope();
        if (typeof (obj) == "string") {
            scope.selectorObj = document.querySelectorAll(obj);
        }
        else {
            if (obj.length !== undefined)
            { scope.selectorObj = obj; }
            else
            {
                scope.selectorObj = [];
                scope.selectorObj[0] = obj;
            }
        }
        return scope;
    }
    else {
        return new scripterScope();
    }

    function scripterScope() {      
        this.selectorObj = [];

        this.toList = function () {
            return this.selectorObj;
        }

        this.append = function (html) {
            for (var i = 0; i < this.selectorObj.length; i++) {
                if (typeof (html) == "object") {
                }
                else {
                    this.selectorObj[i].innerHTML += html;
                }
            }
            return this;
        }

        this.prepend = function (html) {
            for (var i = 0; i < this.selectorObj.length; i++)
                this.selectorObj[i].innerHTML = html + this.selectorObj[i].innerHTML;

        }

        this.html = function (html) {
            for (var i = 0; i < this.selectorObj.length; i++)
                this.selectorObj[i].innerHTML = html;

        }


        this.before = function (elem) {

            for (var i = 0; i < this.selectorObj.length; i++) {
                if (this.selectorObj[i].parentNode) {
                    this.selectorObj[i].parentNode.insertBefore(elem, this.selectorObj[i]);
                }
            }


        }

        this.after = function (elem) {
            for (var i = 0; i < this.selectorObj.length; i++) {


                if (this.selectorObj[i].parentNode) {
                    this.selectorObj[i].parentNode.insertBefore(elem, this.selectorObj[i].nextSibling);
                }
            }

        }


        this.properties = function (obj) {


            obj.get = function (key) {
                if (this[key] === undefined)
                    return "";
                try{
                    return eval(this[key]);
                } catch (e) {
                    return this[key];
                }
            }
            return obj;

        }

        this.createElement = function (html) {
            var container = document.createElement('div');
            container.innerHTML = html;
            return container.firstChild;
        }


        this.readyBound = false;

        this.ready = function (callback) {


            if (this.readyBound) return;
            this.readyBound = true;


            if (document.readyState == "complete"
                 || document.readyState == "loaded"
                 || document.readyState == "interactive") {
                callback();
            }


            // Mozilla, Opera and webkit nightlies currently support this event
            if (document.addEventListener) {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", function () {
                    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                    callback();
                }, false);

                // If IE event model is used
            } else if (document.attachEvent) {
                // ensure firing before onload,
                // maybe late but safe also for iframes
                document.attachEvent("onreadystatechange", function () {
                    if (document.readyState === "complete") {
                        document.detachEvent("onreadystatechange", arguments.callee);
                        callback();
                    }
                });

                // If IE and not an iframe
                // continually check to see if the document is ready
                if (document.documentElement.doScroll && window == window.top) (function () {
                    if (jQuery.isReady) return;

                    try {
                        // If IE is used, use the trick by Diego Perini
                        // http://javascript.nwbox.com/IEContentLoaded/
                        document.documentElement.doScroll("left");
                    } catch (error) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }

                    // and execute any waiting functions
                    callback();
                })();
            }

            // A fallback to window.onload, that will always work
            //  jQuery.event.add(window, "load", jQuery.ready);
        }



        this.data = function (attr, value) {

            for (var i = 0; i < this.selectorObj.length; i++) {
                if (value !== undefined) {

                    value = JSON.stringify(value);
                    this.selectorObj[i].dataset[attr] = value;
                }
                else {
                    var ret = this.selectorObj[i].dataset[attr];
                    if (ret !== undefined) {
                        ret = JSON.parse(ret);
                        return ret;
                    }
                    return null;

                }
            }
        }



        this.css = function (cssrules) {

            for (var i = 0; i < this.selectorObj.length; i++) {
                for (var x in cssrules) {
                    this.selectorObj[i].style[x] = cssrules[x];
                }

            }

        }



        this.attr = function (attrname, attrvalue) {
            for (var i = 0; i < this.selectorObj.length; i++) {
                if (this.selectorObj[i] !== undefined)
                    this.selectorObj[i].setAttribute(attrname, attrvalue);

            }

        }


        this.addClass = function (classname) {
            for (var i = 0; i < this.selectorObj.length; i++) {
                if (this.selectorObj[i] !== undefined)
                    this.selectorObj[i].className += classname;
            }

        }
        this.on = function (EVENT_NAME, callback) {
            for (var i = 0; i < this.selectorObj.length; i++) {
                var elm = this.selectorObj[i];
                if (elm.addEventListener)
                    elm.addEventListener(EVENT_NAME, callback, false);
                else
                    elm.attachEvent('on' + EVENT_NAME, callback);

            }


        }


        this.ajaxGet = function (url, callback) {

            var r = new XMLHttpRequest();
            r.open("GET", url, true);
            r.onreadystatechange = function () {
                if (r.readyState != 4 || r.status != 200) return;
                callback(r.responseText);
               
            };
            r.send();

        }

        this.each = function (callback) {
            for (var i = 0; i < this.selectorObj.length; i++) {
                callback(this.selectorObj[i], i);
            }

        }

        this.getScript = function (url, arg1, arg2) {
            var cache = false, callback = null;
            //arg1 and arg2 can be interchangable
            if (typeof (arg1) == "function") {
                callback = arg1;
                cache = arg2 || cache;
            } else {
                cache = arg1 || cache;
                callback = arg2 || callback;
            }

            var load = true;
            //check all existing script tags in the page for the url
            scripter('script[type="text/javascript"]')
              .each(function (obj, index) {

                  return load = (url != obj.getAttribute('src'));
              });
            if (load) {
                scripter().ajaxGet(url, function (data) {


                    //   var s = scripter().createElement("<script></script>");

                    //   s.setAttribute("src", url);
                    //  s.innerHTML = data;
                    eval(data);


                    callback(data);

                });
            } else {
                //already loaded so just call the callback
                if (typeof (callback) == "function") {
                    callback.call(this);
                };
            };
        };


        return this;
    }

}