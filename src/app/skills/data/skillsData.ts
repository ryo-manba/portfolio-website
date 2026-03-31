export type SkillData = {
  title: string;
  imagePath: string;
  rating: number; // 1-5
};

export type SkillSubCategory = {
  label: string;
  data: SkillData[];
};

export type SkillCategory = {
  title: string;
  color: string;
  data?: SkillData[];
  subCategories?: SkillSubCategory[];
};

export const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    color: "text-blue-600",
    subCategories: [
      {
        label: "Languages",
        data: [
          { title: "TypeScript", imagePath: "https://img.icons8.com/color/48/000000/typescript.png", rating: 5 },
          { title: "JavaScript", imagePath: "https://img.icons8.com/color/48/000000/javascript.png", rating: 4 },
          { title: "HTML", imagePath: "https://img.icons8.com/color/48/000000/html-5--v1.png", rating: 4 },
          { title: "CSS", imagePath: "https://img.icons8.com/color/48/000000/css3.png", rating: 4 },
          { title: "GraphQL", imagePath: "https://img.icons8.com/color/48/000000/graphql.png", rating: 4 },
        ],
      },
      {
        label: "Frameworks",
        data: [
          { title: "React", imagePath: "https://img.icons8.com/color/48/000000/react-native.png", rating: 5 },
          { title: "Next.js", imagePath: "https://img.icons8.com/color/48/000000/nextjs.png", rating: 5 },
          { title: "Vue.js", imagePath: "https://img.icons8.com/color/48/000000/vue-js.png", rating: 3 },
          { title: "Nuxt.js", imagePath: "https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/null/external-nuxt-js-a-free-and-open-source-web-application-framework-logo-color-tal-revivo.png", rating: 3 },
          { title: "Astro", imagePath: "https://img.icons8.com/ios/50/null/star.png", rating: 3 },
        ],
      },
      {
        label: "Ecosystem & Others",
        data: [
          { title: "a11y", imagePath: "https://img.icons8.com/ios/50/null/accessibility2.png", rating: 5 },
          { title: "Linter", imagePath: "https://img.icons8.com/ios/50/null/check-all.png", rating: 5 },
          { title: "Package Manager", imagePath: "https://img.icons8.com/ios/50/null/package.png", rating: 5 },
          { title: "TailwindCSS", imagePath: "https://img.icons8.com/color/48/000000/tailwindcss.png", rating: 4 },
        ],
      },
    ],
  },
  {
    title: "Backend",
    color: "text-green-600",
    data: [
      { title: "NestJS", imagePath: "https://img.icons8.com/color/48/000000/nestjs.png", rating: 3 },
      { title: "Go", imagePath: "https://img.icons8.com/color/48/null/golang.png", rating: 3 },
      { title: "tRPC", imagePath: "https://img.icons8.com/color/48/000000/api.png", rating: 2 },
      { title: "Prisma", imagePath: "https://img.icons8.com/fluency/48/null/prisma-orm.png", rating: 3 },
      { title: "PostgreSQL", imagePath: "https://img.icons8.com/color/48/000000/postgreesql.png", rating: 3 },
      { title: "MySQL", imagePath: "https://img.icons8.com/color/48/000000/mysql-logo.png", rating: 2 },
      { title: "Spanner", imagePath: "https://img.icons8.com/color/48/000000/google-cloud.png", rating: 2 },
      { title: "Firestore", imagePath: "https://img.icons8.com/color/48/000000/firebase.png", rating: 2 },
    ],
  },
  {
    title: "Mobile",
    color: "text-teal-600",
    data: [
      { title: "React Native", imagePath: "https://img.icons8.com/color/48/000000/react-native.png", rating: 3 },
      { title: "WebView", imagePath: "https://img.icons8.com/ios/50/null/web.png", rating: 3 },
      { title: "Expo", imagePath: "https://img.icons8.com/ios/50/null/smartphone-approve.png", rating: 2 },
      { title: "Flutter", imagePath: "https://img.icons8.com/color/48/000000/flutter.png", rating: 2 },
      { title: "Dart", imagePath: "https://img.icons8.com/color/48/000000/dart.png", rating: 2 },
    ],
  },
  {
    title: "Infrastructure",
    color: "text-orange-600",
    data: [
      { title: "Docker", imagePath: "https://img.icons8.com/color/48/000000/docker.png", rating: 3 },
      { title: "GitHub Actions", imagePath: "https://img.icons8.com/bubbles/50/null/github.png", rating: 4 },
      { title: "Terraform", imagePath: "https://img.icons8.com/color/48/000000/terraform.png", rating: 3 },
      { title: "Datadog", imagePath: "/images/datadog-logo.svg", rating: 4 },
    ],
  },
  {
    title: "AI",
    color: "text-purple-600",
    data: [
      { title: "Python", imagePath: "https://img.icons8.com/color/48/000000/python.png", rating: 3 },
      { title: "RAG", imagePath: "https://img.icons8.com/ios/50/null/api.png", rating: 2 },
      { title: "LLM API", imagePath: "https://img.icons8.com/ios/50/null/api.png", rating: 3 },
      { title: "n8n", imagePath: "https://img.icons8.com/color/48/000000/workflow.png", rating: 3 },
      { title: "Mastra", imagePath: "https://img.icons8.com/ios/50/null/api.png", rating: 3 },
      { title: "MCP", imagePath: "https://img.icons8.com/ios/50/null/connection-sync.png", rating: 3 },
      { title: "Agentic Skills", imagePath: "https://img.icons8.com/ios/50/null/bot.png", rating: 4 },
      { title: "LiteLLM", imagePath: "https://img.icons8.com/ios/50/null/api.png", rating: 2 },
    ],
  },
  {
    title: "Tools",
    color: "text-indigo-600",
    data: [
      { title: "Claude Code", imagePath: "https://img.icons8.com/ios/50/null/bot.png", rating: 5 },
      { title: "Cursor", imagePath: "https://img.icons8.com/ios/50/null/cursor.png", rating: 4 },
      { title: "Codex", imagePath: "https://img.icons8.com/ios/50/null/bot.png", rating: 3 },
      { title: "Gemini CLI", imagePath: "https://img.icons8.com/color/48/000000/google-logo.png", rating: 3 },
    ],
  },
];
