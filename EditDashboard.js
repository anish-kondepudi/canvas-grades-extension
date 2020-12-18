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
            fetch('/api/v1/users/self/favorites/courses?include[]=total_scores&include[]=favorites', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Accept": "application/json+canvas-string-ids"
                }
            }).then(res => res.json())
        ])
        .then(([color_data, course_data]) => {

            if (course_data.length > 0 && "true".localeCompare(course_data[0].is_favorite) == 0) {

                var tile_data = {};

                if ("none".localeCompare(document.getElementById("DashboardCard_Container").style.display) != 0) {
	                Array.from(document.querySelectorAll('.ic-DashboardCard')).forEach(function(tile) {
	                    //store id of tile
	                    const id = tile.querySelector('.ic-DashboardCard__link').getAttribute('href').substring(9);

	                    //store action buttons of tile
	                    const actions = Array.from(tile.querySelectorAll('.ic-DashboardCard__action')).map(function(node) {
	                        return node.cloneNode(true);
	                    });

	                    tile_data[id] = actions;
	                });
	            }

                var colors = color_data.custom_colors;

                // Define header names and their respective column widths
                var col_names = ['Course', 'Grades', ''];
                var col_widths = ['45%', '20%', '35%'];

                // Make a table object with Canvas css styling
                var table = document.createElement('table');
                table.setAttribute('class', 'ic-Table ic-Table--bordered course-list-table');
                table.style.backgroundColor = '#FFFFFF'
                //table.style.borderTop = '1px solid #C7CDD1';

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
                    header_row.appendChild(new_tab);document.getElementById("DashboardCard_Container")
                }
                //add row to table head
                table_head.append(header_row);

                //create table body
                var table_body = document.createElement('tbody');

                // go through our grades
                for (var i = 0; i < course_data.length; i++) {

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
                            span.style.backgroundColor = colors['course_' + course_data[i].id];
                            span.style.height = '.65rem';
                            span.style.width = '.65rem';
                            span.style.float = 'left';
                            span.style.marginRight = '.5rem';
                            span.style.marginTop = '.2rem';
                            new_tab.append(span);

                            //insert course name linking to home page of course
                            var link = document.createElement('a');
                            link.setAttribute('href', '/courses/' + course_data[i].id);
                            link.textContent = course_data[i].name;
                            new_tab.appendChild(link);

                        } else if (j == 1) { //grades column

                            //get grades and score data of specific course
                            var course_score = course_data[i].enrollments[0].computed_current_score;
                            var course_grade = course_data[i].enrollments[0].computed_current_grade;

                            //insert grade and score linking to grade page of course
                            var link = document.createElement('a');
                            link.setAttribute('href', '/courses/' + course_data[i].id + '/grades');
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

                            if (course_data[i].id in tile_data) {
                                //add actions to div
                                tile_data[course_data[i].id].forEach(function(action) {
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
                table.appendChild(table_head);
                table.appendChild(table_body);

                if ("none".localeCompare(document.getElementById("dashboard-planner").style.display) != 0) {
					document.getElementById("dashboard_header_container").append(table);                
                }
                else {
                	document.getElementById("dashboard_header_container").after(table);
                }

            } else {

                // Make a table object with Canvas css styling
                var table = document.createElement('table');
                table.setAttribute('class', 'ic-Table ic-Table--bordered course-list-table');

                var table_head = document.createElement('thead');
                var header_row = document.createElement('tr');

                var header_tab = document.createElement('th');
                header_tab.setAttribute('scope', 'col');
                header_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');

                //set width of column
                header_tab.style.width = '100%';

                //set name of header column
                header_tab.textContent = 'Courses';

                // add the tab to the current table row object
                header_row.appendChild(header_tab);

                //add row to table head
                table_head.append(header_row);

                //create table body
                var table_body = document.createElement('tbody');


                var info_row = document.createElement('tr');
                info_row.setAttribute('class', 'course-list-table-row');

                var info_tab = document.createElement('td');
                info_tab.setAttribute('class', 'course-list-course-title-column course-list-no-left-border');
                info_tab.style.width = '100%';

                var link = document.createElement('a');
                link.setAttribute('href', '/courses/');
                link.textContent = window.location.href + 'courses/';

                var star = document.createElement('span');
                star.setAttribute('class', 'course-list-favoritable');
                star.style.paddingRight = '.25rem';
                star.style.paddingLeft = '.25rem';
                var i = document.createElement('i');
                i.setAttribute('class', 'course-list-favorite-icon icon-star-light');
                star.appendChild(i);


                info_tab.innerHTML = "To add courses to the table, go to ";
                info_tab.appendChild(link);
                info_tab.innerHTML += " then click the ";
                info_tab.appendChild(star);
                info_tab.innerHTML += " icon next to each class you want to view."

                info_row.appendChild(info_tab);

                table_body.append(info_row);

                // add the table head and body to the overall table
                table.appendChild(table_head);
                table.appendChild(table_body);

                if ("none".localeCompare(document.getElementById("dashboard-planner").style.display) != 0) {
					document.getElementById("dashboard_header_container").append(table);                
                }
                else {
                	document.getElementById("dashboard_header_container").after(table);
                }

            }

        }).catch((err) => {
            console.log(err);
        });

}