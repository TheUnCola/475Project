var app = angular.module('baseApp');

app.controller('finalCtrl', ['$scope', 'firebaseService', 'authService', function($scope, firebaseService, authService) {
    authService.checkUser();
    // HERE is where you would add header to Course CSV
    $scope.getDataHeaderCourse = function(){
      return ["Course","Section", "Last Name", "First Name", "Email"];
    }
    // HERE is where you would add header to Student CSV
    $scope.getDataHeaderStudent = function(){
      return ["Last Name", "First Name", "Course","Section", "Workload", "Email"];
    }
    $scope.content=true;
    $scope.coursePage = function(){
      $scope.content = true;
    }

    $scope.studentsPage = function(){
      $scope.content = false;
    }

    firebaseService.getAllAssignments(function(object) {
        $scope.allAssignments = object;
        $scope.$apply();
        console.log($scope.allAssignments);
    }, function(error) {
        console.log("Couldn't get list of all assignments");
        console.log(error);
    });

    firebaseService.getCourses(function(courses) {
        $scope.courseAssignments = [];
        $scope.csvAssignmentsCourses = [];
        $scope.csvAssignmentsStudents = [];
        $scope.assignedStudents = [];
        courses.forEach(function(course, index) {
            // get the final assignments for this course
            firebaseService.getFinalAssignment(course.firebaseId, function(result) {
                // get key candidate info for this course
                var candidates = [];
                $scope.courseAssignments.push([course, candidates]);
                $scope.$apply()
                firebaseService.getCourseById(course.firebaseId, function(fbcourse){
                result.forEach(function(candidate) {
                    firebaseService.getStudentById(candidate.studentId, function(student) {
                        var candidateInfo = {};
                        candidateInfo.name = student.first_name + " " + student.last_name;
                        candidateInfo.firstName = student.first_name;
                        candidateInfo.lastName = student.last_name;
                        candidateInfo.section = candidate.section;
                        candidateInfo.studentID = student.id;
                        candidateInfo.firebaseID = candidate.studentId;
                        candidateInfo.email = student.email;
                        candidates.push(candidateInfo);
                        var workload = 0
                        for(var j = 0; j < fbcourse.sections.length; j++){
                          console.log(fbcourse.sections[j]);
                          if (fbcourse.sections[j].sectionID == candidate.section){
                             workload = fbcourse.sections[j].numberOfStudents;
                          }
                        }
                        // LINE BELOW is where you add info to Student csv
                        $scope.csvAssignmentsStudents.push([candidateInfo.lastName, candidateInfo.firstName, course.courseID, candidateInfo.section, workload, student.email]);
                        $scope.assignedStudents.push([candidateInfo.name,candidateInfo.lastName,candidateInfo.firstName, course.courseID, candidateInfo.section, workload]);
                        // once we have all the info about candidates we need, we push the candidates list
                        if (candidates.length == result.length) {
                            $scope.courseAssignments[index] = [course, candidates];
                            //if by course
                              for(var i=0; i < candidates.length; i++){
                                // LINE BELOW is where you add info to Courses csv
                                $scope.csvAssignmentsCourses.push([course.courseID, candidates[i].section, candidates[i].lastName, candidates[i].firstName, candidates[i].email]);
                              }
                            $scope.$apply();
                        };

                    }, function(error) {
                        console.log(error);
                    });
                });
            }, function(error) {
                console.log(error);
            });
        });
    }, function(error) {
        console.log(error);
    });
        console.log($scope.courseAssignments);
    }, function(error) {
        console.log(error);
    });

	//Removes Final Assignment as well as Candidate Assignment
    $scope.undoFinalAssignment = function(courseFirebaseID, studentFirebaseID, assignmentSection) {
        firebaseService.getAllAssignments(function(object) {
            for (var key in object) {
                if (key == courseFirebaseID) {
                    if (object.hasOwnProperty(key)) {
                        var finals = object[key].final;
                        for (var assignment in finals) {
                            if (finals.hasOwnProperty(assignment)) {
                                var section = finals[assignment].section;
                                var studentFID = finals[assignment].studentId;
                                if (section == assignmentSection && studentFID == studentFirebaseID) {
                                    firebaseService.removeFinal(assignment, courseFirebaseID,
                                        function(result) {
                                            console.log(result);
                                        },
                                        function(error) {
                                            console.log(error);
                                        });
									firebaseService.removeCandidate(assignment, courseFirebaseID,
                                        function(result) {
                                            console.log(result);
                                        },
                                        function(error) {
                                            console.log(error);
                                        });
                                };
                            };
                        };
                    };
                };
            };
            location.reload();
        }, function(error) {
            console.log(error);
        });
    };


}]);
