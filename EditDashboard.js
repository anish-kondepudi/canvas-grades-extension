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

      var tile_data = {};

      Array.from(document.querySelectorAll('.ic-DashboardCard')).forEach(function(tile){
      	const id = tile.querySelector('.ic-DashboardCard__link').getAttribute('href').substring(9);
      	const color = tile.querySelector('.ic-DashboardCard__header_hero').style.backgroundColor;
      	const actions = Array.from(tile.querySelectorAll('.ic-DashboardCard__action')).map(function(node){
      		return node.cloneNode(true);
      	});

      	tile_data[id] = {'color': color, 'actions': actions};
      });



      //Array.from(document.querySelectorAll('.ic-DashboardCard')).forEach(function(tile){
      	//tile.parentNode.removeChild(tile);
      //});

      var col_names = ['Course', 'Grades', ''];
      var col_widths = ['50%', '25%', '25%'];

      // Create an html element to put our table in
      var new_element = document.createElement('div');

      // Make a table object, make sure it has maximum width and borders
      var users_grades = document.createElement('table');
      users_grades.setAttribute('class', 'ic-Table ic-Table--bordered course-list-table');

      // Initalize the html element holding the contents of our table
      var table_head = document.createElement('thead');
      var header_row = document.createElement('tr');

      for (var i = 0; i < col_names.length; i++) {
            // Create a table "tab" element
            var new_tab = document.createElement('th');
            new_tab.setAttribute('scope', 'col');
            new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
            new_tab.style.width = col_widths[i];
            new_tab.textContent = col_names[i];
            // Create a text element and depending on the column
            // set its text to "Course" or "Grade"
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
          for (var j = 0; j < col_names.length; j++) {
            // Create a new table "tab" object
            var new_tab = document.createElement('td');
            new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
            new_tab.style.width = col_widths[j];
            
            // Create a text element and depending on the column
            // set its text to the course name or the users grade
            
            if(j==0){
              const span = document.createElement('span');
              span.setAttribute('aria-hidden', 'true');
              span.setAttribute('class', 'course-color-block');
              span.style.backgroundColor = tile_data[grades_data[i].id].color;
              span.style.color = tile_data[grades_data[i].id].color;
              span.style.height = '.65rem';
              span.style.width = '.65rem';
              span.style.float = 'left';
              span.style.marginRight = '.5rem';
              span.style.marginTop = '.2rem';
              new_tab.append(span);

              var link = document.createElement('a');
              link.setAttribute('href', '/courses/' + grades_data[i].id);
              link.textContent = grades_data[i].name;
              new_tab.appendChild(link);
            }
            else if(j==1){
              var course_score = grades_data[i].enrollments[grades_data[i].enrollments.length - 1].computed_current_score;
              var course_grade = grades_data[i].enrollments[grades_data[i].enrollments.length - 1].computed_current_grade;

              var link = document.createElement('a');
              link.setAttribute('href', '/courses/' + grades_data[i].id + '/grades');
              link.textContent = course_grade == null ? "N/A" : course_grade + " (" + course_score + "%)";
              new_tab.appendChild(link);
            }
            else if (j==2){
              var container = document.createElement('div');
              container.style.display = 'flex';
              tile_data[grades_data[i].id].actions.forEach(function(action){
              	container.appendChild(action);
              });
              new_tab.appendChild(container);
            }

            // Append the text object to the tab object, and
            // make sure the text is centered on the tab
            

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