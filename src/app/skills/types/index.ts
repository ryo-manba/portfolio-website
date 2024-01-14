export const Language = {
  Cpp: "C++",
  C: "C",
  Ruby: "Ruby",
  TypeScript: "TypeScript",
  JavaScript: "JavaScript",
  Go: "Go",
  HTML: "HTML",
  CSS: "CSS",
  Python: "Python",
  Java: "Java",
} as const;
type Language = (typeof Language)[keyof typeof Language];

export const Framework = {
  RubyOnRails: "Ruby on Rails",
  NextJs: "Next.js",
  NestJs: "NestJS",
  VueJs: "Vue.js",
  NuxtJs: "Nuxt.js",
} as const;
type Framework = (typeof Framework)[keyof typeof Framework];

export const Library = {
  React: "React",
  Prisma: "Prisma",
  JQuery: "jQuery",
  Rechart: "Rechart",
} as const;
type Library = (typeof Library)[keyof typeof Library];

export const UILibrary = {
  TailwindCSS: "TailwindCSS",
  MaterialUI: "Material-UI",
  StyledComponents: "styled-components",
} as const;
type UILibrary = (typeof UILibrary)[keyof typeof UILibrary];

export const Database = {
  MySQL: "MySQL",
  PostgreSQL: "PostgreSQL",
  SQLite: "SQLite",
} as const;
type Database = (typeof Database)[keyof typeof Database];

export const Tool = {
  VSCode: "VSCode",
  GitHub: "GitHub",
  Docker: "Docker",
  DockerCompose: "docker-compose",
  OpenAPI: "Open API",
  Vim: "Vim",
  GoogleTest: "Google Test",
} as const;
type Tool = (typeof Tool)[keyof typeof Tool];
