var app = angular.module('baseApp');

app.service("schedulerService", function() {
  this.isAvailable = function(student, startTime, endTime, days){
    // should be in form... "2013/05/29 12:30 PM"
    var course_start = new Date(Date.parse("2001/01/01 " + startTime));
    var course_end = new Date(Date.parse("2001/01/01 " + endTime));
    var sameDays = false;
    // for each course in student.schedule
    for (var course in student.schedule){
      // check if any input days intersect with course.days
      for (var day in course.days){
        for (var d in days){
          if (day == d && course.days[day] && days[d]){
            sameDays = true;
            break;
          }
        }
        if(sameDays){
          break;
        }
      }
      if(sameDays){
        //convert
        var student_course_start = new Date(Date.parse("2001/01/01 " + course.start_time));
        var student_course_end = new Date(Date.parse("2001/01/01 " + course.end_time));
        // if course starts in middle or ends in middle of given class, then student is busy
        if((student_course_start <= course_end && student_course_start >= course_start) || (student_course_end >= course_start && student_course_end <= course_end)){
          return false;
        }
      }

    }
    return true;
  }
}]);
