//get url of page to check if on canvas dashboard
var url = window.location.href;

//if on dashboard, start to get grades and load new table
if (/^https:\/\/canvas\.([^()]+)\.edu\/$/.test(url) || /^https:\/\/([^()]+)\.instructure\.com\/$/.test(url)) {
    Promise.all([
            fetch('/api/v1/users/self/colors', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Accept": "application/json+canvas-string-ids"
                }
            })
            .then(res => res.json()),
            fetch('/api/v1/courses?per_page=100&enrollment_state=active&enrollment_type=student&include[]=total_scores&include[]=favorites&include[]=concluded', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Accept": "application/json+canvas-string-ids"
                }
            }).then(res => res.json())
        ])
        .then(([color_data, course_data]) => {

            var tile_data = {};

            Array.from(document.querySelectorAll('.ic-DashboardCard')).forEach(function(tile) {
                //store id of tile
                const id = tile.querySelector('.ic-DashboardCard__link').getAttribute('href').substring(9);

                //store action buttons of tile
                const actions = Array.from(tile.querySelectorAll('.ic-DashboardCard__action')).map(function(node) {
                    return node.cloneNode(true);
                });

                tile_data[id] = {
                    'actions': actions
                };
            });

            var curr_courses = Array.from(course_data).filter(function(course) {
                return ("false".localeCompare(course.concluded) == 0 && "true".localeCompare(course.is_favorite) == 0);
            })

            var colors = color_data.custom_colors;

            // Define header names and their respective column widths
            var col_names = ['Course', 'Grades', ''];
            var col_widths = ['45%', '20%', '35%'];

            // Create an html element to put our table in
            var new_element = document.createElement('div');

            // Make a table object with Canvas css styling
            var users_grades = document.createElement('table');
            users_grades.setAttribute('class', 'ic-Table ic-Table--bordered course-list-table');

            var table_head = document.createElement('thead');
            var header_row = document.createElement('tr');

            for (var i = 0; i < col_names.length; i++) {
                // Create a table "tab" element
                var new_tab = document.createElement('th');
                new_tab.setAttribute('scope', 'col');
                new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');

                //set width of column
                new_tab.style.width = col_widths[i];

                //set name of header column
                new_tab.textContent = col_names[i];

                // add the tab to the current table row object
                header_row.appendChild(new_tab);
            }
            //add row to table head
            table_head.append(header_row);

            //create table body
            var table_body = document.createElement('tbody');

            if(curr_courses.length == 0){
              var new_row = document.createElement('tr');
              new_row.setAttribute('class', 'course-list-table-row');

              var new_tab = document.createElement('td');
              new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
              new_tab.style.width = '50%';

              var regular_text = document.createElement('div');
              regular_text.textContent = "You have not starred any courses";
              new_tab.appendChild(regular_text);

              new_row.appendChild(new_tab);


              var second_tab = document.createElement('td');
              second_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
              second_tab.style.width = '50%';

              var linkToAllC = document.createElement('a');
              linkToAllC.setAttribute('href', '/courses/');
              linkToAllC.textContent = "Click here, then click on the star icon next to each class whose grade you want to see";
              second_tab.appendChild(linkToAllC);

              new_row.appendChild(second_tab);

              table_body.append(new_row);
              users_grades.appendChild(table_head);
              users_grades.appendChild(table_body);

              // add the table object to the html element we created
              new_element.appendChild(users_grades);

              // insert the html element into the html of the dashboard page
              document.getElementById("DashboardCard_Container").prepend(new_element);
            }else{

              // go through our grades
              for (var i = 0; i < curr_courses.length; i++) {

                  // Create a table row element
                  var new_row = document.createElement('tr');
                  new_row.setAttribute('class', 'course-list-table-row');

                  //for each rows, insert course name, grades, and action buttons
                  for (var j = 0; j < col_names.length; j++) {

                      // Create a new table "tab" object
                      var new_tab = document.createElement('td');
                      new_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
                      new_tab.style.width = col_widths[j];

                      if (j == 0) { //course name column

                          //insert color block of specific course
                          const span = document.createElement('span');
                          span.setAttribute('aria-hidden', 'true');
                          span.setAttribute('class', 'course-color-block');
                          span.style.backgroundColor = colors['course_' + curr_courses[i].id];
                          span.style.height = '.65rem';
                          span.style.width = '.65rem';
                          span.style.float = 'left';
                          span.style.marginRight = '.5rem';
                          span.style.marginTop = '.2rem';
                          new_tab.append(span);

                          //insert course name linking to home page of course
                          var link = document.createElement('a');
                          link.setAttribute('href', '/courses/' + curr_courses[i].id);
                          link.textContent = curr_courses[i].name;
                          new_tab.appendChild(link);

                      } else if (j == 1) { //grades column

                          //get grades and score data of specific course
                          var course_score = curr_courses[i].enrollments[curr_courses[i].enrollments.length - 1].computed_current_score;
                          var course_grade = curr_courses[i].enrollments[curr_courses[i].enrollments.length - 1].computed_current_grade;

                          //insert grade and score linking to grade page of course
                          var link = document.createElement('a');
                          link.setAttribute('href', '/courses/' + curr_courses[i].id + '/grades');
                          if (course_grade == null && course_score == null) {
                              link.textContent = "N/A";
                          } else if (course_grade != null && course_score == null) {
                              link.textContent = course_grade;
                          } else if (course_grade == null && course_score != null) {
                              link.textContent = course_score + "%";
                          } else {
                              link.textContent = course_grade + " (" + course_score + "%)";
                          }
                          new_tab.appendChild(link);
                      } else if (j == 2) { //action buttons column

                          //create a div to hold actions
                          var container = document.createElement('div');
                          container.style.height = '2.25rem';
                          container.style.display = 'flex';

                          if (curr_courses[i].id in tile_data) {
                              //add actions to div
                              tile_data[curr_courses[i].id].actions.forEach(function(action) {
                                  container.appendChild(action);
                              });
                          }

                          //add div to table cell
                          new_tab.appendChild(container);
                      }

                      // add the tab to the current table row object
                      new_row.appendChild(new_tab);
                  }

                  // Add the current table row to the table body object
                  table_body.appendChild(new_row);
              }

              // add the table head and body to the overall table
              users_grades.appendChild(table_head);
              users_grades.appendChild(table_body);

              // add the table object to the html element we created
              new_element.appendChild(users_grades);

              // insert the html element into the html of the dashboard page
              document.getElementById("DashboardCard_Container").prepend(new_element);
            }

        }).catch((err) => {
            console.log(err);
        });

}
