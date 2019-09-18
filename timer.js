
// TimerApp 
TimerApp = angular.module('TimerApp', ['ngMaterial', 'ngMessages']);

// attach TimerCtrl
TimerApp.controller('TimerCtrl', TimerCtrl);

// TimerCtrl that controls the function of the GUI
function TimerCtrl($scope, $log, $mdToast) {

    $scope.addTimerForm = {
        'startOnAdd': false
    };
    $scope.duplicateTimers = {};

    $scope.timers = {};
    
    $scope.alarm = new Audio('alarm.mp3');
    
    $scope.addTimer = function () {
        // Title of timer
        title = $scope.addTimerForm.title;
        // Length of timer in seconds
        length = $scope.addTimerForm.length;
        // Boolean indicating whether or not to start timer immediately
        // when its added or wait until user hits start
        startOnAdd = $scope.addTimerForm.startOnAdd;

        // Initialize new timer object
        newTimer = {
            timeLeftInt: length,
            timeElapsedInt: 0,
            originalLengthInt: length,
            timeLeftFormatted: $scope.formatSeconds(length),
            //timeElapsedFormatted: $scope.formatSeconds(0),
            //originalLengthFormatted: $scope.formatSeconds(length),
            paused: !startOnAdd,
            started: startOnAdd
        };

        $log.info('title: ' + title)

        // Check for duplicates, if so create new timer name
        if (title in $scope.timers) {
            // duplicate was found check if this is the first duplicate
            if (title in $scope.duplicateTimers) {
                // this is not the first duplicate, 
                // increment the number in the duplicate dictionary
                $scope.duplicateTimers[title]++;
                // update the title
                title += " (" + $scope.duplicateTimers[title] + ")";
            } else {
                // this is the first duplicate, initialize key in duplicate dictionary
                $scope.duplicateTimers[title] = 1;
                title += " (" + $scope.duplicateTimers[title] + ")";
            }
        }

        $log.info('titl2e: ' + title)

        // Add the timer obj to the dictionary with its title as its key        
        $scope.timers[title] = newTimer;

        // Create time incrementer and add it to timer object
        newTimer.timeIncrementer = $scope.createTimeIncrementer(title);

        $log.info(startOnAdd);

        // Start the timer if the user inidcated they wanted to start it immediately
        if (startOnAdd) {
            // Set the timer counting
            $scope.startTimer(title);
        }

        // Clear the form data
        $scope.addTimerForm = {
            'startOnAdd': false
        };

    };

    $scope.createTimeIncrementer = function (title) {
        timeFunc = function () {
            // Set another timeout to be called in 1 second
            $scope.timers[title].timeIncrementerID = setTimeout($scope.timers[title].timeIncrementer, 1000);
            // Increment the time elapsed
            $scope.timers[title].timeElapsedInt++;
            // Calculate/update the time left
            $scope.timers[title].timeLeftInt = $scope.timers[title].originalLengthInt - $scope.timers[title].timeElapsedInt;
            // Update the time left formatted string
            $scope.timers[title].timeLeftFormatted = $scope.formatSeconds($scope.timers[title].timeLeftInt);

            // if timer is finished call timerComplete function
            if ($scope.timers[title].timeLeftInt <= 0) {
                $scope.timerComplete(title);
            }

            // Apply changes to GUI
            $scope.$apply();
        };
        return timeFunc;
    }

    $scope.startTimer = function (title) {
        $log.info(title);
        $scope.timers[title].timeIncrementerID = setTimeout($scope.timers[title].timeIncrementer, 1000);
        $log.info('id in start = ' + $scope.timers[title].timeIncrementerID);
        $scope.timers[title].started = true;
        $scope.timers[title].paused = false;
    }

    $scope.pauseTimer = function (title) {
        $log.info('id in pause = ' + $scope.timers[title].timeIncrementerID);
        $log.info("pauseTimer " + title);
        clearTimeout($scope.timers[title].timeIncrementerID);
        $scope.timers[title].paused = true;
    }

    $scope.resumeTimer = function (title) {
        $log.info("resumeTimer " + title);
        $scope.timers[title].timeIncrementerID = setTimeout($scope.timers[title].timeIncrementer, 1000);
        $scope.timers[title].paused = false;
    }

    $scope.removeTimer = function (title) {
        $log.info("removeTimer " + title);
        delete $scope.timers[title];
        $scope.pauseAudio();
        
    }

    $scope.formatSeconds = function (s) {
        var sec_num = parseInt(s, 10);

        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        if (sec_num >= 3600) {
            return hours + ':' + minutes + ':' + seconds;
        } else if (sec_num >= 60) {
            return minutes + ':' + seconds;
        } else {
            return 0 + ':' + seconds;
        }

    }

    $scope.timerComplete = function (title) {
        // Stop timer 
        $scope.pauseTimer(title);
        // Show notification
        $scope.showTimerCompleteToast(title);
        // Play sound
//        $scope.alarm.playSound();
        $scope.playAudio();
        
    };
    
    $scope.showTimerCompleteToast = function (title) {
        var toast = $mdToast.simple()
            .textContent(title + ' timer finished!')
            .action('OK')
            .highlightAction(true)
            .hideDelay(0);

        $mdToast.show(toast).then(function (response) {
            if (response == 'ok') {
                //remove timer
                $scope.removeTimer(title);
                $scope.pauseAudio();
            }
        });

    }
    
    //Play Audio
    $scope.playAudio = function() {
        $scope.alarm.currentTime = 0;
        $scope.alarm.play();
    };
    
    //Pause Audio
    $scope.pauseAudio = function() {
        $scope.alarm.pause();
    };
}//end of timer control
