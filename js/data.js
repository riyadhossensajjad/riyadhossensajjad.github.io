/* ============================================================
   SITE DATA
   Edit everything in this file to update site content.
   No need to touch HTML, CSS, or the other JS files.
   ============================================================ */

/* ---- Identity & roles shown in the rotating hero text ----
   The first entry is the name itself — it cycles in the same
   spot as the roles, right after the static "I am". */
const ROLES = [
  "Riyad Hossen Sajjad",
  "CSE Student",
  "Astrophysics Enthusiast",
  "Children's Book Illustrator"
];

/* ---- Social / professional links ----
   Replace the '#' values with real profile URLs whenever ready. */
const SOCIAL_LINKS = [
  { name: "LinkedIn",  url: "https://www.linkedin.com/in/riyadhossensajjad/", icon: "linkedin" },
  { name: "GitHub",    url: "https://github.com/riyadhossensajjad", icon: "github" },
  { name: "Behance",   url: "https://www.behance.net/riyadillustration", icon: "behance" },
  { name: "Instagram", url: "https://www.instagram.com/riyadillustration/", icon: "instagram" }
];

/* ---- About section skill bars ---- */
const ABOUT_SKILLS = [
  { label: "Development",  value: 80 },
  { label: "Web Design",   value: 70 },
  { label: "Illustration", value: 95 }
];

/* ---- Education timeline ----
   Shown as three stops along a connecting line, oldest to newest
   from left to right (or top to bottom on small screens). */
const EDUCATION = [
  {
    period: "2019",
    degree: "Secondary School Certificate (Science)",
    gpa: "GPA: 5.00",
    school: "Monipur High School, Dhaka"
  },
  {
    period: "2021",
    degree: "Higher Secondary Certificate (Science)",
    gpa: "GPA: 5.00",
    school: "Adamjee Cantonment College, Dhaka"
  },
  {
    period: "2028",
    degree: "B.Sc. in Computer Science and Engineering",
    gpa: "5th Semester",
    school: "University of Asia Pacific"
  }
];

/* ---- Skills section: two editable groups ----
   level is 0-100 and only drives the fill width of the bar. */
const PROGRAMMING_SKILLS = [
  { 
    name: "C++", 
    level: 75, 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-plain.svg" 
  },
  { 
    name: "Python", 
    level: 85, 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-plain.svg" 
  },
  { 
    name: "HTML", 
    level: 90, 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg" 
  },
  { 
    name: "CSS", 
    level: 88, 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-plain.svg" 
  },
  { 
    name: "SQL", 
    level: 65, 
    icon: true,
    svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#485563" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>`
  },
  { 
    name: "Java", 
    level: 70, 
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-plain.svg" 
  }
];

const SOFTWARE_SKILLS = [
  { name: "Adobe Photoshop",   level: 92},
  { name: "Adobe Illustrator", level: 88},
  { name: "Procreate",         level: 95},
  { name: "Procreate Dreams",  level: 70},
  { name: "Nomad Sculpt",      level: 55}
];

/* ---- Portfolio items ----
   category must be one of:
   'certificate' | 'award' | 'scholarship' | 'illustration' | 'project'
   image points to an SVG placeholder in /assets — swap for real artwork anytime. */
const PORTFOLIO_ITEMS = [
  {
    title: "Silver Honor in the International Astronomy and Astrophysics Competition 2021",
    category: "certificate",
    image: "assets/badge-certificate.jpg",
    description: "Solving final round questions, which required comprehensive astronomy & astrophysics knowledge, placed me among the top 10% of all participants and earned me a SILVER HONOR.",
    link: "#"
  },
  {
    title: "Lauren Robel Bicentennial Scholarship by Indiana University Bloomington",
    category: "scholarship",
    image: "assets/badge-scholarship.jpg",
    description: "Offered $40000 (for four years) to continue my undergraduate degree in Astronomy and Astrophysics.",
    link: "#"
  },
  {
    title: "St. Thomas Aquinas Scholarship by Caldwell University",
    category: "scholarship",
    image: "assets/badge-scholarship-3.jpg",
    description: "Offered $33000 per year for four years to continue my undergraduate degree in Computer Science and Engineering.",
    link: "#"
  },
  {
    title: "Bronze Award in the Duke of Edinburgh Award 2022",
    category: "award",
    image: "assets/badge-award.jpg",
    description: "The Duke of Edinburgh's International Award is a global youth development program; it challenges participants to set personal goals in community service, physical fitness, skill building, and outdoor expeditions.",
    link: "#"
  },
  {
    title: "Grocery Management System",
    category: "project",
    image: "assets/badge-project.jpg",
    description: "An app, built using Java, that tracks the A to Z of each grocery item in a specific kitchen.",
    link: "#"
  },
  {
    title: "Silver Honor in the Queen's Commonwealth Writing Competition 2025",
    category: "certificate",
    image: "assets/badge-certificate-2.jpg",
    description: "The Queen's Commonwealth Writing Competition invites young people from across Commonwealth countries to write pieces exploring vital global themes and shared values.",
    link: "#"
  },
  {
    title: "Supermarket Billing Management System",
    category: "project",
    image: "assets/badge-project-2.jpg",
    description: "A software, built using HTML, CSS, JavaScript, and SQL, that manages billing, logistics info, customer info, product info, and stores them into DATABASE",
    link: "#"
  },
  {
    title: "Placed 3rd in the ACC Intra Art Competition 2021",
    category: "award",
    image: "assets/badge-award-2.jpg",
    description: "Earned 3rd position in the intra-college art competitions and received special recognition from the Principal.",
    link: "#"
  },
  {
    title: "Herrmann Merit Award by Mercyhurst University",
    category: "scholarship",
    image: "assets/badge-scholarship-2.jpg",
    description: "Offered $27000 per year for four years to continue my undergraduate degree in Physics. ",
    link: "#"
  }
];

/* ---- Testimonials ---- */
const TESTIMONIALS = [
  {
    quote: "Riyad was thorough and detailed. He took direction well and created the scenes for our book with ease. Even in different time zones, he was always working to get the material finished when I asked for it. We look forward to working with him more in the future!",
    name: "Nichole Stoffers",
    role: "Children's Book Author"
  },
  {
    // FIX: Changed curly quotes “ ” to regular straight quotes " "
    quote: "Riyad is a determined, responsible, and compassionate individual whose academic perseverance and commitment to helping others truly set him apart. His leadership, kindness, and sense of responsibility make him someone who leaves a meaningful positive impact on his community.",
    name: "Zakia Sultana",
    role: "ACC School Counselor"
  },
  {
    quote: "Riyad’s intellectual curiosity, resilience, and passion for physics and astronomy truly set him apart. His dedication to problem-solving and ability to inspire and guide others make him an exceptional student.",
    name: "Saiful Islam",
    role: "Associate Professor of Physics"
  }
];


/* ---- Stats / counters ---- */
const STATS = [
  { label: "Customers", value: 20, suffix: "" },
  { label: "Complete Projects", value: 50, suffix: "+" }
];

/* ---- Contact info ---- */
const CONTACT_INFO = {
  email: "riyadhossensajjad@gmail.com",
  location: "Dhaka, Bangladesh"
};
