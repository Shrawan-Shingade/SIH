// Main JavaScript functionality for MediFind
let resourceChart = null;
let selectedHospitalId = null;


document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("hospitalCards");
    let hospitalData = []; // Store fetched hospitals

    // Function to render hospitals from stored data
    function renderHospitals() {
        container.innerHTML = ""; // Clear previous content

        hospitalData.forEach(hospital => {
            const card = document.createElement("div");
            card.classList.add("hospital-card");

            card.innerHTML = `
                <h3>${hospital.name}</h3>
                <p>${hospital.address}</p>
                <p>General Beds: ${hospital.general_beds_available}/${hospital.general_beds_total}</p>
                <p>ICU Beds: ${hospital.icu_beds_available}/${hospital.icu_beds_total}</p>
                <p>Ventilators: ${hospital.ventilators_available}/${hospital.ventilators_total}</p>
                <p>Oxygen: ${hospital.oxygen_available}/${hospital.oxygen_total}</p>
                <p>Doctors: ${hospital.doctors}</p>
                <p>Nurses: ${hospital.nurses}</p>
                <p>Updated: ${new Date(hospital.last_updated).toLocaleString()}</p>
            `;

            container.appendChild(card);
        });
    }

    // Fetch hospital data once
    try {
        const response = await fetch("/api/hospitals/");
        const data = await response.json();
        hospitalData = data.hospitals; // Store data
        renderHospitals(); // Initial render
    } catch (error) {
        console.error("Error loading hospitals:", error);
    }

    // Auto-refresh display every 10 seconds without fetching again
    setInterval(renderHospitals, 10000);
});






// Open modal when hospital card clicked
function openResourceModal(hospitalId, hospitalName) {
    selectedHospitalId = hospitalId;
    document.getElementById("modalHospitalName").innerText = hospitalName;
    document.getElementById("resourceModal").style.display = "block";
    loadGraphData();
}

// Close modal
function closeResourceModal() {
    document.getElementById("resourceModal").style.display = "none";
}

// Fetch & display chart
function loadGraphData() {
    const interval = document.getElementById("intervalSelect").value;
    fetch(`/api/resources/${selectedHospitalId}/?interval=${interval}`)
        .then(response => response.json())
        .then(json => {
            const labels = json.data.map(item => new Date(item.timestamp).toLocaleString());
            const datasets = [
                { label: "Beds", data: json.data.map(item => item.occupied_beds), borderColor: "blue", fill: false },
                { label: "ICU", data: json.data.map(item => item.occupied_icu), borderColor: "red", fill: false },
                { label: "Oxygen", data: json.data.map(item => item.occupied_oxygen), borderColor: "green", fill: false },
                { label: "Ventilators", data: json.data.map(item => item.occupied_ventilators), borderColor: "purple", fill: false },
                { label: "Doctors", data: json.data.map(item => item.occupied_doctors), borderColor: "orange", fill: false },
                { label: "Nurses", data: json.data.map(item => item.occupied_nurses), borderColor: "brown", fill: false },
            ];

            if (resourceChart) {
                resourceChart.destroy();
            }

            const ctx = document.getElementById("resourceChart").getContext("2d");
            resourceChart = new Chart(ctx, {
                type: "line",
                data: { labels, datasets },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: "Time" } },
                        y: { title: { display: true, text: "Count" }, beginAtZero: true }
                    }
                }
            });
        });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  initializeModal()
  initializeEmergencyButton()
  initializeNotifications()
  initializeScrollEffects()
  initializeSearchFunctionality()

  // Auto-refresh data every 2 minutes
  setInterval(checkForUpdates, 120000)
}

// Modal functionality
function initializeModal() {
  const loginBtn = document.getElementById("loginBtn")
  const registerBtn = document.getElementById("registerBtn")
  const authModal = document.getElementById("authModal")
  const closeModal = document.querySelector(".close-modal")
  const modalTabs = document.querySelectorAll(".modal-tab")
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      authModal.style.display = "flex"
      document.body.style.overflow = "hidden"
    })
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      authModal.style.display = "flex"
      modalTabs[1].click()
      document.body.style.overflow = "hidden"
    })
  }

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      authModal.style.display = "none"
      document.body.style.overflow = "auto"
    })
  }

  modalTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      modalTabs.forEach((t) => t.classList.remove("active"))
      tab.classList.add("active")

      if (tab.dataset.tab === "login") {
        loginForm.style.display = "block"
        registerForm.style.display = "none"
      } else {
        loginForm.style.display = "none"
        registerForm.style.display = "block"
      }
    })
  })

  // Close modal when clicking outside
  if (authModal) {
    window.addEventListener("click", (e) => {
      if (e.target === authModal) {
        authModal.style.display = "none"
        document.body.style.overflow = "auto"
      }
    })
  }
}

// Emergency button functionality
function initializeEmergencyButton() {
  const emergencyBtn = document.querySelector(".emergency-btn")

  if (emergencyBtn) {
    emergencyBtn.addEventListener("click", () => {
      showEmergencyModal()
    })
  }
}

function showEmergencyModal() {
  const emergencyNumbers = [
    { name: "Ambulance", number: "108" },
    { name: "Emergency Services", number: "102" },
    { name: "COVID Helpline", number: "1075" },
    { name: "Fire Department", number: "101" },
    { name: "Police", number: "100" },
  ]

  let modalHTML = `
        <div class="modal" id="emergencyModal" style="display: flex;">
            <div class="modal-content">
                <button class="close-modal" onclick="closeEmergencyModal()">&times;</button>
                <h2 style="color: var(--danger); margin-bottom: 20px; text-align: center;">
                    <i class="fas fa-exclamation-triangle"></i> Emergency Contacts
                </h2>
                <div class="emergency-grid">
    `

  emergencyNumbers.forEach((contact) => {
    modalHTML += `
            <div class="emergency-contact-card">
                <h3>${contact.name}</h3>
                <a href="tel:${contact.number}" class="emergency-number">${contact.number}</a>
            </div>
        `
  })

  modalHTML += `
                </div>
                <p style="text-align: center; margin-top: 20px; color: var(--text-secondary);">
                    Tap any number to call immediately
                </p>
            </div>
        </div>
    `

  document.body.insertAdjacentHTML("beforeend", modalHTML)
  document.body.style.overflow = "hidden"
}

function closeEmergencyModal() {
  const emergencyModal = document.getElementById("emergencyModal")
  if (emergencyModal) {
    emergencyModal.remove()
    document.body.style.overflow = "auto"
  }
}

// Notification system
function initializeNotifications() {
  // Check for browser notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

function showNotification(message, type = "info", duration = 5000) {
  const notification = document.getElementById("notification")
  const content = notification.querySelector(".notification-content")
  const icon = notification.querySelector("i")

  content.textContent = message

  // Update icon and border based on type
  switch (type) {
    case "success":
      icon.className = "fas fa-check-circle"
      notification.style.borderLeftColor = "var(--success)"
      break
    case "error":
      icon.className = "fas fa-exclamation-circle"
      notification.style.borderLeftColor = "var(--danger)"
      break
    case "warning":
      icon.className = "fas fa-exclamation-triangle"
      notification.style.borderLeftColor = "var(--warning)"
      break
    default:
      icon.className = "fas fa-info-circle"
      notification.style.borderLeftColor = "var(--primary-light)"
  }

  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, duration)

  // Browser notification for important updates
  if (type === "success" && "Notification" in window && Notification.permission === "granted") {
    new Notification("MediFind Update", {
      body: message,
      icon: "/static/images/logo.png",
      badge: "/static/images/logo.png",
    })
  }
}

// Scroll effects
function initializeScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe hospital cards for scroll animations
  const hospitalCards = document.querySelectorAll(".hospital-card")
  hospitalCards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(30px)"
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`
    observer.observe(card)
  })
}

// Enhanced search functionality
function initializeSearchFunctionality() {
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")

  if (searchInput && searchBtn) {
    let searchTimeout

    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        performSearch(this.value)
      }, 300)
    })

    searchBtn.addEventListener("click", () => {
      performSearch(searchInput.value)
    })

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch(this.value)
      }
    })
  }
}

function performSearch(query) {
  const hospitalCards = document.querySelectorAll(".hospital-card")
  const searchQuery = query.toLowerCase().trim()
  let visibleCount = 0

  hospitalCards.forEach((card) => {
    const hospitalName = card.querySelector(".hospital-name").textContent.toLowerCase()
    const hospitalAddress = card.querySelector(".hospital-address").textContent.toLowerCase()
    const isVisible = hospitalName.includes(searchQuery) || hospitalAddress.includes(searchQuery) || searchQuery === ""

    card.style.display = isVisible ? "block" : "none"
    if (isVisible) visibleCount++
  })

  // Show search results feedback
  if (query && visibleCount === 0) {
    showNotification(`No hospitals found matching "${query}"`, "warning")
  } else if (query && visibleCount > 0) {
    showNotification(`Found ${visibleCount} hospital${visibleCount > 1 ? "s" : ""} matching "${query}"`, "success")
  }
}

// Auto-refresh functionality
function checkForUpdates() {
  // Simulate checking for updates
  const shouldUpdate = Math.random() > 0.7 // 30% chance of update

  if (shouldUpdate) {
    const hospitals = ["City General Hospital", "Metro Health Institute", "Regional Medical Center"]
    const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)]

    showNotification(`🔄 ${randomHospital} availability updated`, "info")

    // Add visual indicator to updated hospital card
    const hospitalCards = document.querySelectorAll(".hospital-card")
    hospitalCards.forEach((card) => {
      const hospitalName = card.querySelector(".hospital-name").textContent
      if (hospitalName.includes(randomHospital)) {
        card.style.borderColor = "var(--success)"
        card.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.3)"

        setTimeout(() => {
          card.style.borderColor = "var(--border-primary)"
          card.style.boxShadow = "var(--shadow-md)"
        }, 3000)
      }
    })
  }
}


// Error handling
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error)
  showNotification("An error occurred. Please refresh the page.", "error")
})

// Service Worker registration for offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful")
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed")
      })
  })
}

// Add CSS for emergency modal
const emergencyModalCSS = `
    .emergency-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }
    
    .emergency-contact-card {
        background: var(--bg-secondary);
        border: 2px solid var(--danger);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .emergency-contact-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .emergency-contact-card h3 {
        color: var(--text-primary);
        margin-bottom: 10px;
        font-size: 1.1rem;
    }
    
    .emergency-number {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--danger);
        text-decoration: none;
        padding: 10px;
        border-radius: 8px;
        background: rgba(239, 68, 68, 0.1);
        transition: all 0.3s ease;
    }
    
    .emergency-number:hover {
        background: var(--danger);
        color: var(--text-primary);
        transform: scale(1.05);
    }
`

// Inject emergency modal CSS
const style = document.createElement("style")
style.textContent = emergencyModalCSS
document.head.appendChild(style)
