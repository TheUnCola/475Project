var app = angular.module('baseApp');

app.service("firebaseService", function() {
  var db = firebase.database();

  /* STUDENT OPERATIONS */

  var castSingleToStudent = function(obj, key) {
    var s = new Student(
      obj.isUndergrad,
      obj.id,
      obj.first_name,
      obj.last_name,
      obj.email,
      obj.schedule,
      obj.grades,
      obj.tags
    );
    s.firebaseId = key;
    return s;
  };

  var castManyToStudent = function(objects) {
    var students = [];
    for(var key in objects) {
      var obj = objects[key];
      students.push(castSingleToStudent(obj, key));
    }
    return students;
  }

  this.getStudents = function(success, failure) {
    return db.ref("students").once("value")
    .then(function(snapshot) {
      success(castManyToStudent(snapshot.val()));
    }, function(error) {
      failure(error);
    });
  };

  this.getStudentById = function(id, success, failure) {
    return db.ref(`students/${id}`).once("value")
    .then(function(snapshot) {
      var obj = snapshot.val();
      success(castSingleToStudent(obj, snapshot.getKey()));
    }, function(error) {
      failure(error);
    });
  };

  this.addStudent = function(student, success, failure) {
    console.log(student);
    db.ref("students").push(student)
    .then(function(snapshot) {
      success("Successfully added student");
    }, function(error) {
      failure(error);
    });
  };

  this.updateStudent = function(id, student, callback, error) {
    return db.ref(`students/${id}`).update(student)
    .then(function(res) {
      callback("Success");
    }, function(error) {
      failure(error);
    });
  };

  var genericCallback = function(msg) {
    console.log(msg);
  };

  this.removeStudent = function(firebaseID, success, failure) {
    var myself = this;
    myself.getAllAssignments(function(assignments) {
      for(var assignment_key in assignments) {
        var assignment = assignments[assignment_key];
        var candidates = assignment.candidates;
        var finals = assignment.final;

        for(var candidate_key in candidates) {
          var candidate = candidates[candidate_key];
          console.log(candidate);
          if(candidate.studentId == firebaseID) {
            myself.removeCandidate(candidate_key, assignment_key, genericCallback, genericCallback);
          }
        }
        for(var final_key in finals) {
          var final = finals[final_key];
          if(final.studentId == firebaseID) {
            myself.removeFinal(final_key, assignment_key, genericCallback, genericCallback);
          }
        }
      }
      db.ref(`students/${firebaseID}`).remove()
        .then(function(snapshot) {
          success("Successfully removed student");
        }, function(error) {
          failure(error);
        });
    }, function(err) {
      console.log(err);
    });
  };


  /* COURSE OPERATIONS */

  var castSingleToCourse = function(obj, key) {
    var c = new Course(
      obj.courseID,
      obj.courseTags,
      obj.sections
    );
    c.firebaseId = key;
    return c;
  };

  var castManyToCourse = function(objects) {
    var courses = [];
    for(var key in objects) {
      var obj = objects[key];
      courses.push(castSingleToCourse(obj, key));
    }
    return courses;
  };

  this.getCourses = function(success, failure) {
    return db.ref("courses").once("value")
    .then(function(snapshot) {
      success(castManyToCourse(snapshot.val()));
    }, function(error) {
      failure(error);
    });
  };

  this.getCourseById = function(id, success, failure){
    return db.ref(`courses/${id}`).once("value")
    .then(function(snapshot) {
      var obj = snapshot.val();
      success(castSingleToCourse(obj, snapshot.getKey()));
    }, function(error){
      failure(error);
    });
  };

  this.addCourse = function(course, success, failure) {
    console.log(course);
    db.ref("courses").push(course)
    .then(function(snapshot) {
      success("Success");
    }, function(error) {
      failure(error);
    });
  };

  this.updateCourse = function(id, course, callback, error) {
    return db.ref(`courses/${id}`).update(course)
    .then(function(res) {
      callback("Success");
    }, function(error) {
      failure(error);
    });
  };

  this.removeCourse= function(firebaseID, success, failure) {
    db.ref(`courses/${firebaseID}`).remove()
    .then(function(snapshot) {
      success("Successfully removed course");
    }, function(error) {
      failure(error);
    });
  };

  this.removeSection= function(courseID, sectionIndex, sectionID, success, failure) {
    var myself = this;
    myself.getCandidates(courseID, function(candidates) {
      for(var assignment_key in candidates) {
        var assignment = candidates[assignment_key];
        if(assignment.section == sectionID){
          myself.removeCandidate(assignment.firebaseId, courseID, genericCallback, genericCallback);
        }
      }
    });
    myself.getFinalAssignment(courseID, function(finals) {
      for(var assignment_key in finals) {
        var assignment = finals[assignment_key];
        if(assignment.section == sectionID){
          myself.removeFinal(assignment.firebaseId, courseID, genericCallback, genericCallback);
        }
      }
    });
      db.ref(`courses/${courseID}/sections/${sectionIndex}`).remove()
      .then(function(snapshot) {
        success("Successfully removed section");
      }, function(error) {
        failure(error);
      });
};

  /* ASSIGNMENT OPERATIONS */

  var assignmentObjectsToArray = function(assignments) {
    var ret_assignments = [];
    for(var key in assignments) {
      var a = assignments[key];
      a.firebaseId = key;
      ret_assignments.push(a);
    }
    return ret_assignments;
  };

  // adds the given student to the course's candidate choices
  // takes in the firebase id of the student and course
  this.addCandidateAssignment = function(studentID, courseID, section, success, failure) {
    var data = {
      section: section,
      studentId: studentID
    };

    db.ref(`assignments/${courseID}/candidates`).push(data)
    .then(function(snapshot) {
      success(snapshot.path.o[3]);
    }, function(error) {
      failure(error);
    });
  };

  // adds the given student to the course's final choices
  // takes in the firebase id of the student and course
  this.addFinalAssignment = function(studentID, courseID, section, success, failure) {
    var data = {
      section: section,
      studentId: studentID
    };

    db.ref(`assignments/${courseID}/final`).push(data)
    .then(function(snapshot) {
      success("successfully added final student assignment");
    }, function(error) {
      failure(error);
    });
  };

  // returns all the studenIDs of the candidate choices for the given firebase courseID
  this.getCandidates = function(courseID, success, failure) {
	console.log("FirebaseService.getCandidates, before return");
    return db.ref(`assignments/${courseID}/candidates`).once("value")
    .then(function(snapshot) {
	  console.log("Success to follow");
      success(assignmentObjectsToArray(snapshot.val()));
    }, function(error) {
      failure(error);
    });
  };

  // returns all the studentIDs of the final choices for the given firebase courseID
  this.getFinalAssignment = function(courseID, success, failure) {
    return db.ref(`assignments/${courseID}/final`).once("value")
    .then(function(snapshot) {
      success(assignmentObjectsToArray(snapshot.val()));
    }, function(error) {
      failure(error);
    });
  };

  // Use this to get a json of all assignments. Each course is mapped to a candidates
  // key and a final key. The values of these keys are firebase ids of students.
  // assignments -> courseID -> candidates/final -> studentID
  this.getAllAssignments = function(success, failure) {
    return db.ref(`assignments`).once("value")
    .then(function(snapshot) {
      success(snapshot.val());
    }, function(error) {
      failure(error);
    });
  };

  // Will remove student from course's candidates. Must take in the firebase ID
  // of the assignment (not the student's ID), and the firebase ID of the course
  this.removeCandidate = function(firebaseID, courseID, success, failure) {
    console.log("trying to remove")
    db.ref(`assignments/${courseID}/candidates/${firebaseID}`).remove()
    .then(function(snapshot) {
      console.log("removed!")
      success("Successfully removed student");
    }, function(error) {
      console.log(error)
      failure(error);
    });
  };

  // Will remove student from course's final field. Must take in the firebase ID
  // of the assignment (not the student's ID), and the firebase ID of the course
  this.removeFinal = function(firebaseID, courseID, success, failure) {
    db.ref(`assignments/${courseID}/final/${firebaseID}`).remove()
    .then(function(snapshot) {
      success("Successfully removed final student assignment");
    }, function(error) {
      failure(error);
    });
  };

  this.removeCourseFromAssignments = function(courseID, success, failure) {
    db.ref(`assignments/${courseID}`).remove()
    .then(function(snapshot) {
      success("Successfully removed course assignment");
    }, function(error) {
      failure(error);
    });
  };

});
