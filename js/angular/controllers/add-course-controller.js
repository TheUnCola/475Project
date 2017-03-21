var app = angular.module('baseApp');

app.controller('addCourseCtrl', ['$scope', 'firebaseService', 'authService', function($scope, firebaseService, authService) {
  authService.checkUser();

  $scope.standardTimeOptions = [
    {id: 1, option: 'AM'},
    {id: 2, option: 'PM'}
  ];

  $scope.changeTime = function(current, change) {
    if (typeof current != 'undefined' && current != "") {
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
  };

  $scope.course = new Course();

  $scope.addSection = function() {
    $scope.course.addSection(new CourseSection());
  };

  $scope.removeSection = function(idx) {
    $scope.course.removeSection(idx);
  };

  function areReqFieldsFilled() {
    return areReqCourseFieldsFilled() && areReqSectionFieldsFilled();
  }

  function areReqCourseFieldsFilled() {
    if ($scope.course.courseID === "") {
      return false;
    }
    else {
      return true;
    }
  }

  function areReqSectionFieldsFilled() {
    for (var i = 0; i < $scope.course.sections.length; i++) {
      var section = $scope.course.sections[i];
      console.log(section.days);
      if (section.sectionID === "" || section.instructor === "" || section.startTime === "" || section.endTime === "" ||
          section.undergradTAsNeeded < 0 || section.gradTAsNeeded < 0 || section.undergradLAsNeeded < 0) {
            return false;
      }
    }
    return true;
  }

  var cleanUp = function() {
    $scope.course.sections.forEach(function(section) {
        delete section["$$hashKey"];
    });
  };

  $scope.submit = function() {
      if (areReqFieldsFilled()) {
        cleanUp();
        $scope.course.courseID = $scope.course.courseID.toUpperCase();

        firebaseService.addCourse($scope.course, function(result) {
          toastr.success("Added Course");
          $scope.course = new Course();
          $scope.$apply();
          console.log(result);
        }, function(error) {
          toastr.error("Firebase error, please ensure that all fields are filled");
          console.log(error);
        });
      }
      else {
        toastr.error("Required Fields Not Filled");
      }
  };

}]);
