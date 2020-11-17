var column = Array.from(document.querySelectorAll('#my_courses_table .course-list-nickname-column'));
column[0].textContent = 'Grades';

var links = Array.from(document.querySelectorAll('#my_courses_table .course-list-course-title-column a')).map(function(a){
	return a.getAttribute('href');
});

var grades = ['B- (80.7%)', 'A (94.3)%', 'B+ (87.6%)', 'C- (72.3%)', 'A+ (100%)'];

for(var i = 1; i < column.length; i++){
	const a = document.createElement('a');
	a.setAttribute('href', links[i-1] + '/grades');
	a.textContent = grades[i];
	column[i].appendChild(a);
}