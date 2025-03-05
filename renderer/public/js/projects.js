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
  const filterButtons = document.querySelectorAll(".filter-btn");

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
  
  // Change project status (admin only)
  projectsList.addEventListener("change", async (e) => {
    if (e.target.classList.contains("update-status")) {
      const projectCard = e.target.closest(".project-card");
      const projectId = projectCard.getAttribute("data-id");
      const newStatus = e.target.value;

      try {
        const response = await fetch(`/api/projects/${projectId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert("Project status updated successfully!");
        projectCard.setAttribute("data-status", newStatus);
        location.reload();
      } 
      catch (error) {
        alert("Error updating project status: " + error.message);
      }
    }
  });

  // Filter projects by status
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const selectedStatus = btn.getAttribute("data-status");
      document.querySelectorAll(".project-card").forEach((card) => {
        if (selectedStatus === "all" || card.getAttribute("data-status") === selectedStatus) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
});