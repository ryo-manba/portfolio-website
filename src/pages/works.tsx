import { ProjectCard } from '../components/ProjectCard/ProjectCard';
import type { Project } from '../components/ProjectCard/ProjectCard';

const GITHUB_ICON_PATH = '/images/github-mark.png';
const projects: Project[] = [
  {
    projectTitle: 'ft_transcendence',
    projectLink: 'https://github.com/ryo-manba/ft_transcendence',
    description:
      'クラシックPongをベースにしたチャット付きリアルタイムゲーム。難易度選択やスコアランキング、ライブ観戦が可能。公開・非公開・パスワード付きチャットルームやDM対応。42・Googleアカウントログイン機能も搭載しています。',
    imagePath: GITHUB_ICON_PATH,
    tags: [
      'TypeScript',
      'React',
      'Next.js',
      'NestJS',
      'Prisma',
      'PostgreSQL',
      'Material-UI',
      'Docker',
      'docker-compose',
    ],
  },
  {
    projectTitle: 'webserv',
    projectLink: 'https://github.com/corvvs/webserv',
    description:
      'C++で構築されたシンプルかつ高速なNGINX風HTTPサーバー。C++98互換で、HTTP GET、HEAD、POST、PUT、およびDELETEリクエストに対応。指定したルートディレクトリから静的ファイルを配信するか、CGIを利用して動的コンテンツを生成できます。',
    imagePath: GITHUB_ICON_PATH,
    tags: ['C++', 'Google Test'],
  },
  {
    projectTitle: 'Yatter-backend',
    projectLink: 'https://github.com/ryo-manba/Yatter-backend',
    description:
      '仮想SNSサービスのバックエンドAPIです。Twitterに似た機能を提供しています。アーキテクチャは、コアビジネスロジック、HTTPリクエストハンドラ、インフラストラクチャ層でのドメイン/リポジトリ、データベース定義マスタなど、複数の要素で構成されています。',
    imagePath: GITHUB_ICON_PATH,
    tags: ['Go', 'Docker', 'docker-compose'],
  },
  {
    projectTitle: 'ft_containers',
    projectLink: 'https://github.com/ryo-manba/ft_containers',
    description:
      'C++98を用いたSTLコンテナの再実装プロジェクト。vector、stack、mapなどのコンテナを実装しています。各コンテナはイテレータも含めて設計がされており、mapの内部実装にはAVL木を用いています。',
    imagePath: GITHUB_ICON_PATH,
    tags: ['C++'],
  },
];

const Works = () => {
  return (
    <div className="mt-12">
      <h1 className="text-center text-4xl font-bold mb-5">Works</h1>
      <div className="flex justify-center my-8 mx-44">
        <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.projectTitle}
              projectTitle={project.projectTitle}
              projectLink={project.projectLink}
              description={project.description}
              imagePath={project.imagePath}
              tags={project.tags}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Works;
