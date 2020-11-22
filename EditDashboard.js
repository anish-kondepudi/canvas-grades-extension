// Special thanks to Craig Taub, as table code is based
// on his answer here: https://stackoverflow.com/questions/14643617/create-table-using-javascript
fetch('/api/v1/courses?include[]=total_scores&per_page=100&enrollment_state=active',{
          method: 'GET',
          credentials: 'include',
          headers: {
               "Accept": "application/json"
          }
     })
    .then(res => res.json())
    .then(function(grades_data){

      var id_colors = {};

      var colors = Array.from(document.querySelectorAll('.ic-DashboardCard__header_hero')).map(function(div){
      	return div.style.backgroundColor;
      });

      var ids = Array.from(document.querySelectorAll('.ic-DashboardCard__link')).map(function(a){
      	return a.getAttribute('href').substring(9);
      });

      for (var i = 0; i < colors.length; i++){
      	id_colors[ids[i]] = colors[i];
      }


      //Array.from(document.querySelectorAll('.ic-DashboardCard')).forEach(function(tile){
      	//tile.parentNode.removeChild(tile);
      //});

      // Create an html element to put our table in
      var new_element = document.createElement('div');

      // Make a table object, make sure it has maximum width and borders
      var users_grades = document.createElement('table');
      users_grades.setAttribute('class', 'ic-Table ic-Table--bordered course-list-table');

      // Initalize the html element holding the contents of our table
      var table_head = document.createElement('thead');
      var header_row = document.createElement('tr');

      for (var j = 0; j < 2; j++) {
            // Create a table "tab" element
            var new_tab = document.createElement('th');
            new_tab.setAttribute('scope', 'col');
            new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
            // Create a text element and depending on the column
            // set its text to "Course" or "Grade"
            if(j == 0){
              new_tab.textContent = 'Course';
              new_tab.style.width = '50%';
            }else{
              new_tab.textContent = 'Grades';
              new_tab.style.width = '50%';
            }

            // Append the text object to the tab object, and
            // make sure the text is centered on the tab

            // add the tab to the current table row object
            header_row.appendChild(new_tab);
      }

      table_head.append(header_row);

      var table_body = document.createElement('tbody');

      // go through our grades
      for (var i = 0; i < grades_data.length; i++) {
        // Create a table row element
        var new_row = document.createElement('tr');
        new_row.setAttribute('class', 'course-list-table-row');
          // for all the other rows, insert the course name and grade
          for (var j = 0; j < 2; j++) {
            // Create a new table "tab" object
            var new_tab = document.createElement('td');
            new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');

            
            // Create a text element and depending on the column
            // set its text to the course name or the users grade
            var link = document.createElement('a');
            if(j == 0){
              const span = document.createElement('span');
              span.setAttribute('aria-hidden', 'true');
              span.setAttribute('class', 'course-color-block');
              span.style.backgroundColor = id_colors[grades_data[i].id];
              span.style.color = id_colors[grades_data[i].id];
              span.style.height = '.65rem';
              span.style.width = '.65rem';
              span.style.float = 'left';
              span.style.marginRight = '.5rem';
              span.style.marginTop = '.2rem';
              new_tab.append(span);


              link.setAttribute('href', '/courses/' + grades_data[i].id);
              link.textContent = grades_data[i].name;
              new_tab.style.width = '50%';
            }else{
              var course_score = grades_data[i].enrollments[grades_data[i].enrollments.length - 1].computed_current_score;
              var course_grade = grades_data[i].enrollments[grades_data[i].enrollments.length - 1].computed_current_grade;
              link.setAttribute('href', '/courses/' + grades_data[i].id + '/grades');
              link.textContent = course_grade == null ? "N/A" : course_grade + " (" + course_score + "%)";
              new_tab.style.width = '50%';
            }

            // Append the text object to the tab object, and
            // make sure the text is centered on the tab
            new_tab.appendChild(link);

            // add the tab to the current table row object
            new_row.appendChild(new_tab);
        }
        

        // Add the current table row to the table body object
        table_body.appendChild(new_row);
      }

      // add the table body to the overall table
      users_grades.appendChild(table_head);
      users_grades.appendChild(table_body);

      // add the table object to the html element we created
      new_element.appendChild(users_grades);

      // insert the html element into the html of the dashboard page
      document.getElementById("DashboardCard_Container").prepend(new_element);
})
.catch((error) => {
  console.error('Error:', error);
});