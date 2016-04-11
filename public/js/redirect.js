angular.module("JuntasApp", ["ngResource"]).
    controller("Redirector", function ($scope, $Config, $resource, $timeout, $interval) {
    
    $scope.ExtensionInstalled = false;
    $scope.CheckComplete = false;
    var checkCount = 0;
    var checkInterval = $interval(function () {
        checkCount++;
        if (checkCount > 5) {
            document.getElementById('install-button').style.display = 'block';
            $scope.CheckComplete = true;
            $interval.cancel(checkInterval);
        }
            

        if (document.getElementById("juntas-indication") !== null) {
            
            $scope.ExtensionInstalled = true;
            
            $interval.cancel(checkInterval);
            $Config.ready(function () {
                 
                var res = $resource($Config.site.apiUrl + "/tabs/Tabs");
                res.get({ _id: tabId }, function (data) {
                    
                    var g = {
                        tab: data,
                        config: { apiUrl: $Config.site.apiUrl }
                    }
                    var event = new CustomEvent("delegate tab", { detail: JSON.stringify(g) });
                    window.dispatchEvent(event);
                    //$timeout(function () { document.getElementById("embedClick").click(); }, 1000);
                    $scope.CheckComplete = true;

                });


            });
        }
         
    }, 1000);

    
    
    $scope.Install = function () {
        chrome.webstore.install('https://chrome.google.com/webstore/detail/behimaeapdpdfokmhjahapambjidjdap', function (data) {
             
        }, function (data) { debugger})

    }

});