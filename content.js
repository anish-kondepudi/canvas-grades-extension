var obj;
const grades = [];

fetch('/api/v1/courses?include[]=total_scores&enrollment_state=active', {
	method: 'GET',
	headers: {
		accept: 'application/json+canvas-string-ids'
	}
})
.then(response => response.json())
.then(data => {

	
data.forEach(function(c){
	var dict = {};

	var id = c['id'];
	var score = c['enrollments'][0]['computed_current_score'];
	var grade = c['enrollments'][0]['computed_current_grade'];

	if (id == null) dict['score'] = '';
	else dict['id'] = id;

	if (score == null) dict['score'] = '';
	else dict['score'] = ' (' + score.toString() + ') ';

	if (grade == null) dict['grade'] = 'N/A';
	else dict['grade'] = grade;

	grades.push(dict);
});

var header = document.querySelector('#my_courses_table thead .course-list-nickname-column');
header.textContent = 'Grades';

var column = Array.from(document.querySelectorAll('#my_courses_table tbody .course-list-nickname-column'));

for(var i = 0; i < column.length; i++){
	const a = document.createElement('a');
	a.setAttribute('href', '/courses/' + grades[i]['id'] + '/grades');
	a.textContent = grades[i]['grade'] + grades[i]['score'] ;
	console.log(a);
	column[i].appendChild(a);
}

});