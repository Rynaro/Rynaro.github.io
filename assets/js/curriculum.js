var skillElement = document.getElementById("skill-radar");
var codingSkills = new Chart(skillElement, {
  type: 'radar',
  data: {
    labels: ['Ruby', 'Elixir', 'Java', 'Go', 'PHP', 'Python', 'Javascript'],
    datasets: [{
      label: 'Languages Knowledge',
      backgroundColor: "rgba(84, 13, 110, 0.2)",
      borderColor: "rgb(84, 13, 110)",
      fill: true,
      data: [95, 65, 90, 45, 70, 85, 90]
    }]
  },
  options: {
    scale:{
      ticks: {
        beginAtZero: true,
        min: 0
      }
    }
  }
});


var toolingElement = document.getElementById("tooling-radar");
var toolingSkills = new Chart(toolingElement, {
  type: 'radar',
  data: {
    labels: [
      'AWS',
      'Docker',
      'Vagrant',
      'Relational Databases',
      'NoSQL Databases',
      'Linux'
    ],
    datasets: [{
      label: 'Tooling Knowledge',
      fill: true,
      backgroundColor: "rgba(238, 68, 102, 0.2)",
      borderColor: "rgb(238, 68, 102)",
      data: [90, 70, 95, 90, 75, 100]
    }]
  },
  options: {
    scale:{
      ticks: {
        beginAtZero: true,
        min: 0
      }
    }
  }
});

var languageElement = document.getElementById("language-bar");
var languageSkills = new Chart(languageElement, {
  type: 'bar',
  data: {
    labels: [
      'Portuguese',
      'English',
      'Spanish',
    ],
    datasets: [{
      label: 'Language Knowledge',
      fill: true,
      backgroundColor: [
        "rgba(255, 210, 63, 0.2)",
        "rgba(84, 13, 110, 0.2)",
        "rgba(166, 71, 81, 0.2)"
      ],
      borderColor: [
        "rgb(255, 210, 63)",
        "rgb(84, 13, 110)",
        "rgb(166, 71, 81)"
      ],
      borderWidth: 1,
      data: [100, 85, 25]
    }]
  },
  options: {
    scales:{
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
});
