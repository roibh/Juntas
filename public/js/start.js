angular.module("JuntasApp", ["ngResource"]).
    controller("Starter", function ($scope, $Config, $resource, $timeout, $interval) {
    
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
            $scope.CheckComplete = true;
            $interval.cancel(checkInterval);
            $Config.ready(function () {
                 
                var res = $resource($Config.site.apiUrl + "tabs/Tabs");
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
    
    $scope.Search = function () {
        
        document.location.href = "https://www.google.com?q=" + $scope.Term+"&oq=" + $scope.Term;
    
    
    }
    
    $scope.Install = function () {
        chrome.webstore.install('https://chrome.google.com/webstore/detail/behimaeapdpdfokmhjahapambjidjdap', function (data) {
             
        }, function (data) { debugger })

    }

}).directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });
                
                event.preventDefault();
            }
        });
    };
});




 



window.onload =  function() {
  var cx = '014090630614401310419:bwbunjtolb4'; // Insert your own Custom Search engine ID here
  var gcse = document.createElement('script'); gcse.type = 'text/javascript'; gcse.async = true;
  gcse.src = (document.location.protocol == 'https' ? 'https:' : 'http:') +
      '//www.google.com/cse/cse.js?cx=' + cx;
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(gcse, s);
};