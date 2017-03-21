var app = angular.module('baseApp');

app.controller('editCourseCtrl', ['$scope', '$location', '$routeParams', 'firebaseService', 'authService', function($scope, $location, $routeParams, firebaseService, authService) {
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
    if (typeof time != 'undefined' && time != "") {
      var option = time.split(' ')[1];
      if (option == $scope.standardTimeOptions[0].option) {
        return $scope.standardTimeOptions[0];
      }
      else {
        return $scope.standardTimeOptions[1];
      }
    };
    return $scope.standardTimeOptions[0];

  };

  $scope.course = firebaseService.getCourseById($routeParams.course_id, function(course) {
    $scope.course = course;
    $scope.$apply();
  }, function(error){
    console.log(error);
  });

  $scope.addSection = function() {
    $scope.course.addSection(new CourseSection());
  };

  $scope.removeSection = function(idx) {
    console.log(idx);
    firebaseService.removeSection($scope.course.firebaseId, idx, $scope.course.sections[idx].sectionID, function(result) {
      toastr.success("Removed Section");
      }, function(error) {
            toastr.error("Failed to remove Section");
            console.log(error);
    });
      $scope.course.removeSection(idx);
  };

  $scope.removeCourse = function() {
    firebaseService.removeCourse($scope.course.firebaseId, function(result) {
      toastr.success("Removed course");
      $location.path("/courses");
      $scope.$apply();
      console.log(result);
      firebaseService.removeCourseFromAssignments($scope.course.firebaseId, function(result) {
        toastr.success("Removed Course's Assignments");
        }, function(error) {
              toastr.error("Failed to remove Course's Assignments");
              console.log(error);
        });
    });
  }

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
      if (section.sectionID === "" || section.instructor === "" || section.startTime === "" || section.endTime === "" ||
          section.undergradTAsNeeded < 0 || section.gradTAsNeeded < 0 || section.undergradLAsNeeded < 0) {
            return false;
      }
    }
    return true;
  }

  $scope.submit = function() {
    if (areReqFieldsFilled()) {
      firebaseService.updateCourse($routeParams.course_id, $scope.course, function(result) {
        toastr.success("Updated course");
        $location.path("/courses");
        $scope.$apply();
      }, function(error) {
        toastr.error("Failed to update");
        console.log(error);
      });
    }
    else {
      toastr.error("Required Fields Not Filled");
    }
  };
}]);
