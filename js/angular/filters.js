var app = angular.module('baseApp');

app.filter('courseTaken', function() {
  return function(students, courseId) {
    if(courseId === "" || courseId === undefined || courseId === null) return students;
    var output = [];
    students.forEach(function(student) {
        grades = student.grades;
        for(var i = 0; i < grades.length; i++) {
            if(grades[i].id.toUpperCase() == courseId.toUpperCase()) {
                output.push(student);
                break;
            }
        }
    });
    return output;
  };
});

app.filter('hasTags', function() {
  return function(students, tags) {
    if(tags === "" || tags === undefined || tags === null) return students;
    tags = tags.split(",");
    var output = [];
    students.forEach(function(student) {
        var foundAll = true;

        tags.forEach(tag => {
            var foundTag = false;
            studentTags = student.tags.split(",");

            studentTags.forEach(studentTag => {
                if(studentTag.toUpperCase().trim() == tag.toUpperCase().trim()) foundTag = true;
            });
            if(!foundTag) foundAll = false;
        });

        if(foundAll) output.push(student);
    });
    return output;
  };
});

app.filter('toArray', function () {
  return function (obj, addKey) {
    if (!angular.isObject(obj)) return obj;
    if ( addKey === false ) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    } else {
      return Object.keys(obj).map(function (key) {
        var value = obj[key];
        return angular.isObject(value) ?
          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
          { $key: key, $value: value };
      });
    }
  };
});