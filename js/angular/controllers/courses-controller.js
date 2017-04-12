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
  
  /*function hideLoading() {
	  $('.modal-dialog').show();
	  $('.loading').hide();
  }*/
	
$scope.launchModal = function(course, section) {    
  $scope.currentCourse = course;
  $scope.currentSection = section;
  //$scope.currentStudents = $scope.students.slice();
  $scope.currentStudents = $scope.students;
  //console.log($scope.assignments);
  var course_days = $scope.currentSection.days;
	var c_start = new Date(Date.parse("2001/01/01 " + section.startTime) - 25 * 60000);
	var c_end = new Date(Date.parse("2001/01/01 " + section.endTime) + 15 * 60000);
	//console.log("Course Start: " + c_start);
	//console.log("Course End: " + c_end);
	//console.log("Current students from courses-controller: ");
	for(var i = 0; i < $scope.currentStudents.length; i++) {
        var student = $scope.currentStudents[i];
		var schedule = student.schedule;
		var conflict = false;
		//console.log("student: " + student.first_name + " " + student.last_name + " #" + i);
        // for each course in student.schedule, check if a course occurs in the same day
        for (var j=0; j < schedule.length; j++){
		  if(intersects(course_days,schedule[j].days)) {
			var s_start = new Date(Date.parse("2001/01/01 " + student.schedule[j].start_time));
			var s_end = new Date(Date.parse("2001/01/01 " + student.schedule[j].end_time));
			//console.log("Same Day: " + student.last_name + " Class: " + s_start + "-" + s_end);
			if((s_start <= c_end && s_start >= c_start) 
				|| (s_end >= c_start && s_end <= c_end) 
				|| (s_end >= c_end && s_start <= c_start)){
			  // remove from list
			  //console.log("Found someone: " + student.last_name + " Class: " + s_start + "-" + s_end);
			  $scope.currentStudents.splice(i, 1);
			  conflict = true;
		  }
          }
        }
		if(!conflict) {
			var assigned = false;
			for(var assignment in $scope.assignments) {
				Object.keys($scope.assignments[assignment]['candidates']).forEach(function (key) {
				   var assign_inner = $scope.assignments[assignment]['candidates'][key];
				   if(assign_inner['section'] == section.sectionID && $scope.currentStudents[i].firebaseId == assign_inner['studentId']) {
						$scope.currentStudents[i].isAssigned = true;
						$scope.currentStudents[i].assignmentFbId = $scope.assignments[assignment]['firebaseId'];
						assigned = true;
						//break;
					  }
				});
			}
		}
		
      }
	
		/*console.log("Get candidates");
		for(var i = 0; i < $scope.currentStudents.length; i++) {
		var assigned = false;
			for(var j = 0; j < $scope.assignments.length; j++) {
              if($scope.assignments[j].section == section.sectionID && $scope.currentStudents[i].firebaseId == $scope.assignments[j].studentId) {
                $scope.currentStudents[i].isAssigned = true;
                $scope.currentStudents[i].assignmentFbId = $scope.assignments[j].firebaseId;
                assigned = true;
                break;
              }
            }
		if(!assigned) $scope.currentStudents[i].isAssigned = false;
		}*/
	  //$.getJSON({url: "https://cisc475-ta-database.firebaseio.com/assignments/"+course.firebaseId+"/candidates.json",
  		  //success: function(result){
		/*firebaseService.getCandidates(course.firebaseId, function(assignments) {
        	$scope.currentAssignments = assignments;
          console.log("Get candidates");
          for(var i = 0; i < $scope.currentStudents.length; i++) {
            var assigned = false;
            for(var j = 0; j < $scope.currentAssignments.length; j++) {
              if($scope.currentAssignments[j].section == section.sectionID && $scope.currentStudents[i].firebaseId == $scope.currentAssignments[j].studentId) {
                $scope.currentStudents[i].isAssigned = true;
                $scope.currentStudents[i].assignmentFbId = $scope.currentAssignments[j].firebaseId;
                assigned = true;
                break;
              }
            }
            if(!assigned) $scope.currentStudents[i].isAssigned = false;
          }
          //$scope.$apply();
        });*/
  //});
  
};

  $scope.removeStudent = function(fbId) {
    for(var i = 0; i < $scope.currentStudents.length; i++) {
      if($scope.currentStudents[i].firebaseId == fbId) {
        $scope.currentStudents.splice(i, 1);
      }
    }
  };

  $scope.assignCandidate = function(idx, studentFbId, courseFbId, section) {
    console.log(idx);
    firebaseService.addCandidateAssignment(studentFbId, courseFbId, section, function(uuFbId) {
      $scope.currentStudents[idx].isAssigned = true;
      console.log(uuFbId)
      $scope.currentStudents[idx].assignmentFbId = uuFbId;
      $scope.$apply();
      toastr.success("Added candidate");
    }, function(error) {
      toastr.error("Uh oh, something went wrong!");
    });
  };

  $scope.removeCandidate = function(idx, assignmentFbId, courseFbId) {
    console.log(idx, assignmentFbId, courseFbId);
    firebaseService.removeCandidate(assignmentFbId, courseFbId, function(success) {
      $scope.currentStudents[idx].isAssigned = false;
      toastr.success("Removed candidate");
      $scope.$apply();
    }, function(error) {
      toastr.error("Uh oh, something went wrong!");
    });
  };

  /*$scope.getStudentsAvailable = function(startTime, endTime, days, isChecked){
    console.log("Getting students available");
    if(isChecked){
      for(var i = 0; i < $scope.currentStudents.length; i++) {
        var student = $scope.currentStudents[i];
        // should be in form... "2013/05/29 12:30 PM"
        var course_start = new Date(Date.parse("2001/01/01 " + startTime));
        var course_end = new Date(Date.parse("2001/01/01 " + endTime));
        var sameDays = false;
        // for each course in student.schedule
        for (var j=0; j < student.schedule.length; j++){
          // check if any input days intersect with course.days
          for (var day in days){
            for (var d in student.schedule[j].days){
              if (day === d && days[day] && days[d]){
                sameDays = true;
              //  break;
              }
            }
            if(sameDays){
            //  break;
            }
          }
          if(sameDays){
            //convert
			console.log("This is a test" + course_start);
            var student_course_start = new Date(Date.parse("2001/01/01 " + student.schedule[j].start_time));
            var student_course_end = new Date(Date.parse("2001/01/01 " + student.schedule[j].end_time));
            // if course starts in middle or ends in middle of given class, then student is busy
          //  console.log(course.endTime);
            if((student_course_start <= course_end && student_course_start >= course_start) || (student_course_end >= course_start && student_course_end <= course_end)){
              // remove from list
              console.log("Found someone");
              $scope.currentStudents.splice(i, 1);
            }
          }

        }
      }
    }
    else{
      $scope.currentStudents = $scope.students.slice();
    }
  }*/

  firebaseService.getCourses(function(courses) {
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
