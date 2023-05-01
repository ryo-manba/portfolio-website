import Image from 'next/image';

const languages = [
  {
    title: 'C++',
    imagePath: 'https://img.icons8.com/color/48/000000/c-plus-plus-logo.png',
  },
  {
    title: 'C',
    imagePath: 'https://img.icons8.com/color/48/000000/c-programming.png',
  },
  {
    title: 'Ruby',
    imagePath:
      'https://img.icons8.com/color/48/000000/ruby-programming-language.png',
  },
  {
    title: 'TypeScript',
    imagePath: 'https://img.icons8.com/color/48/000000/typescript.png',
  },
  {
    title: 'JavaScript',
    imagePath: 'https://img.icons8.com/color/48/000000/javascript.png',
  },
  {
    title: 'Go',
    imagePath: 'https://img.icons8.com/color/48/null/golang.png',
  },
  {
    title: 'HTML',
    imagePath: 'https://img.icons8.com/color/48/000000/html-5--v1.png',
  },
  {
    title: 'CSS',
    imagePath: 'https://img.icons8.com/color/48/000000/css3.png',
  },
  {
    title: 'Python',
    imagePath: 'https://img.icons8.com/color/48/000000/python.png',
  },
  {
    title: 'Java',
    imagePath:
      'https://img.icons8.com/color/48/000000/java-coffee-cup-logo--v1.png',
  },
];

const frameworks = [
  {
    title: 'Ruby on Rails',
    imagePath: 'https://img.icons8.com/windows/64/null/ruby-on-rails.png',
  },
  {
    title: 'Next.js',
    imagePath: 'https://img.icons8.com/color/48/000000/nextjs.png',
  },
  {
    title: 'NestJS',
    imagePath: 'https://img.icons8.com/color/48/000000/nestjs.png',
  },
  {
    title: 'Vue',
    imagePath: 'https://img.icons8.com/color/48/000000/vue-js.png',
  },
  {
    title: 'Nuxt.js',
    imagePath:
      'https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/null/external-nuxt-js-a-free-and-open-source-web-application-framework-logo-color-tal-revivo.png',
  },
];
const libraries = [
  {
    title: 'React',
    imagePath: 'https://img.icons8.com/color/48/000000/react-native.png',
  },
  {
    title: 'Prisma',
    imagePath: 'https://img.icons8.com/fluency/48/null/prisma-orm.png',
  },
  {
    title: 'jQuery',
    imagePath: 'https://img.icons8.com/ios-filled/50/null/jquery.png',
  },
];

const tools = [
  {
    title: 'Docker',
    imagePath: 'https://img.icons8.com/color/48/000000/docker.png',
  },
  {
    title: 'docker-compose',
    imagePath: 'https://img.icons8.com/color/48/000000/docker.png',
  },
  // {
  //   title: 'Open API',
  //   imagePath: 'https://img.icons8.com/color/48/000000/openapi.png',
  // },
  {
    title: 'GitHub',
    imagePath: 'https://img.icons8.com/bubbles/50/null/github.png',
  },
  {
    title: 'VSCode',
    imagePath:
      'https://img.icons8.com/color/48/000000/visual-studio-code-2019.png',
  },
  {
    title: 'Vim',
    imagePath:
      'https://img.icons8.com/external-tal-revivo-green-tal-revivo/72/null/external-vim-a-highly-configurable-text-editor-for-efficiently-creating-and-changing-any-kind-of-text-logo-green-tal-revivo.png',
  },
];

const uiLibraries = [
  {
    title: 'Material-UI',
    imagePath: 'https://img.icons8.com/color/48/000000/material-ui.png',
  },
  {
    title: 'TailwindCSS',
    imagePath: 'https://img.icons8.com/color/48/000000/tailwindcss.png',
  },
  {
    title: 'styled-components',
    imagePath: 'https://img.icons8.com/color/48/null/styled-components.png', // オフィシャルロゴを使用
  },
];

type SkillProps = {
  title: string;
  imagePath: string;
  description?: string;
};

const Skill = ({ title, imagePath, description = '' }: SkillProps) => {
  return (
    <div className="p-4 text-gray-300 cursor-pointer">
      <div className="flex flex-col items-center py-2 mb-2 relative group">
        <div className="w-24 h-24 relative rounded-full bg-white flex justify-center items-center z-10 transition-transform duration-300 ease-in-out group-hover:-translate-y-1">
          <Image
            className="w-12 x-10"
            src={imagePath}
            width={100}
            height={100}
            alt={`${title}の画像`}
          />
        </div>
        <div className="absolute bottom-0 right-1/2 w-0 h-1 bg-green-500 rounded-l transition-all duration-500 group-hover:w-9"></div>
        <div className="absolute bottom-0 left-1/2 w-0 h-1 bg-green-500 rounded-r transition-all duration-500 group-hover:w-9"></div>
        <h3 className="text-white mt-2">{title}</h3>
      </div>
      <p className="text-base">{description}</p>
    </div>
  );
};

export const TechnicalSkills = () => {
  return (
    <div className="bg-gray-800">
      <div className="pt-5">
        <div className="text-center text-white py-4 relative">
          <h1 className="text-4xl font-semibold leading-none">
            Skills & Abilities
          </h1>
          <p>(Experience Order)</p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-40 bg-green-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 justify-items-center items-center text-center gap-4 p-10 text-xl max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white col-span-full mb-2">
            Languages
          </h2>
          {languages.map((language) => (
            <Skill
              key={language.title}
              title={language.title}
              imagePath={language.imagePath}
            />
          ))}
          <h2 className="text-2xl font-semibold text-white col-span-full mb-2">
            Frameworks
          </h2>
          {frameworks.map((framework) => (
            <Skill
              key={framework.title}
              title={framework.title}
              imagePath={framework.imagePath}
            />
          ))}
          <h2 className="text-2xl font-semibold text-white col-span-full mb-2">
            Libraries
          </h2>
          {libraries.map((library) => (
            <Skill
              key={library.title}
              title={library.title}
              imagePath={library.imagePath}
            />
          ))}
          <h2 className="text-2xl font-semibold text-white col-span-full mb-2">
            Ui Libraries
          </h2>
          {uiLibraries.map((library) => (
            <Skill
              key={library.title}
              title={library.title}
              imagePath={library.imagePath}
            />
          ))}

          <h2 className="text-2xl font-semibold text-white col-span-full mb-2">
            Tools
          </h2>
          {tools.map((tool) => (
            <Skill
              key={tool.title}
              title={tool.title}
              imagePath={tool.imagePath}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
