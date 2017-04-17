var app = angular.module('baseApp');

app.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "views/home.html",
    controller: "homeCtrl"
  })
  .when("/students", {
    templateUrl : "views/students.html",
    controller: "studentsCtrl"
  })
  .when("/add-student", {
    templateUrl : "views/add-student.html",
    controller: "addStudentCtrl"
  })
  .when("/edit-student/:student_id", {
    templateUrl : "views/edit-student.html",
    controller: "editStudentCtrl"
  })
  .when("/add-course", {
    templateUrl : "views/add-course.html",
    controller: "addCourseCtrl"
  })
  .when("/courses", {
    templateUrl : "views/courses.html",
    controller: "coursesCtrl"
  })
  .when("/section/:course/:section", {
    templateUrl : "views/section.html",
    controller: "sectionCtrl"
  })
  .when("/edit-course/:course_id", {
    templateUrl : "views/edit-course.html",
    controller: "editCourseCtrl"
  })
  .when("/candidates", {
    templateUrl : "views/candidates.html",
    controller: "candidatesCtrl"
  })
  .when("/final-assignments", {
    templateUrl : "views/final-assignments.html",
    controller: "finalCtrl"
  })
  .otherwise({
    templateUrl: "views/404.html"
  });
});
