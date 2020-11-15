var header = document.querySelector('#my_courses_table thead .course-list-nickname-column');
header.textContent = 'Grades';

var grades = ['B- (80.7%)', 'A (94.3)%', 'B+ (87.6%)', 'C- (72.3%)'];

var column = Array.from(document.querySelectorAll('#my_courses_table tbody .course-list-nickname-column'));

for(var i = 0; i < column.length; i++){
	column[i].textContent = grades[i];
}