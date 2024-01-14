import { Database, Framework, Language, Library, Tool, UILibrary } from "@/app/skills/types";
import type { Project } from "@/app/works/components/ProjectCard";

const GITHUB_ICON_PATH = "https://img.icons8.com/ios-filled/500/null/github.png";

export const projects: Project[] = [
  {
    projectTitle: "ft_transcendence",
    projectLink: "https://github.com/ryo-manba/ft_transcendence",
    description:
      "クラシックPongをベースにしたチャット付きリアルタイムゲーム。難易度選択やスコアランキング、ライブ観戦が可能。公開・非公開・パスワード付きチャットルームやDM対応。42・Googleアカウントログイン機能も搭載しています。",
    imagePath: GITHUB_ICON_PATH,
    tags: [
      Language.TypeScript,
      Library.React,
      Framework.NextJs,
      Framework.NestJs,
      Library.Prisma,
      Database.PostgreSQL,
      UILibrary.MaterialUI,
      Tool.Docker,
      Tool.DockerCompose,
    ],
  },
  {
    projectTitle: "webserv",
    projectLink: "https://github.com/corvvs/webserv",
    description:
      "C++で構築されたシンプルかつ高速なNGINX風HTTPサーバー。C++98互換で、HTTP GET、HEAD、POST、PUT、およびDELETEリクエストに対応。指定したルートディレクトリから静的ファイルを配信するか、CGIを利用して動的コンテンツを生成できます。",
    imagePath: GITHUB_ICON_PATH,
    tags: [Language.Cpp, Tool.GoogleTest],
  },
  {
    projectTitle: "Yatter-backend",
    projectLink: "https://github.com/ryo-manba/Yatter-backend",
    description:
      "仮想SNSサービスのバックエンドAPIです。Twitterに似た機能を提供しています。アーキテクチャは、コアビジネスロジック、HTTPリクエストハンドラ、インフラストラクチャ層でのドメイン/リポジトリ、データベース定義マスタなど、複数の要素で構成されています。",
    imagePath: GITHUB_ICON_PATH,
    tags: [Language.Go, Tool.Docker, Tool.DockerCompose],
  },
  {
    projectTitle: "ft_containers",
    projectLink: "https://github.com/ryo-manba/ft_containers",
    description:
      "C++98を用いたSTLコンテナの再実装プロジェクト。vector、stack、mapなどのコンテナを実装しています。各コンテナはイテレータも含めて設計がされており、mapの内部実装にはAVL木を用いています。",
    imagePath: GITHUB_ICON_PATH,
    tags: [Language.Cpp],
  },
  {
    projectTitle: "cron-visualizer",
    projectLink: "https://github.com/ryo-manba/cron-visualizer",
    description:
      "cron 式を可視化するためのアプリです。任意の cron 式を入力し、それが週間のカレンダー上でどの時間に実行されるかを視覚的に確認することができます。",
    imagePath: "/images/cron-visualizer.webp",
    tags: [Language.TypeScript, Library.React, Library.Rechart],
  },
];
