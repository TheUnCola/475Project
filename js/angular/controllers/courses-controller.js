var app = angular.module('baseApp');

app.controller('coursesCtrl', ['$scope', 'firebaseService', 'authService', 'courseTakenFilter', function($scope, firebaseService, authService, courseTakenFilter) {
  authService.checkUser();

  $scope.courses = {};
  $scope.students = [];

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

//   $scope.launchModal = function(course, section) {    
//     $scope.currentCourse = course;
//     $scope.currentSection = section;
//     $scope.currentStudents = $scope.students.slice();
// 	console.log("Current students from courses-controller: ");
//     //firebaseService.getCandidates(course.firebaseId, function(assignments) {
// $.getJson({url: "https://cisc475-ta-database.firebaseio.com/assignments/"+course.firebaseId+"/candidates.json",
// 		  type: "GET",
// 		  success: function(result){
//       	$scope.currentAssignments = result;
// 	  console.log("Get candidates");
//       for(var i = 0; i < $scope.currentStudents.length; i++) {
//         var assigned = false;
//         for(var j = 0; j < $scope.currentAssignments.length; j++) {
//           if($scope.currentAssignments[j].section == section.sectionID && $scope.currentStudents[i].firebaseId == $scope.currentAssignments[j].studentId) {
//             $scope.currentStudents[i].isAssigned = true;
//             $scope.currentStudents[i].assignmentFbId = $scope.currentAssignments[j].firebaseId;
//             assigned = true;
//             break;
//           }
//         }
//         if(!assigned) $scope.currentStudents[i].isAssigned = false;
//       }
//       $scope.$apply();
//     }, function(error) {
//       toastr.error("Something went wrong getting candidates");
//     });
// });
  //};
	
$scope.launchModal = function(course, section) {    
  $scope.currentCourse = course;
  $scope.currentSection = section;
  //$scope.currentStudents = $scope.students.slice();
  $scope.currentStudents = $scope.students;
  var course_days = $scope.currentSection.days;
	// should be in form... "2013/05/29 12:30 PM"
	var course_start = new Date(Date.parse("2001/01/01 " + section.startTime) - 25 * 60000);
	var course_end = new Date(Date.parse("2001/01/01 " + section.endTime) + 15 * 60000);
	console.log("Course Start: " + course_start);
	console.log("Course End: " + course_end);
	console.log("Current students from courses-controller: ");
    //firebaseService.getCandidates(course.firebaseId, function(assignments) {
	for(var i = 0; i < $scope.currentStudents.length; i++) {
        var student = $scope.currentStudents[i];
		var schedule = student.schedule;
		console.log("student: " + student.last_name);
        var conflict = false;
        // for each course in student.schedule
        for (var j=0; j < schedule.length; j++){
          // check if any input days intersect with course.days
          for (var c_day in course_days){
            for (var s_day in schedule[j].days){
				console.log("student: " + student.last_name + " s_day: "+s_day);
              if (c_day == s_day && course_days[c_day] && course_days[s_day] && !conflict){
                
				//console.log(student.last_name + " Day: " + c_day);
				var student_course_start = new Date(Date.parse("2001/01/01 " + student.schedule[j].start_time));
				var student_course_end = new Date(Date.parse("2001/01/01 " + student.schedule[j].end_time));
				console.log("Same Day: " + student.last_name + " Class: " + student_course_start + "-" + student_course_end);
				if((student_course_start <= course_end && student_course_start >= course_start) || (student_course_end >= course_start && student_course_end <= course_end) || (student_course_end >= course_start && student_course_start <= course_start)){
				  // remove from list
				  console.log("Found someone: " + student.last_name + " Class: " + student_course_start + "-" + student_course_end);
				  $scope.currentStudents.splice(i, 1);
				  conflict = true;
				}
              } else {
				  continue;
			  }
            }
          }
          

        }
      }
	  /*$.getJSON({url: "https://cisc475-ta-database.firebaseio.com/assignments/"+course.firebaseId+"/candidates.json",
  		  success: function(result){
        	$scope.currentAssignments = result;
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
		console.log("Applying scope");
          $scope.$apply();
		  console.log("Scope applied");
        }
  });*/
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

  $scope.getStudentsAvailable = function(startTime, endTime, days, isChecked){
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
  }

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
}]);
