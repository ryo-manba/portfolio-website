const languages = [
  'C',
  'C++',
  'Go',
  'TypeScript',
  'React',
  'Next.js',
  'NestJS',
  'Nuxt.js',
  'JavaScript',
  'jQuery',
  'HTML',
  'CSS',
];

type SkillProps = {
  imagePath: string;
  title: string;
  description: string;
};

const Skill = ({ imagePath, title, description }: SkillProps) => {
  return (
    <div className="skill-box">
      <div className="skill-title">
        <div className="img">
          <img className="skill-icon" src={imagePath} />
          {/* <Image
        className="skill-icon"
        src={imagePath}
        width={100}
        height={100}
        alt={`${title}の画像`}
      /> */}
        </div>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
    </div>
  );
};

export const TechnicalSkills = () => {
  return (
    <div className="inner">
      <div className="header">
        <h1>My Skills</h1>
      </div>
      <div className="container">
        <Skill
          title="HTML5"
          imagePath="https://img.icons8.com/color/48/000000/html-5--v1.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="CSS3"
          imagePath="https://img.icons8.com/color/48/000000/css3.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="PostgreSQL"
          imagePath="https://img.icons8.com/color/48/000000/postgreesql.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="C++"
          imagePath="https://img.icons8.com/fluency/48/null/c-plus-plus-logo.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="ReactJS"
          imagePath="https://img.icons8.com/external-tal-revivo-color-tal-revivo/48/000000/external-react-a-javascript-library-for-building-user-interfaces-logo-color-tal-revivo.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          imagePath="/images/note-mark.png"
          title="TypeScript"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="JavaScript"
          imagePath="https://img.icons8.com/color/48/000000/javascript--v1.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="jQuery"
          imagePath="https://img.icons8.com/ios-filled/48/1169ae/jquery.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="TailwindCSS"
          imagePath="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/48px-Tailwind_CSS_Logo.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="materialUI"
          imagePath="https://img.icons8.com/color/48/000000/material-ui.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
        <Skill
          title="GitHub"
          imagePath="https://img.icons8.com/glyph-neue/48/ffffff/github.png"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                           commodo consequat."
        />
      </div>
    </div>
  );
};
