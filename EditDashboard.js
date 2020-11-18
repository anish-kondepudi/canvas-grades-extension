// Special thanks to Craig Taub, as table code is based
// on his answer here: https://stackoverflow.com/questions/14643617/create-table-using-javascript
fetch(location.protocol + '//' + location.host + location.pathname + 'api/v1/courses?include[]=total_scores&per_page=100&enrollment_state=active',{
          method: 'GET',
          credentials: 'include',
          headers: {
               "Accept": "application/json"
          }
     })
    .then(res => res.json())
    .then(data => grades_data = data)
    .then(function(){
      // Create an html element to put our table in
      var new_element = document.createElement('div');

      // Make a table object, make sure it has maximum width and borders
      var users_grades = document.createElement('table');
      users_grades.style.width = '100%';
      users_grades.setAttribute('border', '1');

      // Initalize the html element holding the contents of our table
      var table_body = document.createElement('tbody');

      // go through our grades
      for (var i = 0; i < grades_data.length + 1; i++) {
        // Create a table row element
        var new_row = document.createElement('tr');

        if(i == 0){
          // At the top of our table, make the "Courses" and "Grades" tab
          for (var j = 0; j < 2; j++) {
            // Create a table "tab" element
            var new_tab = document.createElement('td');

            // Create a text element and depending on the column
            // set its text to "Course" or "Grade"
            var text;
            if(j == 0){
              text = document.createTextNode("Course");
            }else{
              text = document.createTextNode("Grade");
            }

            // Append the text object to the tab object, and
            // make sure the text is centered on the tab
            new_tab.appendChild(text);
            new_tab.style.textAlign = "center";

            // add the tab to the current table row object
            new_row.appendChild(new_tab);
          }
        }else{
          // for all the other rows, insert the course name and grade
          for (var j = 0; j < 2; j++) {
            // Create a new table "tab" object
            var new_tab = document.createElement('td');

            // Create a text element and depending on the column
            // set its text to the course name or the users grade
            var text;
            if(j == 0){
              text = document.createTextNode(grades_data[i-1].name);
            }else{
              var course_grade = grades_data[i-1].enrollments[grades_data[i-1].enrollments.length - 1].computed_current_score;
              text = document.createTextNode(course_grade == null ? "No Grade for this course" : course_grade + "%");
            }

            // Append the text object to the tab object, and
            // make sure the text is centered on the tab
            new_tab.appendChild(text);
            new_tab.style.textAlign = "center";

            // add the tab to the current table row object
            new_row.appendChild(new_tab);
          }
        }

        // Add the current table row to the table body object
        table_body.appendChild(new_row);
      }

      // add the table body to the overall table
      users_grades.appendChild(table_body);

      // add the table object to the html element we created
      new_element.appendChild(users_grades);

      // insert the html element into the html of the dashboard page
      document.getElementById("DashboardCard_Container").prepend(new_element);
});
