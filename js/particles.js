/* Particles.js Configuration for "Magical Ether" */
particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 30, /* Significantly reduced for readability */
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": ["#1a252f", "#b08d55", "#2c3e50"]
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      }
    },
    "opacity": {
      "value": 0.4, /* Lower opacity to avoid distraction */
      "random": true,
      "anim": {
        "enable": true,
        "speed": 0.5,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3, /* Smaller size */
      "random": true,
      "anim": {
        "enable": true,
        "speed": 2,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#b08d55",
      "opacity": 0.4,
      "width": 1.5
    },
    "move": {
      "enable": true,
      "speed": 1.5,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": true,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "window", /* Crucial: Detect on whole window */
    "events": {
      "onhover": {
        "enable": true,
        "mode": "bubble" /* Bubble makes them grow/glow. Repulse moves them. Let's combine or choose one. User wanted movement. Repulse is best for movement. */
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 200,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 200, /* Radius of interaction */
        "size": 6,     /* Grow size */
        "duration": 0.4,
        "opacity": 1,
        "speed": 3
      },
      "repulse": {
        "distance": 150,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});
