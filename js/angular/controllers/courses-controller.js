var app = angular.module('baseApp');

app.controller('coursesCtrl', ['$scope', 'firebaseService', 'authService', 'courseTakenFilter', function($scope, firebaseService, authService, courseTakenFilter) {
  authService.checkUser();

  $scope.courses = [];
  $scope.students = [];
  $scope.assignments = [];

  $scope.prettifyDays = function(days) { //MTWRF
    var template = {M:0, T:0, W:0, R:0, F:0};
    var res = "";

    for(var day in days) {
      if(days[day]) template[day] = 1;
    }

    for(var day in template) {
      if(template[day]) res += day;
    }

    return res;
  };
	
  function intersects(c_days,s_days) {
	  for (var c_day in c_days){
		for (var s_day in s_days) {
			if(s_day == c_day) return true;
		}
	  }
	  return false;
  }

  $scope.removeStudent = function(fbId) {
    for(var i = 0; i < $scope.currentStudents.length; i++) {
      if($scope.currentStudents[i].firebaseId == fbId) {
        $scope.currentStudents.splice(i, 1);
      }
    }
  };

  $scope.assignFinal = function(idx, studentFbId, courseFbId, section) {
    console.log(idx);
    firebaseService.addFinalAssignment(studentFbId, courseFbId, section, function(uuFbId) {
      $scope.currentStudents[idx].isAssigned = true;
      console.log(uuFbId)
      $scope.currentStudents[idx].assignmentFbId = uuFbId;
      $scope.$apply();
      toastr.success("Added Final");
    }, function(error) {
      toastr.error("Uh oh, something went wrong!");
    });
  };

  $scope.removeFinal = function(idx, assignmentFbId, courseFbId) {
    console.log(idx, assignmentFbId, courseFbId);
    firebaseService.removeFinal(assignmentFbId, courseFbId, function(success) {
      $scope.currentStudents[idx].isAssigned = false;
      toastr.success("Removed Assignment");
      $scope.$apply();
    }, function(error) {
      toastr.error("Uh oh, something went wrong!");
    });
  };

  firebaseService.getCoursesC(function(courses) {
    $scope.courses = courses;
    console.log(courses);
    $scope.$apply();
  }, function(error) {
    console.log(error);
  });

  firebaseService.getStudents(function(students) {
    $scope.students = students;
    console.log(students);
    $scope.$apply();
  }, function(error) {
    console.log(error);
  });
  
  firebaseService.getAssignments(function(assignments) {
    $scope.assignments = assignments;
    console.log(assignments);
    $scope.$apply();
  }, function(error) {
    console.log(error);
  });
}]);
