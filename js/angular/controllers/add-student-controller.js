var app = angular.module('baseApp');

app.controller('addStudentCtrl', ['$scope', 'firebaseService', 'authService', function($scope, firebaseService, authService) {
    authService.checkUser();

    $scope.standardTimeOptions = [
      {id: 1, option: 'AM'},
      {id: 2, option: 'PM'}
    ];

    $scope.changeTime = function(current, change) {
      if (typeof current != 'undefined') {
        var result = change + " " + current.split(' ')[1];
        console.log(result);
        return result;
      }
      else {
        var result = change + " " + "AM";
        console.log("current undefined!")
        console.log(result);
        return result;
      }
    };

    $scope.changeAMorPM = function(current, change) {
      if (typeof current != 'undefined') {
        var result = current.split(' ')[0] + " " + change;
        console.log(result);
        return result;
      }
      else {
        var result = " "  + change
        return result;
      }
    };

    $scope.removeSpaces = function(input) {
      return input.replace(/\s+/g, '');;
    }

    $scope.initTime = function(time) {
      if (typeof time != 'undefined' && time != "") {
        return time.split(' ')[0];
      };
    };

    $scope.initAMorPM = function(time) {
      return $scope.standardTimeOptions[0];
    }

    $scope.grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

    $scope.student = new Student();

    $scope.addCourse = function() {
        $scope.student.addCourseTaking(new CourseTaking());
    };

    $scope.removeCourse = function(idx) {
        $scope.student.removeCourseTaking(idx);
    };

    $scope.addGrade = function() {
        $scope.student.addGrade(new Grade());
    };

    $scope.removeGrade = function(idx) {
        $scope.student.removeGrade(idx);
    };

    var cleanUp = function() {
        $scope.student.schedule.forEach(function(course) {
            delete course["$$hashKey"];
        });
        $scope.student.grades.forEach(function(grade) {
            delete grade["$$hashKey"];
        });
    };

    function areReqFieldsFilled() {
        return !($scope.student.id == "" || isMissingScheduleInformation());
    };

    function isMissingScheduleInformation() {
        if( $scope.student.schedule.length == 0){return false;}
        
        for (var i = 0; i < $scope.student.schedule.length; i++) {
            var course = $scope.student.schedule[i];
            if (course.id == "" || course.start_time.length < 7 || course.end_time.length < 7) {
                return true;
            }
        }
        return false;
    };

    $scope.submit = function() {

        console.log($scope.student.schedule[0]);

        if (areReqFieldsFilled()) {
            cleanUp();

            firebaseService.addStudent($scope.student, function(result) {
                toastr.success("Added student");
                $scope.student = new Student();
                $scope.$apply();
            }, function(error) {
                toastr.error("Failed to add");
            });
        } else {
            toastr.error("Required Fields Not Full");
        }
    };
}]);
