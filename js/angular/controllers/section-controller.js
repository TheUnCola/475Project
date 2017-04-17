var app = angular.module('baseApp');

app.controller('sectionCtrl', ['$scope', '$routeParams', 'firebaseService', 'authService', function($scope, $routeParams, firebaseService, authService) {
    authService.checkUser();

    $scope.courses = {};
    $scope.currentSection = {};
    $scope.students = [];
    $scope.assignments = [];

    var courseFB = $routeParams.course;
    var sectionID = $routeParams.section;

    console.log(courseFB);
    console.log(sectionID);

    $scope.prettifyDays = function(days) { //MTWRF
        var template = {
            M: 0,
            T: 0,
            W: 0,
            R: 0,
            F: 0
        };
        var res = "";

        for (var day in days) {
            if (days[day]) template[day] = 1;
        }

        for (var day in template) {
            if (template[day]) res += day;
        }

        return res;
    };

    function intersects(c_days, s_days) {
        for (var c_day in c_days) {
            for (var s_day in s_days) {
                if (s_day == c_day) return true;
            }
        }
        return false;
    }
	
    firebaseService.getCourseById(courseFB, function(course) {
        $scope.courses = course;
        console.log(course);
        $scope.$apply();
        firebaseService.getStudents(function(students) {
            $scope.students = students;
            console.log(students);
            $scope.$apply();
            firebaseService.getAssignments(function(assignments) {
                $scope.assignments = assignments;
                console.log(assignments);
                $scope.$apply();
                doStuff();
                $scope.$apply();
            }, function(error) {
                console.log(error);
            });
        }, function(error) {
            console.log(error);
        });
    }, function(error) {
        console.log(error);
    });



    function doStuff() {
        for (var i = 0; i < $scope.courses.sections.length; i++) {
            if ($scope.courses.sections[i].sectionID == sectionID) $scope.currentSection = $scope.courses.sections[i];
        }
		$scope.currentCourse = $scope.courses;
        $scope.currentStudents = $scope.students;
        var course_days = $scope.currentSection.days;
        var c_start = new Date(Date.parse("2001/01/01 " + $scope.currentSection.startTime) - 25 * 60000);
        var c_end = new Date(Date.parse("2001/01/01 " + $scope.currentSection.endTime) + 15 * 60000);
        for (var i = 0; i < $scope.currentStudents.length; i++) {
            var student = $scope.currentStudents[i];
            var schedule = student.schedule;
            var conflict = false;
            // for each course in student.schedule, check if a course occurs in the same day
            for (var j = 0; j < schedule.length; j++) {
                if (intersects(course_days, schedule[j].days)) {
                    var s_start = new Date(Date.parse("2001/01/01 " + student.schedule[j].start_time));
                    var s_end = new Date(Date.parse("2001/01/01 " + student.schedule[j].end_time));
                    if ((s_start <= c_end && s_start >= c_start) ||
                        (s_end >= c_start && s_end <= c_end) ||
                        (s_end >= c_end && s_start <= c_start)) {
                        // remove from list
                        $scope.currentStudents.splice(i, 1);
                        conflict = true;
                    }
                }
            }
            if (!conflict) {
                var assigned = false;
                for (var assignment in $scope.assignments) {
                    Object.keys($scope.assignments[assignment]['final']).forEach(function(key) {
                        var assign_inner = $scope.assignments[assignment]['final'][key];
                        if (assign_inner['section'] == $scope.currentSection.sectionID && $scope.currentStudents[i].firebaseId == assign_inner['studentId']) {
                            $scope.currentStudents[i].isAssigned = true;
                            $scope.currentStudents[i].assignmentFbId = $scope.assignments[assignment]['firebaseId'];
                            assigned = true;
                        }
                    });
                }
            }
        }

    }

    $scope.removeStudent = function(fbId) {
        for (var i = 0; i < $scope.currentStudents.length; i++) {
            if ($scope.currentStudents[i].firebaseId == fbId) {
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
            toastr.success("Assigned");
			
        }, function(error) {
            toastr.error("Uh oh, something went wrong!");
        });
		firebaseService.addCandidateAssignment(studentFbId, courseFbId, section, function(uuFbId) {
			console.log("Added Candidate")
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
		firebaseService.removeCandidate(assignmentFbId, courseFbId, function(success) {
			console.log("Removed Candidate")
        }, function(error) {
            toastr.error("Uh oh, something went wrong!");
        });
    };
	
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