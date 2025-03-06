document.addEventListener("DOMContentLoaded", () => {
  // Open modal
  const new_project_btn = document.querySelector('.new_project_btn');
  const add_project_modal = document.querySelector('.add_project_modal');
  const close_project_modal = document.querySelector('#close_project_modal');

  new_project_btn.addEventListener('click', () => {
    add_project_modal.classList.remove('hidden');

  //Fetch teammates
  const lab = document.getElementById('new_proj_btn').getAttribute('data-lab');
  const teamMembersContainer = document.getElementById('teamMembers');

  fetch(`/api/projects/teammates`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(students => {
      students.forEach(student => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'teamMembers';
        checkbox.value = student.id;

        const studentName = document.createElement('span');
        studentName.className = 'student-name';
        studentName.textContent = student.name;

        label.appendChild(checkbox);
        label.appendChild(studentName);
        teamMembersContainer.appendChild(label);
      });
    })
    .catch(error => {
      console.error('Error fetching students:', error);
      alert('Failed to fetch team members. Please try again.');
    });
  });

  close_project_modal.addEventListener('click', () => {
    add_project_modal.classList.add('hidden');
  })

  const createProjectForm = document.getElementById("createProjectForm");
  const projectName = document.getElementById("projectName");
  const projectDescription = document.getElementById("projectDescription");
  const projectItems = document.getElementById("projectItems");
  const projectsList = document.querySelector(".projects-list");

  // Create a new project
  createProjectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get the selected team members
    const teamMembers = Array.from(document.querySelectorAll('input[name="teamMembers"]:checked'))
      .map(checkbox => checkbox.value);

    // Create the new project object
    const newProject = {
      name: projectName.value.trim(),
      description: projectDescription.value.trim(),
      lab: document.querySelector('#new_proj_btn').getAttribute('data-lab'),
      items: projectItems.value.trim(),
      start_date: startDate.value,
      end_date: endDate.value,
      teamMembers: teamMembers // Add the selected team members
    };

    // Validate required fields
    if (!newProject.name || !newProject.description || !newProject.items || !newProject.start_date || !newProject.end_date) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      // Send the project data to the server
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Project created successfully!");
      location.reload();
    } 
    catch (error) {
      alert("Error creating project: " + error.message);
    }
  });

  // Update approval status
  const approveButtons = document.querySelectorAll(".approve-btn");
  const declineButtons = document.querySelectorAll(".decline-btn");

  // Function to update approval status
  const updateApprovalStatus = async (projectId, status) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/approval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_stat: status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Approval status updated successfully!");
      location.reload(); // Reload the page to reflect the changes
    } catch (error) {
      alert("Error updating approval status: " + error.message);
    }
  };

  // Add event listeners for approve buttons
  approveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.getAttribute("data-id");
      updateApprovalStatus(projectId, "approved");
    });
  });

  // Add event listeners for decline buttons
  declineButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.getAttribute("data-id");
      updateApprovalStatus(projectId, "declined");
    });
  });

  const formatDate = (dateString) => {
    if (!dateString) return ""; // Return empty string if dateString is null or undefined
  
    const date = new Date(dateString); // Convert the date string to a Date object
  
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return ""; // Return empty string for invalid dates
    }
  
    // Format the date as "Month Day, Year"
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Project filtering
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove the "active" class from all buttons
      filterButtons.forEach((b) => b.classList.remove("active"));
      // Add the "active" class to the clicked button
      btn.classList.add("active");

      // Get the filter type and value
      const filterType = btn.classList.contains("appr_stat_filter") ? "approval_stat" : "status";
      const filterValue = btn.getAttribute("data-status");

      // Fetch the filtered projects
      fetchFilteredProjects(filterType, filterValue);
    });
  });

  const fetchFilteredProjects = async (filterType, filterValue) => {
    try {
      const response = await fetch(`/api/projects/filtered_projects?filterType=${filterType}&filterValue=${filterValue}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Update the table or project list with the filtered projects
      updateProjectsView(data);
    } catch (error) {
      console.error("Error fetching filtered projects:", error);
    }
  };

  const updateProjectsView = (projects) => {
    const projectsContainer = document.querySelector(".projects-table tbody") || document.querySelector(".projects-list");
    projectsContainer.innerHTML = ""; // Clear the current content
  
    if (document.querySelector(".projects-table")) {
      // Update the table for lab manager
      projects.forEach((project) => {
        const row = `
          <tr data-id="${project.id}" data-status="${project.status}">
            <td class="name_td">${project.name}</td>
            <td>
              <span class="approval-stat-label" data-approval-stat="${project.approval_stat}">
                ${project.approval_stat}
              </span>
            </td>
            <td>${formatDate(project.start_date)}</td>
            <td>${formatDate(project.end_date)}</td>
            <td>${project.owner_name}</td>
            <td>
              <div class="actions">
                <button class="approve-btn" data-id="${project.id}">Approve</button>
                <button class="decline-btn" data-id="${project.id}">Decline</button>
              </div>
            </td>
          </tr>
        `;
        projectsContainer.insertAdjacentHTML("beforeend", row);
      });
    } else {
      // Update the project list for students
      projects.forEach((project) => {
        const card = `
          <div class="project-card" data-status="${project.status}" data-id="${project.id}">
            <div class="project-card-head">
              <h4>${project.name}</h4>
              <span class="approval-stat-label" data-approval-stat="${project.approval_stat}">
                ${project.approval_stat}
              </span>
            </div>
            <p>${project.description}</p>
          </div>
        `;
        projectsContainer.insertAdjacentHTML("beforeend", card);
      });
    }
  };

  // Project details
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      const projectId = card.getAttribute("data-id");
      window.location.href = `/project-details/${projectId}`; // Navigate to project details page
    });
  });
});