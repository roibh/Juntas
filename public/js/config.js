angular.module("JuntasApp")
.provider("$Config", function () {
    var type;
    return {
        setType: function (value) {
            type = value;
        },
        $get: function ($http) {
            var self = this;
             
            $http.get("/config/config.json").success(function (data) {

                self.site = data;
            })

            return {
                ready: function (callback) {
                     
                    var self = this;
                    if (this.site === undefined) {
                        $http.get("/config/config.json").success(function (data) {

                            self.site = data;
                            callback();
                        })
                    } else {
                        callback();
                    }

                },
                site: self.site
            };
        }
    };
})